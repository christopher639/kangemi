const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const path = require('path'); // Added for path handling

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') }); // More robust path handling

// Connect to database
connectDB();

// Route files
const auth = require('./routes/authRoutes');
const members = require('./routes/memberRoutes');
const contributions = require('./routes/contributionRoutes');

const app = express();

// Enable CORS with options if needed
app.use(cors());

// Body parser with size limit
app.use(express.json({ limit: '10kb' })); // Prevent large payloads

// Mount routers
app.use('/api/auth', auth);
app.use('/api/members', members);
app.use('/api/contributions', contributions);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack); // Log stack trace for better debugging
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});