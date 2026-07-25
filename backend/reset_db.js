const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tournament = require('./models/Tournament');
const Application = require('./models/Application');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportshub';

async function resetApp() {
  console.log('Connecting to database...');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    // Reset war team application to pending_organizer_vetting
    const appId = '6a64d55306f0300c0c109a03';
    const app = await Application.findById(appId);
    if (!app) {
      console.log('Could not find kongu team application with ID:', appId);
      return;
    }

    app.workflowState = 'pending_organizer_vetting';
    app.status = 'applied';
    app.paymentStatus = 'pending';
    app.applicationStatus = 'applied';
    app.coachApproved = true;
    app.checkedIn = false;
    app.checkInTime = undefined;
    await app.save();
    console.log('Successfully reset application status to pending_organizer_vetting!');

    // Decrement tournament registeredCount
    const tournament = await Tournament.findById(app.tournament);
    if (tournament) {
      tournament.registeredCount = Math.max(0, (tournament.registeredCount || 0) - 1);
      await tournament.save();
      console.log(`Updated tournament registeredCount to ${tournament.registeredCount}`);
    }

  } catch (err) {
    console.error('Error during database update:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

resetApp();
