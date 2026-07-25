const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Tournament = require('../models/Tournament');

// Apply to a Tournament (Team Enrollment)
router.post('/', async (req, res) => {
  try {
    const { playerId, tournamentId, teamName, captainName, captainPhone, teamMembers, targetCoachName, targetCoachEmail } = req.body;

    // Handle mock IDs for local sandbox development (Dev mode only)
    if (tournamentId && !mongoose.Types.ObjectId.isValid(tournamentId)) {
      if (process.env.NODE_ENV !== 'production' && (tournamentId.startsWith('t_mock_') || tournamentId.startsWith('mock_'))) {
        return res.status(201).json({
          success: true,
          application: {
            _id: `app_mock_${Date.now()}`,
            player: playerId || 'mock_player',
            tournament: tournamentId,
            teamName,
            captainName,
            captainPhone,
            teamMembers: teamMembers || [],
            targetCoachName,
            targetCoachEmail,
            workflowState: 'pending_coach_proof',
            status: 'applied',
            requiresCoachApproval: true,
            coachApproved: false
          }
        });
      }
      return res.status(400).json({ success: false, message: 'Invalid Tournament ID format' });
    }

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    // Check if team has already registered
    const existingApp = await Application.findOne({ tournament: tournamentId, teamName });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'A team with this name has already registered.' });
    }

    const newApp = new Application({
      player: playerId,
      tournament: tournamentId,
      teamName,
      captainName,
      captainPhone,
      teamMembers: teamMembers || [],
      targetCoachName,
      targetCoachEmail,
      workflowState: 'pending_coach_proof',
      status: 'applied',
      requiresCoachApproval: true,
      coachApproved: false
    });

    await newApp.save();

    res.status(201).json({ success: true, application: newApp });
  } catch (err) {
    console.error('Error applying to tournament:', err);
    res.status(500).json({ success: false, message: 'Server error processing application.' });
  }
});

// Get applications with filters
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline.' });
      }
      console.log('MongoDB is offline - returning empty applications list');
      return res.json({ success: true, applications: [] });
    }
    const { player, tournament, status, workflowState } = req.query;
    let filter = {};

    if (player) filter.player = player;
    if (tournament) filter.tournament = tournament;
    if (status) filter.status = status;
    if (workflowState) filter.workflowState = workflowState;

    const applications = await Application.find(filter)
      .populate('player', '-password')
      .populate('tournament');

    res.json({ success: true, applications });
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ success: false, message: 'Server error fetching applications.' });
  }
});

// GET /api/applications/coach-stream: Approve targeted streaming query
router.get('/coach-stream', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline.' });
      }
      console.log('MongoDB is offline - returning empty stream');
      return res.json({ success: true, applications: [] });
    }
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Coach email is required for streaming.' });
    }

    const applications = await Application.find({
      targetCoachEmail: email,
      workflowState: 'pending_coach_proof'
    })
      .populate('player', '-password')
      .populate('tournament');

    res.json({ success: true, applications });
  } catch (err) {
    console.error('Error in coach-stream:', err);
    res.status(500).json({ success: false, message: 'Server error in coach stream.' });
  }
});

// GET /api/applications/my-applications: Fetch player's enrollments
router.get('/my-applications', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline.' });
      }
      console.log('MongoDB is offline - returning empty enrollments list');
      return res.json({ success: true, applications: [] });
    }
    const player = req.query.player;
    if (!player) {
      return res.status(400).json({ success: false, message: 'Player identifier is required.' });
    }

    const applications = await Application.find({ player })
      .populate('player', '-password')
      .populate('tournament');

    res.json({ success: true, applications });
  } catch (err) {
    console.error('Error fetching my applications:', err);
    res.status(500).json({ success: false, message: 'Server error fetching my applications.' });
  }
});

