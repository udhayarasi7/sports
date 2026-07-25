const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  sport: {
    type: String,
    required: true
  },
  level: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  locationName: {
    type: String,
    required: true
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  capacity: {
    type: Number,
    required: true
  },
  registeredCount: {
    type: Number,
    default: 0
  },
  prizePool: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'draft'],
    default: 'scheduled'
  },
  requiresCoachApproval: {
    type: Boolean,
    default: false
  },
  bannerUrl: {
    type: String
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Mixed', 'Any'],
    default: 'Any'
  },
  ageDivision: {
    type: String,
    enum: ['Open', 'U-12', 'U-15', 'U-17', 'U-19', 'U-23', 'Seniors', 'Masters'],
    default: 'Open'
  },
  divisionType: {
    type: String,
    enum: ['Standard', 'Para-Athletics', 'Unified'],
    default: 'Standard'
  }
}, {
  timestamps: true
});

// Set up 2dsphere indexing for GeoJSON queries
TournamentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Tournament', TournamentSchema);
