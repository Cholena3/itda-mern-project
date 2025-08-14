const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const searchService = require('../services/searchService');
const Project = require('../models/Project');
const Scheme = require('../models/Scheme');
const Work = require('../models/Work');

// Advanced search endpoint
router.post('/advanced', auth, async (req, res) => {
  try {
    const { query, filters } = req.body;
    
    // Build MongoDB query with filters
    const mongoQuery = {};
    
    // Add text search if query provided
    if (query && query.trim()) {
      const searchRegex = new RegExp(query, 'i');
      mongoQuery.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Apply filters
    const filterQuery = {};
    if (filters.status && filters.status !== '') {
      filterQuery.status = filters.status;
    }
    if (filters.category && filters.category !== '') {
      filterQuery.category = filters.category;
    }
    if (filters.type && filters.type !== '') {
      filterQuery.type = filters.type;
    }
    if (filters.progressMin !== undefined && filters.progressMin > 0) {
      filterQuery.progress = { $gte: filters.progressMin };
    }
    if (filters.budgetRange && filters.budgetRange.length === 2) {
      filterQuery.budget = { 
        $gte: filters.budgetRange[0], 
        $lte: filters.budgetRange[1] 
      };
    }
    
    // Combine query and filters
    const finalQuery = { ...mongoQuery, ...filterQuery };
      
      // Search in MongoDB with filters
      const [projects, schemes, works] = await Promise.all([
        Project.find(finalQuery).limit(20),
        Scheme.find(finalQuery).limit(20),
        Work.find(finalQuery).limit(20)
      ]);
      
      const combinedResults = [
        ...projects.map(p => ({
          id: p._id,
          title: p.name,
          type: 'project',
          description: p.description || '',
          score: 0.9,
          tags: ['project', p.scheme_id?.name || 'scheme'].filter(Boolean),
          metrics: {
            progress: p.progress || 0,
            budget: p.budget || 0,
            location: p.location || ''
          }
        })),
        ...schemes.map(s => ({
          id: s._id,
          title: s.name,
          type: 'scheme',
          description: s.description || '',
          score: 0.85,
          tags: ['scheme'],
          metrics: {
            budget: s.budget || 0
          }
        })),
        ...works.map(w => ({
          id: w._id,
          title: w.name,
          type: 'work',
          description: w.description || '',
          score: 0.8,
          tags: ['work', w.status || 'active'].filter(Boolean),
          metrics: {
            progress: w.progress || 0,
            budget: w.budget || 0
          }
        }))
      ];
      
      res.json({ 
        results: combinedResults,
        total: combinedResults.length,
        facets: {
          status: [],
          categories: [],
          types: []
        }
      });
  } catch (error) {
    console.error('Advanced search error:', error);
    res.status(500).json({ error: 'Search failed', results: [] });
  }
});

// Natural language search endpoint
router.post('/natural', auth, async (req, res) => {
  try {
    const { query, filters } = req.body;
    
    // Process natural language query
    const processedQuery = await searchService.processNaturalLanguage(query);
    
    // Search with processed query
    const results = await searchService.search(processedQuery, filters);
    
    res.json({ 
      results: results || [],
      interpretation: processedQuery,
      confidence: 0.9
    });
  } catch (error) {
    console.error('Natural language search error:', error);
    
    // Fallback search
    const searchRegex = new RegExp(req.body.query, 'i');
    const projects = await Project.find({ name: searchRegex }).limit(10);
    
    res.json({ 
      results: projects.map(p => ({
        id: p._id,
        title: p.name,
        type: 'project',
        description: p.description || '',
        score: 0.7
      }))
    });
  }
});

// Search suggestions endpoint
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    // Get suggestions from search service
    const suggestions = await searchService.getSuggestions(q);
    
    if (!suggestions || suggestions.length === 0) {
      // Fallback suggestions
      const regex = new RegExp(`^${q}`, 'i');
      
      const [projects, schemes] = await Promise.all([
        Project.find({ name: regex }).limit(3).select('name'),
        Scheme.find({ name: regex }).limit(3).select('name')
      ]);
      
      const fallbackSuggestions = [
        ...projects.map(p => p.name),
        ...schemes.map(s => s.name),
        `${q} projects`,
        `${q} schemes`,
        `${q} in progress`,
        `${q} completed`
      ];
      
      res.json({ suggestions: fallbackSuggestions.slice(0, 5) });
    } else {
      res.json({ suggestions });
    }
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({ suggestions: [] });
  }
});

// Faceted search endpoint
router.post('/facets', auth, async (req, res) => {
  try {
    const { query } = req.body;
    
    // Get facets from search service or database
    const [statusFacets, districtFacets, typeFacets] = await Promise.all([
      Work.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Project.aggregate([
        { $group: { _id: '$district', count: { $sum: 1 } } }
      ]),
      Work.aggregate([
        { $group: { _id: '$work_type', count: { $sum: 1 } } }
      ])
    ]);
    
    res.json({
      facets: {
        status: statusFacets.map(f => ({ name: f._id || 'Unknown', count: f.count })),
        districts: districtFacets.filter(f => f._id).map(f => ({ name: f._id, count: f.count })),
        types: typeFacets.filter(f => f._id).map(f => ({ name: f._id, count: f.count }))
      }
    });
  } catch (error) {
    console.error('Facets error:', error);
    res.json({ 
      facets: {
        status: [],
        districts: [],
        types: []
      }
    });
  }
});

module.exports = router;