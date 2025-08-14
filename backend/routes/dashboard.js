const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const Project = require('../models/Project');
const Work = require('../models/Work');

router.get('/stats', async (req, res) => {
  try {
    // Basic counts - fast queries
    const [
      totalSchemes,
      activeSchemes,
      totalProjects,
      activeProjects,
      totalWorks,
      activeWorks,
      completedWorks
    ] = await Promise.all([
      Scheme.countDocuments(),
      Scheme.countDocuments({ status: 'Active' }),
      Project.countDocuments(),
      Project.countDocuments({ status: 'Active' }),
      Work.countDocuments(),
      Work.countDocuments({ status: 'Active' }),
      Work.countDocuments({ status: 'Completed' })
    ]);

    // Calculate total budget - single aggregation
    const totalBudgetResult = await Project.aggregate([
      { $group: { _id: null, total: { $sum: '$budget' } } }
    ]).exec();

    // Get recent activity - simplified
    const recentActivity = [];
    
    // Get limited recent items
    const [recentSchemes, recentProjects, recentWorks] = await Promise.all([
      Scheme.find().sort('-createdAt').limit(3).select('name createdAt'),
      Project.find().sort('-createdAt').limit(3).select('name createdAt'),
      Work.find().sort('-createdAt').limit(4).select('name createdAt status')
    ]);

    // Format recent activity
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

    // Sort by date
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get scheme budgets for chart - limit to top 5
    const schemeBudgets = await Scheme.find()
      .sort('-budget')
      .limit(5)
      .select('name budget');

    // Get work status distribution
    const workStatusDistribution = await Work.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).exec();

    // Get simplified progress distribution
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
            count: { $sum: 1 }
          }
        }
      }
    ]).exec();

    // Get budget vs expenditure
    const budgetVsExpenditure = await Work.aggregate([
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          totalSpent: { $sum: { $ifNull: ['$amountSpent', 0] } }
        }
      }
    ]).exec();

    // Top schemes by budget
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
      schemeBudgets: schemeBudgets.map(s => ({
        name: s.name,
        schemeBudget: s.budget,
        projectsBudget: s.budget
      })),
      workStatusDistribution,
      progressDistribution,
      budgetVsExpenditure: budgetVsExpenditure[0] || { totalBudget: 0, totalSpent: 0 },
      topSchemesByBudget
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    // Return partial data on error
    res.json({
      totalSchemes: 0,
      totalProjects: 0,
      totalWorks: 0,
      totalBudget: 0,
      activeSchemes: 0,
      activeProjects: 0,
      activeWorks: 0,
      completedWorks: 0,
      recentActivity: [],
      schemeBudgets: [],
      workStatusDistribution: [],
      progressDistribution: [],
      budgetVsExpenditure: { totalBudget: 0, totalSpent: 0 },
      topSchemesByBudget: []
    });
  }
});

module.exports = router;