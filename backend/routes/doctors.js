const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const { protect, adminOnly } = require('../middleware/auth');



router.get('/', async (req, res) => {
  try {
    const { search, department, available } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }
    if (department) query.department = { $regex: department, $options: 'i' };
    if (available !== undefined) query.available = available === 'true';

    const doctors = await Doctor.find(query).sort({ rating: -1 });
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json({ success: true, message: 'Doctor added successfully', doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});



router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, message: 'Doctor updated', doctor });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});



router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, message: 'Doctor deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
