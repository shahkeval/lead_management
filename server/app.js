const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    //http://localhost:3000
    // https://lead-management-front.vercel.app
    origin: 'https://lead-management-front.vercel.app', // Allow only your frontend domain
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Allow cookies and authentication headers
  })
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', require('./routes/leadRoutes'));

app.get('/', async (req, res) => {
  res.json("WORKING");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 