// PUT /api/applications/:id/coach-submit-proof
router.put('/:id/coach-submit-proof', async (req, res) => {
  try {
    const { screenshot } = req.body;
    if (!screenshot) {
      return res.status(400).json({ success: false, message: 'Transaction screenshot proof is required.' });
    }

    // Handle mock IDs for local sandbox development (Dev mode only)
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      if (process.env.NODE_ENV !== 'production' && (req.params.id.startsWith('app_mock_') || req.params.id.startsWith('mock_'))) {
        return res.json({
          success: true,
          application: {
            _id: req.params.id,
            paymentScreenshot: screenshot,
            coachApproved: true,
            workflowState: 'pending_organizer_vetting',
            status: 'vetting',
            paymentStatus: 'vetting'
          }
        });
      }
      return res.status(400).json({ success: false, message: 'Invalid Application ID format' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.paymentScreenshot = screenshot;
    application.coachApproved = true;
    application.workflowState = 'pending_organizer_vetting';
    application.status = 'vetting';
    application.paymentStatus = 'vetting';

    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    console.error('Error in coach-submit-proof:', err);
    res.status(500).json({ success: false, message: 'Server error uploading screenshot proof.' });
  }
});

// PUT /api/applications/:id/vet-payment (Organizer Accept Team)
router.put('/:id/vet-payment', async (req, res) => {
  try {
    const { action, declineReason } = req.body;

    // Handle mock IDs for local sandbox development (Dev mode only)
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      if (process.env.NODE_ENV !== 'production' && (req.params.id.startsWith('app_mock_') || req.params.id.startsWith('mock_'))) {
        return res.json({
          success: true,
          application: {
            _id: req.params.id,
            workflowState: action === 'approve' ? 'fully_enrolled' : 'pending_coach_proof',
            status: action === 'approve' ? 'approved' : 'applied',
            paymentStatus: action === 'approve' ? 'approved' : 'rejected'
          }
        });
      }
      return res.status(400).json({ success: false, message: 'Invalid Application ID format' });
    }

    const application = await Application.findById(req.params.id).populate('tournament');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (action === 'approve') {
      application.workflowState = 'fully_enrolled';
      application.status = 'approved';
      application.paymentStatus = 'approved';
      application.applicationStatus = 'approved';

      const tournament = await Tournament.findById(application.tournament._id);
      if (tournament) {
        tournament.registeredCount = (tournament.registeredCount || 0) + 1;
        await tournament.save();

        // Trigger background email dispatch to both Player & Coach
        sendConfirmationEmails(application, tournament).catch(err => 
          console.error('Nodemailer background dispatch failed:', err)
        );
      }
    } else if (action === 'decline') {
      application.workflowState = 'pending_coach_proof';
      application.status = 'applied';
      application.paymentStatus = 'rejected';
      application.paymentScreenshot = '';
      application.declineReason = declineReason || 'Vetting rejected. Coach proof must be re-attached.';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid vetting action.' });
    }

    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    console.error('Error in payments vetting:', err);
    res.status(500).json({ success: false, message: 'Server error updating vetting state.' });
  }
});

// PUT /api/applications/:id/coach-approve (fallback)
router.put('/:id/coach-approve', async (req, res) => {
  try {
    const { approved } = req.body;

    // Handle mock IDs for local sandbox development (Dev mode only)
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      if (process.env.NODE_ENV !== 'production' && (req.params.id.startsWith('app_mock_') || req.params.id.startsWith('mock_'))) {
        return res.json({
          success: true,
          application: {
            _id: req.params.id,
            coachApproved: approved,
            workflowState: approved ? 'pending_organizer_vetting' : 'pending_coach_proof',
            status: approved ? 'vetting' : 'rejected'
          }
        });
      }
      return res.status(400).json({ success: false, message: 'Invalid Application ID format' });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (approved) {
      application.coachApproved = true;
      application.workflowState = 'pending_organizer_vetting';
      application.status = 'vetting';
    } else {
      application.status = 'rejected';
    }

    await application.save();
    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PUT /api/applications/:id/check-in
router.put('/:id/check-in', async (req, res) => {
  try {
    // Handle mock IDs for local sandbox development (Dev mode only)
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      if (process.env.NODE_ENV !== 'production' && (req.params.id.startsWith('app_mock_') || req.params.id.startsWith('mock_'))) {
        return res.json({
          success: true,
          application: {
            _id: req.params.id,
            checkedIn: true,
            checkInTime: new Date()
          }
        });
      }
      return res.status(400).json({ success: false, message: 'Invalid Application ID format' });
    }

    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline.' });
      }
      return res.json({
        success: true,
        application: {
          _id: req.params.id,
          checkedIn: true,
          checkInTime: new Date()
        }
      });
    }

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    application.checkedIn = true;
    application.checkInTime = new Date();
    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    console.error('Error in application check-in:', err);
    res.status(500).json({ success: false, message: 'Server error during check-in.' });
  }
});

// Helper: Configure Nodemailer Transporter (loads from env, fallbacks to ethereal.email sandbox account)
async function getEmailTransporter() {
  const nodemailer = require('nodemailer');
  console.log('Nodemailer: Loading SMTP config. Host =', process.env.SMTP_HOST, ', User =', process.env.SMTP_USER);
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: (process.env.SMTP_PASS || '').replace(/\s+/g, '')
      }
    });
  } else {
    // Generate test SMTP credentials dynamically
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
}

