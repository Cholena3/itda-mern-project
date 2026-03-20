const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const WorkPhoto = require('../models/WorkPhoto');
const { authenticate, authorize } = require('../middleware/authorize');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'backend/uploads/work_photos');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'work-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

router.get('/work/:projCode/:workName', authenticate, authorize('photos', 'read'), async (req, res) => {
  try {
    const photos = await WorkPhoto.find({
      projCode: req.params.projCode,
      workName: req.params.workName,
    }).sort('-uploadDate');
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/upload', authenticate, authorize('photos', 'create'), upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const workPhoto = new WorkPhoto({
      projCode: req.body.projCode,
      workName: req.body.workName,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      description: req.body.description,
      uploadedBy: req.user._id,
    });

    const savedPhoto = await workPhoto.save();
    res.status(201).json(savedPhoto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authenticate, authorize('photos', 'delete'), async (req, res) => {
  try {
    const photo = await WorkPhoto.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    await photo.deleteOne();
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
