const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { protect, adminOnly } = require('../middleware/auth');



router.get('/', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, count: departments.length, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, message: 'Department added', dept });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});



router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.json({ success: true, message: 'Department updated', dept });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});



router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