// Helper: Dispatch background emails to both Player & Coach
async function sendConfirmationEmails(application, tournament) {
  const nodemailer = require('nodemailer');
  try {
    let playerEmail = '';
    let playerName = '';
    
    // Fetch player profile from database
    const User = require('../models/User');
    const playerObj = await User.findById(application.player);
    if (playerObj) {
      playerEmail = playerObj.email;
      playerName = playerObj.name;
    }

    const coachEmail = application.targetCoachEmail;
    
    if (!playerEmail && !coachEmail) {
      console.log('Nodemailer: No recipient addresses located.');
      return;
    }

    const transporter = await getEmailTransporter();
    const eventDate = `${new Date(tournament.startDate).toLocaleDateString()} to ${new Date(tournament.endDate).toLocaleDateString()}`;
    const venue = `${tournament.locationName} (${tournament.city || 'N/A'}, ${tournament.state || 'N/A'})`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #f1f5f9; border-radius: 16px; background-color: #020617; color: #e6e0e9;">
        <div style="text-align: center; border-bottom: 2px solid #fbbf24; padding-bottom: 20px;">
          <h2 style="color: #fbbf24; margin: 0; font-size: 22px; text-transform: uppercase; letter-spacing: 1px;">Sports Hub Vetting Desk</h2>
          <p style="color: #94a3b8; margin: 8px 0 0 0; font-size: 13px;">Official Bracket Enrollment Verified</p>
        </div>
        
        <div style="padding: 24px 0;">
          <p style="color: #f1f5f9; font-size: 14px; font-weight: bold;">Dear Athlete & Coach,</p>
          <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">
            We are pleased to inform you that team <strong style="color: #fff;">${application.teamName}</strong> has been officially **Approved & Enrolled** for the upcoming tournament:
          </p>

          <div style="margin: 20px 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8; width: 120px;">Event Title:</td>
                <td style="padding: 6px 0; color: #fff; font-weight: bold;">${tournament.title} (${tournament.sport})</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Match Dates:</td>
                <td style="padding: 6px 0; color: #fff;">${eventDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Venue Arena:</td>
                <td style="padding: 6px 0; color: #fff;">${venue}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #94a3b8;">Entry Ticket ID:</td>
                <td style="padding: 6px 0; font-family: monospace; color: #10b981; font-weight: bold; font-size: 13px;">
                  APP-2026-${application._id.toString().slice(-4).toUpperCase()}
                </td>
              </tr>
            </table>
          </div>

          <div style="background-color: #1e1b4b; border: 1px solid #312e81; border-radius: 12px; padding: 16px;">
            <h4 style="margin: 0 0 8px 0; color: #fbbf24; font-size: 12px; text-transform: uppercase; tracking-wider: 1px;">Tournament Ground Rules</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 11px; color: #cbd5e1; line-height: 1.6;">
              <li>All athletes must present their Digital QR Pass (viewable under My Enrollments) at the entry gates.</li>
              <li>Roster changes must be locked in 24 hours prior to standard check-in.</li>
              <li>Standard safety gear and appropriate uniforms are mandatory for all matches.</li>
              <li>Teams must report to the coordinate registration desk 30 minutes before kick-off.</li>
            </ul>
          </div>
        </div>

        <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; font-size: 11px; color: #64748b;">
          <p style="margin: 0;">This is an automated notification from the Sports Hub Ecosystem Vetting Desk.</p>
          <p style="margin: 4px 0 0 0;">&copy; 2026 Sports Hub Inc. All rights reserved.</p>
        </div>
      </div>
    `;

    // 1. Send confirmation to Player
    if (playerEmail) {
      const mailOptions = {
        from: '"Sports Hub Vetting Desk" <no-reply@sportshub.io>',
        to: playerEmail,
        subject: `🏆 Enrollment Approved: ${tournament.title}`,
        html: htmlContent
      };
      const info = await transporter.sendMail(mailOptions);
      console.log(`Nodemailer: Confirmation sent to Player (${playerEmail}): ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[PREVIEW] Player Email Ticket URL: ${previewUrl}`);
      }
    }

    // 2. Send confirmation to Coach
    if (coachEmail) {
      const mailOptions = {
        from: '"Sports Hub Vetting Desk" <no-reply@sportshub.io>',
        to: coachEmail,
        subject: `📋 Team Approved: ${application.teamName} - ${tournament.title}`,
        html: htmlContent
      };
      const info = await transporter.sendMail(mailOptions);
      console.log(`Nodemailer: Confirmation sent to Coach (${coachEmail}): ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[PREVIEW] Coach Email Ticket URL: ${previewUrl}`);
      }
    }
  } catch (err) {
    console.error('Nodemailer: Error executing background email dispatch:', err);
  }
}

module.exports = router;
