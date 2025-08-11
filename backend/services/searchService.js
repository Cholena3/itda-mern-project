const { Client } = require('@elastic/elasticsearch');
const { cache } = require('../config/redis');

class SearchService {
  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      auth: {
        username: process.env.ELASTIC_USERNAME || 'elastic',
        password: process.env.ELASTIC_PASSWORD || 'changeme'
      },
      maxRetries: 5,
      requestTimeout: 60000,
      sniffOnStart: true
    });

    this.indices = {
      projects: 'itda_projects',
      schemes: 'itda_schemes',
      works: 'itda_works',
      users: 'itda_users',
      logs: 'itda_logs',
      analytics: 'itda_analytics'
    };

    this.initializeIndices();
  }

  // Initialize Elasticsearch indices with mappings
  async initializeIndices() {
    try {
      // Create project index with custom analyzers
      await this.createIndexIfNotExists(this.indices.projects, {
        settings: {
          number_of_shards: 2,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              autocomplete: {
                tokenizer: 'autocomplete',
                filter: ['lowercase']
              },
              autocomplete_search: {
                tokenizer: 'lowercase'
              }
            },
            tokenizer: {
              autocomplete: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 10,
                token_chars: ['letter', 'digit']
              }
            }
          }
        },
        mappings: {
          properties: {
            projCode: { type: 'keyword' },
            projName: {
              type: 'text',
              analyzer: 'autocomplete',
              search_analyzer: 'autocomplete_search',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            description: { type: 'text' },
            location: {
              properties: {
                coordinates: { type: 'geo_point' },
                district: { type: 'keyword' },
                mandal: { type: 'keyword' },
                village: { type: 'keyword' }
              }
            },
            budget: { type: 'double' },
            progress: { type: 'float' },
            status: { type: 'keyword' },
            tags: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            searchableText: { type: 'text' },
            suggest: {
              type: 'completion',
              analyzer: 'simple',
              preserve_separators: true,
              preserve_position_increments: true,
              max_input_length: 50
            }
          }
        }
      });

      console.log('Elasticsearch indices initialized');
    } catch (error) {
      console.error('Elasticsearch initialization error:', error);
    }
  }

  // Create index if it doesn't exist
  async createIndexIfNotExists(index, body) {
    const exists = await this.client.indices.exists({ index });
    if (!exists) {
      await this.client.indices.create({ index, body });
    }
  }

  // Index a document
  async indexDocument(index, id, document) {
    try {
      const result = await this.client.index({
        index,
        id,
        body: {
          ...document,
          indexedAt: new Date().toISOString()
        },
        refresh: true
      });

      // Invalidate search cache
      await cache.clearPattern(`search:${index}:*`);

      return result;
    } catch (error) {
      console.error('Indexing error:', error);
      throw error;
    }
  }

  // Bulk index documents
  async bulkIndex(index, documents) {
    try {
      const body = documents.flatMap(doc => [
        { index: { _index: index, _id: doc.id } },
        doc
      ]);

      const result = await this.client.bulk({ body, refresh: true });

      if (result.errors) {
        const erroredDocuments = [];
        result.items.forEach((action, i) => {
          const operation = Object.keys(action)[0];
          if (action[operation].error) {
            erroredDocuments.push({
              status: action[operation].status,
              error: action[operation].error,
              document: documents[i]
            });
          }
        });
        console.error('Bulk indexing errors:', erroredDocuments);
      }

      return result;
    } catch (error) {
      console.error('Bulk indexing error:', error);
      throw error;
    }
  }

  // Advanced search with facets and aggregations
  async search(params) {
    const {
      index = this.indices.projects,
      query,
      filters = {},
      sort = { _score: 'desc' },
      from = 0,
      size = 20,
      aggregations = true
    } = params;

    try {
      // Check cache first
      const cacheKey = `search:${JSON.stringify(params)}`;
      const cached = await cache.get(cacheKey);
      if (cached) return cached;

      const searchBody = {
        from,
        size,
        sort: [sort],
        query: this.buildQuery(query, filters),
        highlight: {
          fields: {
            '*': {
              pre_tags: ['<mark>'],
              post_tags: ['</mark>']
            }
          }
        }
      };

      // Add aggregations for faceted search
      if (aggregations) {
        searchBody.aggs = {
          status: {
            terms: { field: 'status' }
          },
          districts: {
            terms: { field: 'location.district', size: 50 }
          },
          budget_ranges: {
            range: {
              field: 'budget',
              ranges: [
                { to: 100000 },
                { from: 100000, to: 500000 },
                { from: 500000, to: 1000000 },
                { from: 1000000 }
              ]
            }
          },
          progress_histogram: {
            histogram: {
              field: 'progress',
              interval: 10
            }
          },
          timeline: {
            date_histogram: {
              field: 'createdAt',
              calendar_interval: 'month'
            }
          }
        };
      }

      const result = await this.client.search({
        index,
        body: searchBody
      });

      const response = {
        total: result.hits.total.value,
        hits: result.hits.hits.map(hit => ({
          ...hit._source,
          _id: hit._id,
          _score: hit._score,
          highlight: hit.highlight
        })),
        aggregations: result.aggregations,
        took: result.took
      };

      // Cache for 5 minutes
      await cache.set(cacheKey, response, 300);

      return response;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // Build complex query with filters
  buildQuery(query, filters) {
    const must = [];
    const filter = [];

    // Text search
    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ['projName^3', 'description^2', 'searchableText'],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });
    }

    // Apply filters
    if (filters.status) {
      filter.push({ term: { status: filters.status } });
    }

    if (filters.district) {
      filter.push({ term: { 'location.district': filters.district } });
    }

    if (filters.budgetMin || filters.budgetMax) {
      const range = { budget: {} };
      if (filters.budgetMin) range.budget.gte = filters.budgetMin;
      if (filters.budgetMax) range.budget.lte = filters.budgetMax;
      filter.push({ range });
    }

    if (filters.progressMin !== undefined) {
      filter.push({ range: { progress: { gte: filters.progressMin } } });
    }

    if (filters.dateFrom || filters.dateTo) {
      const range = { createdAt: {} };
      if (filters.dateFrom) range.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) range.createdAt.lte = filters.dateTo;
      filter.push({ range });
    }

    // Geo-spatial filter
    if (filters.location && filters.radius) {
      filter.push({
        geo_distance: {
          distance: `${filters.radius}km`,
          'location.coordinates': filters.location
        }
      });
    }

    return {
      bool: {
        must: must.length > 0 ? must : [{ match_all: {} }],
        filter
      }
    };
  }

  // Autocomplete suggestions
  async suggest(prefix, field = 'suggest') {
    try {
      const result = await this.client.search({
        index: this.indices.projects,
        body: {
          suggest: {
            suggestions: {
              prefix,
              completion: {
                field,
                size: 10,
                fuzzy: {
                  fuzziness: 'AUTO'
                }
              }
            }
          }
        }
      });

      return result.suggest.suggestions[0].options.map(option => ({
        text: option.text,
        score: option._score,
        source: option._source
      }));
    } catch (error) {
      console.error('Suggest error:', error);
      return [];
    }
  }

  // More Like This - find similar documents
  async findSimilar(documentId, index = this.indices.projects) {
    try {
      const result = await this.client.search({
        index,
        body: {
          query: {
            more_like_this: {
              fields: ['projName', 'description', 'tags'],
              like: [
                {
                  _index: index,
                  _id: documentId
                }
              ],
              min_term_freq: 1,
              max_query_terms: 12
            }
          }
        }
      });

      return result.hits.hits.map(hit => ({
        ...hit._source,
        _id: hit._id,
        _score: hit._score
      }));
    } catch (error) {
      console.error('Similar search error:', error);
      return [];
    }
  }

  // Percolator - saved searches/alerts
  async registerPercolator(name, query) {
    try {
      await this.client.index({
        index: 'itda_percolators',
        id: name,
        body: {
          query: this.buildQuery(query.text, query.filters),
          metadata: {
            name,
            createdAt: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Percolator registration error:', error);
    }
  }

  // Check if document matches any saved searches
  async percolate(document) {
    try {
      const result = await this.client.search({
        index: 'itda_percolators',
        body: {
          query: {
            percolate: {
              field: 'query',
              document
            }
          }
        }
      });

      return result.hits.hits.map(hit => hit._source.metadata);
    } catch (error) {
      console.error('Percolate error:', error);
      return [];
    }
  }

  // Analytics queries
  async getAnalytics(timeRange = '7d') {
    try {
      const result = await this.client.search({
        index: this.indices.analytics,
        body: {
          size: 0,
          query: {
            range: {
              timestamp: {
                gte: `now-${timeRange}`
              }
            }
          },
          aggs: {
            searches_over_time: {
              date_histogram: {
                field: 'timestamp',
                calendar_interval: 'day'
              }
            },
            top_queries: {
              terms: {
                field: 'query.keyword',
                size: 10
              }
            },
            avg_response_time: {
              avg: {
                field: 'responseTime'
              }
            },
            search_types: {
              terms: {
                field: 'searchType.keyword'
              }
            }
          }
        }
      });

      return result.aggregations;
    } catch (error) {
      console.error('Analytics error:', error);
      return null;
    }
  }

  // Delete document
  async deleteDocument(index, id) {
    try {
      await this.client.delete({
        index,
        id,
        refresh: true
      });

      await cache.clearPattern(`search:${index}:*`);
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  // Reindex data
  async reindex(sourceIndex, targetIndex) {
    try {
      await this.client.reindex({
        body: {
          source: { index: sourceIndex },
          dest: { index: targetIndex }
        }
      });
    } catch (error) {
      console.error('Reindex error:', error);
    }
  }
}

module.exports = new SearchService();