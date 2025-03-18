require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/modules', require('./routes/moduleRoutes'));
app.use('/api/leads', require('./routes/leadRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 