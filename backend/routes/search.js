const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Scheme = require('../models/Scheme');
const Work = require('../models/Work');

// Test endpoint without auth
router.get('/test', async (req, res) => {
  try {
    const count = await Scheme.countDocuments();
    res.json({ 
      success: true, 
      message: 'Search API is working',
      schemeCount: count 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Advanced search endpoint
router.post('/advanced', auth, async (req, res) => {
  try {
    const { query = '', filters = {} } = req.body;
    
    console.log('Search API called with:', { query, filters });
    
    // Start with empty query
    let searchQuery = {};
    
    // Only add text search if query exists
    if (query && query.trim() !== '') {
      const searchPattern = query.trim();
      searchQuery.name = { $regex: searchPattern, $options: 'i' };
    }
    
    // Get all data first
    const schemes = await Scheme.find(searchQuery).lean();
    const projects = await Project.find(searchQuery).lean();
    const works = await Work.find(searchQuery).lean();
    
    console.log('Database returned - Schemes:', schemes.length, 'Projects:', projects.length, 'Works:', works.length);
    
    // Format for frontend
    const results = [];
    
    // Add schemes
    schemes.forEach(item => {
      results.push({
        id: item._id,
        title: item.name || 'Untitled Scheme',
        type: 'scheme',
        description: item.description || '',
        score: 0.95,
        tags: ['scheme'],
        metrics: {
          budget: item.budget || 0
        }
      });
    });
    
    // Add projects
    projects.forEach(item => {
      results.push({
        id: item._id,
        title: item.name || 'Untitled Project',
        type: 'project',
        description: item.description || '',
        score: 0.90,
        tags: ['project'],
        metrics: {
          budget: item.budget || 0
        }
      });
    });
    
    // Add works
    works.forEach(item => {
      results.push({
        id: item._id,
        title: item.name || 'Untitled Work',
        type: 'work',
        description: item.description || '',
        score: 0.85,
        tags: ['work'],
        metrics: {
          progress: item.progress || 0,
          budget: item.budget || 0
        }
      });
    });
    
    console.log('Sending', results.length, 'results to frontend');
    
    res.json({
      results: results,
      total: results.length,
      facets: {
        status: [],
        categories: [],
        types: []
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.json({
      results: [],
      total: 0,
      facets: {
        status: [],
        categories: [],
        types: []
      },
      error: error.message
    });
  }
});

// Natural language search endpoint
router.post('/natural', auth, async (req, res) => {
  try {
    const { query = '' } = req.body;
    
    let searchQuery = {};
    if (query) {
      searchQuery.name = { $regex: query, $options: 'i' };
    }
    
    const schemes = await Scheme.find(searchQuery).limit(10).lean();
    const projects = await Project.find(searchQuery).limit(10).lean();
    const works = await Work.find(searchQuery).limit(10).lean();
    
    const results = [];
    
    schemes.forEach(s => {
      results.push({
        id: s._id,
        title: s.name || 'Untitled',
        type: 'scheme',
        description: s.description || '',
        score: 0.9,
        tags: ['scheme']
      });
    });
    
    projects.forEach(p => {
      results.push({
        id: p._id,
        title: p.name || 'Untitled',
        type: 'project',
        description: p.description || '',
        score: 0.85,
        tags: ['project']
      });
    });
    
    works.forEach(w => {
      results.push({
        id: w._id,
        title: w.name || 'Untitled',
        type: 'work',
        description: w.description || '',
        score: 0.8,
        tags: ['work']
      });
    });
    
    res.json({
      results,
      interpretation: query,
      confidence: 0.9
    });
    
  } catch (error) {
    console.error('Natural search error:', error);
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
    const { q = '' } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const regex = { $regex: q, $options: 'i' };
    
    const schemes = await Scheme.find({ name: regex })
      .limit(3)
      .select('name')
      .lean();
    
    const suggestions = schemes.map(s => s.name).filter(Boolean);
    
    res.json({ suggestions });
    
  } catch (error) {
    console.error('Suggestions error:', error);
    res.json({ suggestions: [] });
  }
});

module.exports = router;