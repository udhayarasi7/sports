const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Tournament = require('./models/Tournament');
const Application = require('./models/Application');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportshub';

async function queryAll() {
  console.log('Connecting to database...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Fetching collections...\n');

    // Query Users
    const users = await User.find({}, '-password');
    console.log('=== USERS COLLECTION ===');
    console.log(JSON.stringify(users, null, 2));
    console.log(`Total: ${users.length} documents\n`);

    // Query Tournaments
    const tournaments = await Tournament.find({});
    console.log('=== TOURNAMENTS COLLECTION ===');
    console.log(JSON.stringify(tournaments, null, 2));
    console.log(`Total: ${tournaments.length} documents\n`);

    // Query Applications
    const applications = await Application.find({})
      .populate('player', 'name email role')
      .populate('tournament', 'title sport');
    console.log('=== APPLICATIONS COLLECTION ===');
    console.log(JSON.stringify(applications, null, 2));
    console.log(`Total: ${applications.length} documents\n`);

  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

queryAll();
