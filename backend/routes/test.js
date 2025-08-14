const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const Project = require('../models/Project');
const Work = require('../models/Work');

// Test endpoint to verify database connectivity
router.get('/db-test', async (req, res) => {
  try {
    const schemeCount = await Scheme.countDocuments();
    const projectCount = await Project.countDocuments();
    const workCount = await Work.countDocuments();
    
    res.json({
      success: true,
      data: {
        schemes: schemeCount,
        projects: projectCount,
        works: workCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple search that definitely works
router.get('/simple-search', async (req, res) => {
  try {
    const { q = '' } = req.query;
    
    let query = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      query = { name: regex };
    }
    
    const [schemes, projects, works] = await Promise.all([
      Scheme.find(query).limit(10).select('name description status budget'),
      Project.find(query).limit(10).select('name description status budget'),
      Work.find(query).limit(10).select('name description status progress budget')
    ]);
    
    res.json({
      success: true,
      query: q,
      results: {
        schemes: schemes.length,
        projects: projects.length,
        works: works.length,
        data: {
          schemes,
          projects,
          works
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;