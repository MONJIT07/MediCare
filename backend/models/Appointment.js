const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
  },
  patientEmail: {
    type: String,
    required: [true, 'Patient email is required'],
    lowercase: true,
    trim: true,
  },
  patientPhone: {
    type: String,
    required: [true, 'Patient phone is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
  },
  doctor: {
    type: String,
    default: '',
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
  },
  concern: {
    type: String,
    default: '',
    maxlength: [1000, 'Concern cannot exceed 1000 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  notes: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
