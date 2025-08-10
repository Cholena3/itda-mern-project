const express = require('express');
const router = express.Router();
const Work = require('../models/Work');

router.get('/', async (req, res) => {
  try {
    const works = await Work.find().populate('projectId').populate('schemeId');
    // Transform the data to include scheme and project names directly
    const worksWithNames = works.map(work => {
      const workObj = work.toObject();
      return {
        ...workObj,
        schemeName: work.schemeId ? work.schemeId.name : 'Unknown Scheme',
        projectName: work.projectId ? work.projectId.name : 'Unknown Project'
      };
    });
    res.json(worksWithNames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/project/:projectId', async (req, res) => {
  try {
    const works = await Work.find({ projectId: req.params.projectId }).populate('projectId').populate('schemeId');
    res.json(works);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const work = await Work.findById(req.params.id).populate('projectId').populate('schemeId');
    if (!work) {
      return res.status(404).json({ message: 'Work not found' });
    }
    res.json(work);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  const work = new Work({
    name: req.body.name,
    description: req.body.description,
    projectId: req.body.projectId,
    schemeId: req.body.schemeId,
    budget: req.body.budget,
    status: req.body.status,
    progress: req.body.progress,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  });

  try {
    const newWork = await work.save();
    await newWork.populate(['projectId', 'schemeId']);
    res.status(201).json(newWork);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: 'Work not found' });
    }

    Object.assign(work, req.body);
    const updatedWork = await work.save();
    await updatedWork.populate(['projectId', 'schemeId']);
    res.json(updatedWork);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const work = await Work.findById(req.params.id);
    if (!work) {
      return res.status(404).json({ message: 'Work not found' });
    }
    
    await work.deleteOne();
    res.json({ message: 'Work deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;