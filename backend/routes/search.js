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
    const { query, filters = {} } = req.body;
    
    // Build separate queries for each collection type
    const projectQuery = {};
    const schemeQuery = {};
    const workQuery = {};
    
    // Add text search if query provided
    if (query && query.trim()) {
      const searchRegex = new RegExp(query, 'i');
      const textSearch = {
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      };
      Object.assign(projectQuery, textSearch);
      Object.assign(schemeQuery, textSearch);
      Object.assign(workQuery, textSearch);
    }
    
    // Apply status filter
    if (filters && filters.status && filters.status !== '') {
      projectQuery.status = filters.status;
      schemeQuery.status = filters.status;
      workQuery.status = filters.status;
    }
    
    // Apply progress filter (only for works)
    if (filters && filters.progressMin !== undefined && filters.progressMin > 0) {
      workQuery.progress = { $gte: filters.progressMin };
    }
    
    // Apply budget filter
    if (filters && filters.budgetRange && filters.budgetRange.length === 2) {
      const budgetFilter = { 
        budget: {
          $gte: filters.budgetRange[0], 
          $lte: filters.budgetRange[1] 
        }
      };
      Object.assign(projectQuery, budgetFilter);
      Object.assign(schemeQuery, budgetFilter);
      Object.assign(workQuery, budgetFilter);
    }
      
      // Search in MongoDB with proper queries for each type
      const [projects, schemes, works] = await Promise.all([
        Project.find(projectQuery).limit(20),
        Scheme.find(schemeQuery).limit(20),
        Work.find(workQuery).limit(20)
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
      
      // Always return results even if empty
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
    // Return empty results instead of error to prevent frontend issues
    res.json({ results: [], total: 0, facets: { status: [], categories: [], types: [] } });
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