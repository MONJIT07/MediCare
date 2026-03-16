const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative'],
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
  },
  patients: {
    type: Number,
    default: 0,
  },
  color: {
    type: String,
    default: '#10b981',
  },
  bio: {
    type: String,
    default: 'Experienced medical professional dedicated to patient care.',
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  available: {
    type: Boolean,
    default: true,
  },
  qualifications: [{
    type: String,
  }],
  consultationFee: {
    type: Number,
    default: 500,
  },
  availableSlots: [{
    day: String,  // e.g. 'Monday'
    from: String, // e.g. '09:00'
    to: String,   // e.g. '13:00'
  }],
  socialLinks: {
    facebook:  { type: String, default: '#' },
    twitter:   { type: String, default: '#' },
    instagram: { type: String, default: '#' },
    linkedin:  { type: String, default: '#' },
  },
}, { timestamps: true });

doctorSchema.virtual('experienceStr').get(function () {
  return `${this.experience} yr${this.experience !== 1 ? 's' : ''}`;
});

doctorSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Doctor', doctorSchema);
