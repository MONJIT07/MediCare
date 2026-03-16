const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

async function connectDB() {

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB Connected (Atlas)');
    return;
  } catch {
    console.log('⚠️  Local MongoDB not found. Starting In-Memory MongoDB...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ In-Memory MongoDB Connected (data resets on restart)');
    console.log('   → For persistent data, install MongoDB or use MongoDB Atlas');
  } catch (err2) {
    console.error('❌ Could not start any database:', err2.message);
  }
}

connectDB().then(() => seedDatabase());

mongoose.connection.on('error', (err) => {
  console.error('MongoDB Error:', err);
});

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/doctors',      require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/departments',  require('./routes/departments'));
app.use('/api/contact',      require('./routes/contact'));
app.use('/api/stats',        require('./routes/stats'));

app.get('/', (req, res) => {
  res.json({
    message: '🏥 MediCare+ API is running',
    version: '1.0.0',
    endpoints: {
      auth:         '/api/auth',
      doctors:      '/api/doctors',
      appointments: '/api/appointments',
      departments:  '/api/departments',
      contact:      '/api/contact',
      stats:        '/api/stats',
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

async function seedDatabase() {
  try {
    const Doctor = require('./models/Doctor');
    const Department = require('./models/Department');
    const User = require('./models/User');

    const deptCount = await Department.countDocuments();
    if (deptCount === 0) {
      const departments = [
        { name: 'Cardiology',     icon: 'fas fa-heartbeat', description: 'Advanced heart care with modern diagnostic tools and surgical expertise.' },
        { name: 'Neurology',      icon: 'fas fa-brain',     description: 'Comprehensive neurological treatments for brain and nervous system disorders.' },
        { name: 'Orthopedics',    icon: 'fas fa-bone',      description: 'Expert bone and joint care, sports injuries, and joint replacement.' },
        { name: 'Pediatrics',     icon: 'fas fa-baby',      description: 'Specialized child healthcare from newborns through adolescence.' },
        { name: 'Oncology',       icon: 'fas fa-ribbon',    description: 'Advanced cancer treatment with cutting-edge chemotherapy and radiation.' },
        { name: 'Ophthalmology',  icon: 'fas fa-eye',       description: 'Complete eye care from vision correction to cataract and retina surgery.' },
        { name: 'Pulmonology',    icon: 'fas fa-lungs',     description: 'Expert diagnosis and treatment for respiratory and lung diseases.' },
        { name: 'Gynecology',     icon: 'fas fa-venus',     description: 'Comprehensive women\'s health services from puberty through menopause.' },
        { name: 'Dermatology',    icon: 'fas fa-hand-paper',description: 'Expert skin, hair, and nail treatments including cosmetic procedures.' },
        { name: 'Radiology',      icon: 'fas fa-x-ray',     description: 'Advanced imaging including MRI, CT Scan, X-ray, and Ultrasound.' },
        { name: 'Emergency Care', icon: 'fas fa-procedures',description: '24/7 emergency services with a dedicated trauma and ICU team.' },
        { name: 'Dental Care',    icon: 'fas fa-tooth',     description: 'Complete dental services including cosmetic and orthodontic treatments.' },
      ];
      await Department.insertMany(departments);
      console.log('✅ Departments seeded');
    }

    const docCount = await Doctor.countDocuments();
    if (docCount === 0) {
      const doctors = [
        { name: 'Dr. Arjun Sharma',  department: 'Cardiology',    experience: 12, rating: 4.9, patients: 1200, color: '#10b981', available: true },
        { name: 'Dr. Priya Mehta',   department: 'Neurology',     experience: 10, rating: 4.8, patients: 980,  color: '#3b82f6', available: true },
        { name: 'Dr. Rahul Gupta',   department: 'Orthopedics',   experience: 15, rating: 4.9, patients: 1500, color: '#8b5cf6', available: true },
        { name: 'Dr. Sneha Iyer',    department: 'Pediatrics',    experience: 8,  rating: 4.7, patients: 2100, color: '#f59e0b', available: true },
        { name: 'Dr. Vikram Singh',  department: 'Oncology',      experience: 18, rating: 5.0, patients: 850,  color: '#ef4444', available: true },
        { name: 'Dr. Ananya Rao',    department: 'Dermatology',   experience: 7,  rating: 4.8, patients: 1300, color: '#06b6d4', available: true },
        { name: 'Dr. Rohit Patel',   department: 'Ophthalmology', experience: 11, rating: 4.9, patients: 900,  color: '#84cc16', available: false },
        { name: 'Dr. Kavita Joshi',  department: 'Gynecology',    experience: 13, rating: 4.7, patients: 1800, color: '#ec4899', available: true },
      ];
      await Doctor.insertMany(doctors);
      console.log('✅ Doctors seeded');
    }

    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@medicare.com',
        password: 'admin123',  // pre('save') in User model will bcrypt this
        role: 'admin',
      });
      console.log('✅ Admin user created — email: admin@medicare.com | password: admin123');
    }

  } catch (err) {
    console.error('Seeding error:', err.message);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 MediCare+ Server running on http://localhost:${PORT}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/\n`);
});
