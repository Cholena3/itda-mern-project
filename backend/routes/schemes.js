const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');

// Get all schemes
router.get('/', async (req, res) => {
  try {
    const schemes = await Scheme.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get scheme by ID
router.get('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }
    res.json(scheme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new scheme
router.post('/', async (req, res) => {
  const scheme = new Scheme({
    name: req.body.name,
    description: req.body.description,
    budget: req.body.budget,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    status: req.body.status || 'Planning'
  });

  try {
    const newScheme = await scheme.save();
    res.status(201).json(newScheme);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update scheme
router.put('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    // Update fields
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

// Delete scheme
router.delete('/:id', async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ message: 'Scheme not found' });
    }

    await scheme.deleteOne();
    res.json({ message: 'Scheme deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;