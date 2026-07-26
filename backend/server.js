const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const tournamentRoutes = require('./routes/tournaments');
const applicationRoutes = require('./routes/applications');

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/applications', applicationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sports Hub API is running' });
});

// Serve static assets from frontend if built
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Connect to MongoDB with connection caching for serverless environments
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sportshub';

app.locals.lastDbError = null;

let dbConnecting = null;
async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!dbConnecting) {
    console.log('Initiating MongoDB connection...');
    dbConnecting = mongoose.connect(MONGODB_URI).then((m) => {
      console.log('Connected to MongoDB successfully');
      app.locals.lastDbError = null;
      dbConnecting = null;
      return m;
    }).catch((err) => {
      console.error('MongoDB connection error:', err);
      app.locals.lastDbError = err.message || String(err);
      dbConnecting = null;
      throw err;
    });
  }
  return dbConnecting;
}

// Middleware to ensure DB connection is established for API requests before routing
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Failed to establish database connection:', err);
    next(); // Continue to let route handlers handle the state gracefully
  }
});

// Only listen locally; Vercel wraps the serverless environment and handles requests via exports
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
