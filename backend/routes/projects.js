const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().populate('schemeId');
    // Transform the data to include scheme name directly
    const projectsWithSchemeNames = projects.map(project => {
      const projectObj = project.toObject();
      return {
        ...projectObj,
        schemeName: project.schemeId ? project.schemeId.name : 'Unknown Scheme'
      };
    });
    res.json(projectsWithSchemeNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/scheme/:schemeId', async (req, res) => {
  try {
    const projects = await Project.find({ schemeId: req.params.schemeId }).populate('schemeId');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('schemeId');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const project = new Project({
    name: req.body.name,
    description: req.body.description,
    schemeId: req.body.schemeId,
    budget: req.body.budget,
    status: req.body.status,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  });

  try {
    const newProject = await project.save();
    await newProject.populate('schemeId');
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    Object.assign(project, req.body);
    const updatedProject = await project.save();
    await updatedProject.populate('schemeId');
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;