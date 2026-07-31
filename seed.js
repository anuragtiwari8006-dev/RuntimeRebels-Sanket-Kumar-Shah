const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/user');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostelhub';

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected!');

    try {
      await User.collection.drop();
      console.log('🧹 Cleaned existing user database.');
    } catch (dropError) {
      if (dropError.code !== 26) console.log('ℹ️ Drop note:', dropError.message);
    }

    // Warden User
    const warden = new User({
      name: 'Warden Admin',
      email: 'warden@hostelhub.com',
      password: 'wardenpassword123',
      role: 'WARDEN'
    });
    await warden.save();

    // Resident User
    const resident = new User({
      name: 'Anurag Tiwari',
      email: 'anurag@hostelhub.com',
      password: 'residentpassword123',
      role: 'RESIDENT',
      roomNumber: '102-B'
    });
    await resident.save();

    console.log('🚀 Database Seeded Successfully!');
    console.log('---------------------------------');
    console.log('Warden Credentials:   warden@hostelhub.com / wardenpassword123');
    console.log('Resident Credentials: anurag@hostelhub.com / residentpassword123');
    console.log('---------------------------------');

    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();