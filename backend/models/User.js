const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['player', 'coach', 'organizer', 'admin']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  phone: {
    type: String
  },
  playerDetails: {
    age: Number,
    discipline: String,
    skillLevel: String,
    institution: String,
    gender: String,
    sportsPreferences: [String]
  },
  coachDetails: {
    experience: String,
    discipline: String,
    academy: String,
    certifications: [String]
  },
  organizerDetails: {
    organizationName: String,
    title: String,
    address: String,
    licenseFile: [String]
  }
}, {
  timestamps: true
});

// Bcrypt middleware hook on save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
