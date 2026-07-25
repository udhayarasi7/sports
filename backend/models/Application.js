const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  teamName: {
    type: String,
    required: true
  },
  captainName: {
    type: String
  },
  captainPhone: {
    type: String
  },
  teamMembers: [{
    name: { type: String },
    phone: { type: String },
    email: { type: String }
  }],
  targetCoachName: {
    type: String,
    required: true
  },
  targetCoachEmail: {
    type: String,
    required: true
  },
  workflowState: {
    type: String,
    enum: ['pending_coach_proof', 'pending_organizer_vetting', 'fully_enrolled'],
    default: 'pending_coach_proof'
  },
  status: {
    type: String,
    enum: ['applied', 'awaiting_payment', 'vetting', 'approved', 'rejected'],
    default: 'applied'
  },
  coachApproved: {
    type: Boolean,
    default: false
  },
  coachApprovalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'none'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'awaiting_upload', 'vetting', 'approved', 'rejected'],
    default: 'pending'
  },
  applicationStatus: {
    type: String,
    enum: ['applied', 'awaiting_payment', 'vetting', 'approved', 'rejected'],
    default: 'applied'
  },
  paymentScreenshot: {
    type: String // Cloudinary screenshot or path
  },
  declineReason: {
    type: String
  },
  requiresCoachApproval: {
    type: Boolean,
    default: false
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkInTime: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', ApplicationSchema);
