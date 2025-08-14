const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Scheme = require('../models/Scheme');
const Work = require('../models/Work');

// Advanced search endpoint
router.post('/advanced', auth, async (req, res) => {
  try {
    const { query = '', filters = {} } = req.body;
    
    console.log('Search request:', { query, filters });
    
    // Initialize empty results
    let projects = [];
    let schemes = [];
    let works = [];
    
    // Build search criteria
    const searchCriteria = {};
    
    // Add text search only if query is provided
    if (query && query.trim() !== '') {
      const searchRegex = new RegExp(query.trim(), 'i');
      searchCriteria.$or = [
        { name: searchRegex },
        { description: searchRegex }
      ];
    }
    
    // Add status filter if provided
    if (filters.status && filters.status !== '') {
      searchCriteria.status = filters.status;
    }
    
    // Search in all collections
    [projects, schemes, works] = await Promise.all([
      Project.find(searchCriteria).limit(20).lean(),
      Scheme.find(searchCriteria).limit(20).lean(),
      Work.find(searchCriteria).limit(20).lean()
    ]);
    
    // Apply additional filters for works (progress)
    if (filters.progressMin !== undefined && filters.progressMin > 0) {
      works = works.filter(w => w.progress >= filters.progressMin);
    }
    
    // Apply budget filter if provided
    if (filters.budgetRange && filters.budgetRange.length === 2) {
      const [min, max] = filters.budgetRange;
      projects = projects.filter(p => p.budget >= min && p.budget <= max);
      schemes = schemes.filter(s => s.budget >= min && s.budget <= max);
      works = works.filter(w => w.budget >= min && w.budget <= max);
    }
    
    // Format results
    const combinedResults = [
      ...projects.map(p => ({
        id: p._id,
        title: p.name || 'Untitled Project',
        type: 'project',
        description: p.description || 'No description available',
        score: 0.9,
        tags: ['project'],
        metrics: {
          progress: p.progress || 0,
          budget: p.budget || 0,
          location: p.location || p.district || ''
        }
      })),
      ...schemes.map(s => ({
        id: s._id,
        title: s.name || 'Untitled Scheme',
        type: 'scheme',
        description: s.description || 'No description available',
        score: 0.85,
        tags: ['scheme'],
        metrics: {
          budget: s.budget || 0
        }
      })),
      ...works.map(w => ({
        id: w._id,
        title: w.name || 'Untitled Work',
        type: 'work',
        description: w.description || 'No description available',
        score: 0.8,
        tags: ['work', w.status || 'Unknown'].filter(Boolean),
        metrics: {
          progress: w.progress || 0,
          budget: w.budget || 0
        }
      }))
    ];
    
    console.log(`Search found: ${combinedResults.length} results`);
    
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
    res.json({ 
      results: [], 
      total: 0, 
      facets: { 
        status: [], 
        categories: [], 
        types: [] 
      } 
    });
  }
});

// Natural language search endpoint
router.post('/natural', auth, async (req, res) => {
  try {
    const { query = '', filters = {} } = req.body;
    
    // For natural language, just use the same search as advanced
    // but with the query as-is
    const searchRegex = new RegExp(query, 'i');
    
    const [projects, schemes, works] = await Promise.all([
      Project.find({ 
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      }).limit(10).lean(),
      Scheme.find({ 
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      }).limit(10).lean(),
      Work.find({ 
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      }).limit(10).lean()
    ]);
    
    const results = [
      ...projects.map(p => ({
        id: p._id,
        title: p.name || 'Untitled',
        type: 'project',
        description: p.description || '',
        score: 0.9,
        tags: ['project']
      })),
      ...schemes.map(s => ({
        id: s._id,
        title: s.name || 'Untitled',
        type: 'scheme',
        description: s.description || '',
        score: 0.85,
        tags: ['scheme']
      })),
      ...works.map(w => ({
        id: w._id,
        title: w.name || 'Untitled',
        type: 'work',
        description: w.description || '',
        score: 0.8,
        tags: ['work']
      }))
    ];
    
    res.json({ 
      results,
      interpretation: query,
      confidence: 0.9
    });
  } catch (error) {
    console.error('Natural language search error:', error);
    res.json({ 
      results: [],
      interpretation: '',
      confidence: 0
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
    
    // Get suggestions from database
    const regex = new RegExp(`^${q}`, 'i');
    
    const [projects, schemes] = await Promise.all([
      Project.find({ name: regex }).limit(3).select('name').lean(),
      Scheme.find({ name: regex }).limit(3).select('name').lean()
    ]);
    
    const suggestions = [
      ...projects.map(p => p.name),
      ...schemes.map(s => s.name),
      `${q} projects`,
      `${q} schemes`,
      `${q} in progress`,
      `${q} completed`
    ].slice(0, 5);
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({ suggestions: [] });
  }
});

// Faceted search endpoint
router.post('/facets', auth, async (req, res) => {
  try {
    // Return empty facets for now to avoid timeout
    res.json({
      facets: {
        status: [],
        districts: [],
        types: []
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