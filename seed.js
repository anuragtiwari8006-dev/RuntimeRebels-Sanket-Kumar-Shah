const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const seedUsers = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostelhub';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await User.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    const users = [
      {
        name: 'Anurag Tiwari',
        email: 'resident@hostelhub.com',
        password,
        role: 'RESIDENT',
        roomNumber: '302',
        phone: '9208699626'
      },
      {
        name: 'Chief Warden Admin',
        email: 'warden@hostelhub.com',
        password,
        role: 'WARDEN',
        roomNumber: null,
        phone: '9876543210'
      },
      {
        name: 'Main Gate Guard',
        email: 'guard@hostelhub.com',
        password,
        role: 'SECURITY',
        roomNumber: null,
        phone: '9123456789'
      }
    ];

    await User.insertMany(users);
    console.log('✅ Database Seeded Successfully!');
    console.log('-----------------------------------');
    console.log('All passwords: 123456');
    console.log('Resident: resident@hostelhub.com');
    console.log('Warden:   warden@hostelhub.com');
    console.log('Guard:    guard@hostelhub.com');
    console.log('-----------------------------------');

    process.exit();
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedUsers();