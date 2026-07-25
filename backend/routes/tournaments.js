const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Tournament = require('../models/Tournament');
const Application = require('../models/Application');

// Get all tournaments (optionally near location)
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline. Please try again later.' });
      }
      console.log('MongoDB is offline - returning mock tournaments list');
      return res.json({
        success: true,
        tournaments: [
          {
            _id: 't_mock_1',
            title: 'Chennai Elite Super Cup',
            sport: 'Soccer',
            level: 'Professional',
            startDate: new Date('2026-08-01'),
            endDate: new Date('2026-08-10'),
            locationName: 'Jawaharlal Nehru Stadium',
            city: 'Chennai',
            state: 'Tamil Nadu',
            capacity: 32,
            registeredCount: 5,
            prizePool: 250000,
            status: 'scheduled',
            requiresCoachApproval: true
          },
          {
            _id: 't_mock_2',
            title: 'Regional Soccer Knockout',
            sport: 'Soccer',
            level: 'Intermediate',
            startDate: new Date('2026-09-05'),
            endDate: new Date('2026-09-12'),
            locationName: 'Nehru Indoor Stadium',
            city: 'Chennai',
            state: 'Tamil Nadu',
            capacity: 16,
            registeredCount: 2,
            prizePool: 125400,
            status: 'scheduled',
            requiresCoachApproval: true
          },
          {
            _id: 't_mock_3',
            title: 'Monsoon Badminton Open',
            sport: 'Badminton',
            level: 'Professional',
            startDate: new Date('2026-10-01'),
            endDate: new Date('2026-10-05'),
            locationName: 'Prime Sports Club',
            city: 'Chennai',
            state: 'Tamil Nadu',
            capacity: 64,
            registeredCount: 12,
            prizePool: 15000,
            status: 'scheduled',
            requiresCoachApproval: true
          }
        ]
      });
    }

    const { lng, lat, maxDistance, status, city, state } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }
    if (city) {
      query.city = city;
    }
    if (state) {
      query.state = state;
    }

    // GeoJSON spatial query if coordinates provided
    if (lng && lat) {
      const longitude = parseFloat(lng);
      const latitude = parseFloat(lat);
      const distMax = parseFloat(maxDistance) || 100000; // default 100km

      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: distMax
        }
      };
    }

    const tournaments = await Tournament.find(query);
    
    // Dynamically calculate registeredCount based on non-rejected applications
    const tournamentsWithCounts = await Promise.all(
      tournaments.map(async (t) => {
        const count = await Application.countDocuments({
          tournament: t._id,
          status: { $ne: 'rejected' }
        });
        const tObj = t.toObject();
        tObj.registeredCount = count;
        return tObj;
      })
    );

    res.json({ success: true, tournaments: tournamentsWithCounts });
  } catch (err) {
    console.error('Error fetching tournaments:', err);
    res.status(500).json({ success: false, message: 'Server error fetching tournaments.' });
  }
});

// Create Tournament
router.post('/', async (req, res) => {
  try {
    const { title, sport, level, startDate, endDate, locationName, longitude, latitude, capacity, prizePool, status, requiresCoachApproval, bannerUrl, city, state, gender, ageDivision, divisionType } = req.body;

    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline. Please try again later.' });
      }
      return res.status(201).json({
        success: true,
        tournament: {
          _id: `t_mock_${Date.now()}`,
          title,
          sport,
          level,
          startDate,
          endDate,
          locationName,
          city,
          state,
          capacity: parseInt(capacity || 0),
          prizePool: parseFloat(prizePool || 0),
          status: status || 'scheduled',
          requiresCoachApproval: !!requiresCoachApproval,
          bannerUrl: bannerUrl || '',
          gender: gender || 'Any',
          ageDivision: ageDivision || 'Open',
          divisionType: divisionType || 'Standard'
        }
      });
    }

    const newTournament = new Tournament({
      title,
      sport,
      level,
      startDate,
      endDate,
      locationName,
      city,
      state,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude || 0), parseFloat(latitude || 0)]
      },
      capacity: parseInt(capacity),
      prizePool: parseFloat(prizePool),
      status: status || 'scheduled',
      requiresCoachApproval: !!requiresCoachApproval,
      bannerUrl: bannerUrl || '',
      gender: gender || 'Any',
      ageDivision: ageDivision || 'Open',
      divisionType: divisionType || 'Standard'
    });

    await newTournament.save();
    res.status(201).json({ success: true, tournament: newTournament });
  } catch (err) {
    console.error('Error creating tournament:', err);
    res.status(500).json({ success: false, message: 'Server error creating tournament.' });
  }
});

// Update Tournament
router.put('/:id', async (req, res) => {
  try {
    const { title, sport, level, startDate, endDate, locationName, longitude, latitude, capacity, prizePool, status, requiresCoachApproval, bannerUrl, city, state, gender, ageDivision, divisionType } = req.body;

    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline. Please try again later.' });
      }
      return res.json({
        success: true,
        tournament: {
          _id: req.params.id,
          title,
          sport,
          level,
          startDate,
          endDate,
          locationName,
          city,
          state,
          capacity: parseInt(capacity || 0),
          prizePool: parseFloat(prizePool || 0),
          status,
          requiresCoachApproval: !!requiresCoachApproval,
          bannerUrl,
          gender,
          ageDivision,
          divisionType
        }
      });
    }

    const updateData = {
      title,
      sport,
      level,
      startDate,
      endDate,
      locationName,
      city,
      state,
      capacity: parseInt(capacity),
      prizePool: parseFloat(prizePool),
      status,
      requiresCoachApproval: !!requiresCoachApproval,
      bannerUrl,
      gender,
      ageDivision,
      divisionType
    };

    if (longitude !== undefined && latitude !== undefined) {
      updateData.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
    }

    const tournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    res.json({ success: true, tournament });
  } catch (err) {
    console.error('Error updating tournament:', err);
    res.status(500).json({ success: false, message: 'Server error updating tournament.' });
  }
});

// Delete Tournament
router.delete('/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(503).json({ success: false, message: 'Database offline.' });
      }
      return res.json({ success: true, message: 'Tournament deleted successfully.' });
    }

    const tournament = await Tournament.findByIdAndDelete(req.params.id);
    if (!tournament) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }
    res.json({ success: true, message: 'Tournament deleted successfully.' });
  } catch (err) {
    console.error('Error deleting tournament:', err);
    res.status(500).json({ success: false, message: 'Server error deleting tournament.' });
  }
});

module.exports = router;
