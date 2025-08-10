const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const Project = require('../models/Project');
const Work = require('../models/Work');

router.get('/stats', async (req, res) => {
  try {
    // Schemes statistics
    const totalSchemes = await Scheme.countDocuments();
    const activeSchemes = await Scheme.countDocuments({ status: 'Active' });
    
    // Projects statistics
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'Active' });
    
    // Works statistics
    const totalWorks = await Work.countDocuments();
    const activeWorks = await Work.countDocuments({ status: 'Active' });
    const completedWorks = await Work.countDocuments({ status: 'Completed' });
    
    // Calculate total budget from all projects
    const totalBudgetResult = await Project.aggregate([
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ]);
    
    // Get recent activity (last 10 items)
    const recentSchemes = await Scheme.find()
      .sort('-createdAt')
      .limit(5)
      .select('name createdAt');
    
    const recentProjects = await Project.find()
      .sort('-createdAt')
      .limit(5)
      .select('name createdAt')
      .populate('schemeId', 'name');
    
    const recentWorks = await Work.find()
      .sort('-createdAt')
      .limit(5)
      .select('name createdAt status')
      .populate('projectId', 'name')
      .populate('schemeId', 'name');
    
    // Combine and format recent activity
    const recentActivity = [];
    
    recentSchemes.forEach(scheme => {
      recentActivity.push({
        _id: scheme._id,
        type: 'scheme',
        action: 'created',
        name: scheme.name,
        date: scheme.createdAt
      });
    });
    
    recentProjects.forEach(project => {
      recentActivity.push({
        _id: project._id,
        type: 'project',
        action: 'created',
        name: project.name,
        date: project.createdAt
      });
    });
    
    recentWorks.forEach(work => {
      recentActivity.push({
        _id: work._id,
        type: 'work',
        action: work.status === 'Completed' ? 'completed' : 'created',
        name: work.name,
        date: work.createdAt
      });
    });
    
    // Sort recent activity by date
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get scheme-wise budget distribution
    const schemeBudgets = await Scheme.aggregate([
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: 'schemeId',
          as: 'projects'
        }
      },
      {
        $project: {
          name: 1,
          schemeBudget: '$budget',
          projectsBudget: { $sum: '$projects.budget' }
        }
      }
    ]);

    // Get work status distribution
    const workStatusDistribution = await Work.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get progress distribution of active works
    const progressDistribution = await Work.aggregate([
      {
        $match: { status: 'Active' }
      },
      {
        $bucket: {
          groupBy: '$progress',
          boundaries: [0, 25, 50, 75, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            works: { $push: '$name' }
          }
        }
      }
    ]);

    // Get budget vs expenditure for works
    const budgetVsExpenditure = await Work.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          totalSpent: { $sum: '$amountSpent' }
        }
      }
    ]);

    // Get top 5 schemes by budget
    const topSchemesByBudget = await Scheme.find()
      .sort('-budget')
      .limit(5)
      .select('name budget status');

    res.json({
      totalSchemes,
      totalProjects,
      totalWorks,
      totalBudget: totalBudgetResult[0]?.total || 0,
      activeSchemes,
      activeProjects,
      activeWorks,
      completedWorks,
      recentActivity: recentActivity.slice(0, 10),
      schemeBudgets,
      workStatusDistribution,
      progressDistribution,
      budgetVsExpenditure: budgetVsExpenditure[0] || { totalBudget: 0, totalSpent: 0 },
      topSchemesByBudget
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;