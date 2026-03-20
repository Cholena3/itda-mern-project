const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');
const { authenticate, authorize } = require('../middleware/authorize');

// Public read — still requires auth
router.get('/', authenticate, authorize('schemes', 'read'), async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authenticate, authorize('schemes', 'read'), async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });
    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create — admin & manager only
router.post('/', authenticate, authorize('schemes', 'create'), async (req, res) => {
  const scheme = new Scheme({
    name: req.body.name,
    description: req.body.description,
    budget: req.body.budget,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    status: req.body.status || 'Planning',
  });

  try {
    const newScheme = await scheme.save();
    res.status(201).json(newScheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update — admin & manager only
router.put('/:id', authenticate, authorize('schemes', 'update'), async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });

    scheme.name = req.body.name || scheme.name;
    scheme.description = req.body.description || scheme.description;
    scheme.budget = req.body.budget || scheme.budget;
    scheme.startDate = req.body.startDate || scheme.startDate;
    scheme.endDate = req.body.endDate || scheme.endDate;
    scheme.status = req.body.status || scheme.status;

    const updatedScheme = await scheme.save();
    res.json(updatedScheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete — admin only
router.delete('/:id', authenticate, authorize('schemes', 'delete'), async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ message: 'Scheme not found' });

    await scheme.deleteOne();
    res.json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
