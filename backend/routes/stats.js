const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const User = require('../models/User');



router.get('/', async (req, res) => {
  try {
    const [doctors, appointments, departments, patients] = await Promise.all([
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Department.countDocuments(),
      User.countDocuments({ role: 'patient' }),
    ]);

    const pendingAppointments   = await Appointment.countDocuments({ status: 'pending' });
    const confirmedAppointments = await Appointment.countDocuments({ status: 'confirmed' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    res.json({
      success: true,
      stats: {
        doctors,
        appointments,
        departments,
        patients,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
