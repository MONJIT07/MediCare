const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect, adminOnly } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const { sendBookingConfirmation, sendAppointmentConfirmed, sendAppointmentCancelled } = require('../utils/emailService');



router.post('/', [
  body('patientName').trim().notEmpty().withMessage('Patient name is required'),
  body('patientEmail').isEmail().withMessage('Valid email is required'),
  body('patientPhone').trim().notEmpty().withMessage('Phone number is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('appointmentDate').notEmpty().withMessage('Appointment date is required'),
  body('timeSlot').notEmpty().withMessage('Time slot is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const appointment = await Appointment.create(req.body);

    sendBookingConfirmation(appointment);

    res.status(201).json({
      success: true,
      message: `Appointment booked! A confirmation email has been sent to ${appointment.patientEmail}.`,
      appointment,
      appointmentId: appointment._id.toString().slice(-8).toUpperCase(),
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});



router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};
    if (status) query.status = status;
    if (department) query.department = { $regex: department, $options: 'i' };

    const appointments = await Appointment.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



router.get('/track', async (req, res) => {
  try {
    const { phone, email } = req.query;
    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'Provide phone or email to track appointments' });
    }

    const query = {};
    if (email) query.patientEmail = { $regex: email, $options: 'i' };
    else if (phone) query.patientPhone = phone;

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .select('-__v');

    if (!appointments.length) {
      return res.status(404).json({ success: false, message: 'No appointments found for this contact info.' });
    }

    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



router.get('/my', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [
        { userId: req.user._id },
        { patientEmail: req.user.email }
      ]
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, notes, doctor } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes, ...(doctor && { doctor }) },
      { new: true, runValidators: true }
    );

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (status === 'confirmed') {
      sendAppointmentConfirmed(appointment);
    } else if (status === 'cancelled') {
      sendAppointmentCancelled(appointment);
    }

    res.json({
      success: true,
      message: `Appointment ${status}. Email notification sent to patient.`,
      appointment
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});



router.delete('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (appointment.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Only pending appointments can be cancelled.' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    sendAppointmentCancelled(appointment);

    res.json({ success: true, message: 'Appointment cancelled. Email sent to patient.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
