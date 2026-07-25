const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tournament = require('./models/Tournament');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportshub';

async function seed() {
  console.log('Connecting to database...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    // Check if Chennai tournament already exists
    const existing = await Tournament.findOne({ city: 'Chennai', state: 'Tamil Nadu' });
    if (existing) {
      console.log('Chennai tournament already exists:', existing.title);
      return;
    }

    const tournament = new Tournament({
      title: 'Chennai Elite Super Cup',
      sport: 'Soccer',
      level: 'Professional',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-08-10'),
      locationName: 'Jawaharlal Nehru Stadium',
      city: 'Chennai',
      state: 'Tamil Nadu',
      location: {
        type: 'Point',
        coordinates: [80.2707, 13.0827]
      },
      capacity: 32,
      registeredCount: 0,
      prizePool: 250000,
      status: 'scheduled',
      requiresCoachApproval: true
    });

    await tournament.save();
    console.log('Successfully seeded Chennai tournament:', tournament.title);

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Connection closed.');
  }
}

seed();
