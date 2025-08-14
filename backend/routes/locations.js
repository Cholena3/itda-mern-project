const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Work = require('../models/Work');
const Scheme = require('../models/Scheme');

// Parlakhemundi ITDA Location Data
const parlakhemundiLocations = {
  district: 'Gajapati (Parlakhemundi)',
  blocks: [
    {
      name: 'Mohana',
      gramPanchayats: [
        {
          name: 'Chandragiri',
          villages: ['Chandragiri', 'Tumba', 'Kereba', 'Badapada']
        },
        {
          name: 'Gangabada',
          villages: ['Gangabada', 'Kujasingh', 'Manikpur', 'Raibada']
        },
        {
          name: 'Luhagudi',
          villages: ['Luhagudi', 'Paniganda', 'Bhaliaguda', 'Kenduguda']
        },
        {
          name: 'Seranga',
          villages: ['Seranga', 'Katama', 'Jeeranga', 'Dhobaguda']
        }
      ]
    },
    {
      name: 'R.Udayagiri',
      gramPanchayats: [
        {
          name: 'Kinchilingi',
          villages: ['Kinchilingi', 'Sindhiba', 'Tarangini', 'Jharaguda']
        },
        {
          name: 'Dumbala',
          villages: ['Dumbala', 'Khadanga', 'Luhangi', 'Pandava']
        },
        {
          name: 'Ramagiri',
          villages: ['Ramagiri', 'Labanyagada', 'Ambaguda', 'Karadabadi']
        },
        {
          name: 'Padmapur',
          villages: ['Padmapur', 'Haridapadar', 'Jagannathpur', 'Bhimpur']
        }
      ]
    },
    {
      name: 'Nuagada',
      gramPanchayats: [
        {
          name: 'Alada',
          villages: ['Alada', 'Badagada', 'Kumbhikota', 'Narayanpur']
        },
        {
          name: 'Dimiripali',
          villages: ['Dimiripali', 'Chandanpur', 'Khajuripada', 'Talapada']
        },
        {
          name: 'Loba',
          villages: ['Loba', 'Biribatia', 'Dengapadar', 'Kendubadi']
        }
      ]
    },
    {
      name: 'Rayagada',
      gramPanchayats: [
        {
          name: 'Koinpur',
          villages: ['Koinpur', 'Bhaleri', 'Garabandha', 'Jharigaon']
        },
        {
          name: 'Sindurapur',
          villages: ['Sindurapur', 'Badakalakote', 'Laxmipur', 'Ratnapur']
        },
        {
          name: 'Dura',
          villages: ['Dura', 'Jeerango', 'Kasipur', 'Mandimera']
        }
      ]
    },
    {
      name: 'Gumma',
      gramPanchayats: [
        {
          name: 'Gumma',
          villages: ['Gumma', 'Baghalati', 'Dhepaguda', 'Khandava']
        },
        {
          name: 'Juba',
          villages: ['Juba', 'Amjhiri', 'Birikote', 'Chitapalli']
        }
      ]
    }
  ]
};

// Get location hierarchy data - No auth required for public data
router.get('/hierarchy', async (req, res) => {
  try {
    console.log('Location hierarchy requested');
    res.json(parlakhemundiLocations);
  } catch (error) {
    console.error('Location hierarchy error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get unique locations from database
router.get('/unique', async (req, res) => {
  try {
    const [projectBlocks, workBlocks] = await Promise.all([
      Project.distinct('block'),
      Work.distinct('block')
    ]);
    
    const [projectGPs, workGPs] = await Promise.all([
      Project.distinct('gramPanchayat'),
      Work.distinct('gramPanchayat')
    ]);
    
    const [projectVillages, workVillages] = await Promise.all([
      Project.distinct('village'),
      Work.distinct('village')
    ]);
    
    res.json({
      blocks: [...new Set([...projectBlocks, ...workBlocks])].filter(Boolean),
      gramPanchayats: [...new Set([...projectGPs, ...workGPs])].filter(Boolean),
      villages: [...new Set([...projectVillages, ...workVillages])].filter(Boolean)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Filter data by location
router.post('/filter', async (req, res) => {
  try {
    const { district, block, gramPanchayat, village, dataType } = req.body;
    
    // Build filter query
    const locationFilter = {};
    if (district) locationFilter.district = district;
    if (block) locationFilter.block = block;
    if (gramPanchayat) locationFilter.gramPanchayat = gramPanchayat;
    if (village) locationFilter.village = village;
    
    let results = {};
    
    // Fetch filtered data based on dataType
    if (!dataType || dataType === 'all' || dataType === 'schemes') {
      // Get projects with location filter, then get unique schemes
      const projects = await Project.find(locationFilter).populate('schemeId');
      const schemeIds = [...new Set(projects.map(p => p.schemeId?._id?.toString()).filter(Boolean))];
      const schemes = await Scheme.find({ _id: { $in: schemeIds } });
      results.schemes = schemes;
    }
    
    if (!dataType || dataType === 'all' || dataType === 'projects') {
      const projects = await Project.find(locationFilter).populate('schemeId');
      results.projects = projects.map(project => {
        const projectObj = project.toObject();
        return {
          ...projectObj,
          schemeName: project.schemeId ? project.schemeId.name : 'Unknown Scheme'
        };
      });
    }
    
    if (!dataType || dataType === 'all' || dataType === 'works') {
      const works = await Work.find(locationFilter).populate('projectId').populate('schemeId');
      results.works = works.map(work => {
        const workObj = work.toObject();
        return {
          ...workObj,
          schemeName: work.schemeId ? work.schemeId.name : 'Unknown Scheme',
          projectName: work.projectId ? work.projectId.name : 'Unknown Project'
        };
      });
    }
    
    // Add location summary
    results.locationSummary = {
      district: district || 'All',
      block: block || 'All',
      gramPanchayat: gramPanchayat || 'All',
      village: village || 'All',
      totalSchemes: results.schemes?.length || 0,
      totalProjects: results.projects?.length || 0,
      totalWorks: results.works?.length || 0
    };
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get statistics by location
router.post('/stats', async (req, res) => {
  try {
    const { district, block, gramPanchayat, village } = req.body;
    
    const locationFilter = {};
    if (district) locationFilter.district = district;
    if (block) locationFilter.block = block;
    if (gramPanchayat) locationFilter.gramPanchayat = gramPanchayat;
    if (village) locationFilter.village = village;
    
    // Get counts
    const [projectCount, workCount] = await Promise.all([
      Project.countDocuments(locationFilter),
      Work.countDocuments(locationFilter)
    ]);
    
    // Get budget totals
    const projectBudget = await Project.aggregate([
      { $match: locationFilter },
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ]);
    
    const workBudget = await Work.aggregate([
      { $match: locationFilter },
      { $group: { 
        _id: null, 
        totalBudget: { $sum: '$budget' },
        totalSpent: { $sum: '$amountSpent' }
      }}
    ]);
    
    res.json({
      location: {
        district: district || 'All',
        block: block || 'All',
        gramPanchayat: gramPanchayat || 'All',
        village: village || 'All'
      },
      counts: {
        projects: projectCount,
        works: workCount
      },
      budgets: {
        projectTotal: projectBudget[0]?.total || 0,
        workTotal: workBudget[0]?.totalBudget || 0,
        workSpent: workBudget[0]?.totalSpent || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;