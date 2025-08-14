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
    
    console.log('Search request - Query:', query, 'Filters:', filters);
    
    // Build base query - if no search text, return all
    let searchQuery = {};
    
    if (query && query.trim() !== '') {
      const searchRegex = new RegExp(query.trim(), 'i');
      searchQuery = {
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      };
    }
    
    // Fetch from database
    let [schemes, projects, works] = await Promise.all([
      Scheme.find(searchQuery).limit(50).lean(),
      Project.find(searchQuery).limit(50).lean(),
      Work.find(searchQuery).limit(50).lean()
    ]);
    
    console.log('Raw results - Schemes:', schemes.length, 'Projects:', projects.length, 'Works:', works.length);
    
    // Apply filters after fetching
    if (filters) {
      // Status filter
      if (filters.status && filters.status !== '') {
        const statusFilter = filters.status.toLowerCase();
        schemes = schemes.filter(s => s.status && s.status.toLowerCase() === statusFilter);
        projects = projects.filter(p => p.status && p.status.toLowerCase() === statusFilter);
        works = works.filter(w => w.status && w.status.toLowerCase() === statusFilter);
      }
      
      // Category filter
      if (filters.category && filters.category !== '') {
        schemes = schemes.filter(s => s.category === filters.category);
        projects = projects.filter(p => p.category === filters.category);
        works = works.filter(w => w.category === filters.category);
      }
      
      // Progress filter (only for works)
      if (filters.progressMin !== undefined && filters.progressMin > 0) {
        works = works.filter(w => (w.progress || 0) >= filters.progressMin);
      }
      
      // Budget range filter
      if (filters.budgetRange && Array.isArray(filters.budgetRange) && filters.budgetRange.length === 2) {
        const [min, max] = filters.budgetRange;
        schemes = schemes.filter(s => {
          const budget = s.budget || 0;
          return budget >= min && budget <= max;
        });
        projects = projects.filter(p => {
          const budget = p.budget || 0;
          return budget >= min && budget <= max;
        });
        works = works.filter(w => {
          const budget = w.budget || 0;
          return budget >= min && budget <= max;
        });
      }
    }
    
    // Format results for frontend
    const formattedResults = [
      ...schemes.map(s => ({
        id: s._id,
        title: s.name || 'Untitled Scheme',
        type: 'scheme',
        description: s.description || 'No description available',
        score: 0.95,
        tags: ['scheme', s.status || 'Unknown'].filter(Boolean),
        metrics: {
          budget: s.budget || 0
        }
      })),
      ...projects.map(p => ({
        id: p._id,
        title: p.name || 'Untitled Project',
        type: 'project',
        description: p.description || 'No description available',
        score: 0.90,
        tags: ['project', p.status || 'Unknown'].filter(Boolean),
        metrics: {
          budget: p.budget || 0,
          location: p.location || p.district || ''
        }
      })),
      ...works.map(w => ({
        id: w._id,
        title: w.name || 'Untitled Work',
        type: 'work',
        description: w.description || 'No description available',
        score: 0.85,
        tags: ['work', w.status || 'Unknown'].filter(Boolean),
        metrics: {
          progress: w.progress || 0,
          budget: w.budget || 0
        }
      }))
    ];
    
    console.log('Formatted results:', formattedResults.length);
    
    res.json({
      results: formattedResults,
      total: formattedResults.length,
      facets: {
        status: [],
        categories: [],
        types: []
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
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
    const { query = '' } = req.body;
    
    let searchQuery = {};
    if (query && query.trim() !== '') {
      const searchRegex = new RegExp(query.trim(), 'i');
      searchQuery = {
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      };
    }
    
    const [schemes, projects, works] = await Promise.all([
      Scheme.find(searchQuery).limit(20).lean(),
      Project.find(searchQuery).limit(20).lean(),
      Work.find(searchQuery).limit(20).lean()
    ]);
    
    const results = [
      ...schemes.map(s => ({
        id: s._id,
        title: s.name || 'Untitled Scheme',
        type: 'scheme',
        description: s.description || '',
        score: 0.95,
        tags: ['scheme']
      })),
      ...projects.map(p => ({
        id: p._id,
        title: p.name || 'Untitled Project',
        type: 'project',
        description: p.description || '',
        score: 0.90,
        tags: ['project']
      })),
      ...works.map(w => ({
        id: w._id,
        title: w.name || 'Untitled Work',
        type: 'work',
        description: w.description || '',
        score: 0.85,
        tags: ['work']
      }))
    ];
    
    res.json({
      results,
      interpretation: query,
      confidence: 0.9
    });
    
  } catch (error) {
    console.error('Natural search error:', error);
    res.status(500).json({
      results: [],
      interpretation: '',
      confidence: 0
    });
  }
});

// Search suggestions endpoint  
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { q = '' } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const searchRegex = new RegExp(q, 'i');
    
    const [schemes, projects] = await Promise.all([
      Scheme.find({ name: searchRegex }).limit(3).select('name').lean(),
      Project.find({ name: searchRegex }).limit(3).select('name').lean()
    ]);
    
    const suggestions = [
      ...schemes.map(s => s.name),
      ...projects.map(p => p.name)
    ].filter(Boolean).slice(0, 5);
    
    res.json({ suggestions });
    
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({ suggestions: [] });
  }
});

module.exports = router;