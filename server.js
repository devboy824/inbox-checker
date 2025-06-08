const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const inboxRoutes = require('./routes/inboxRoutes');
const testMailRoute = require('./routes/testMailRoute');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/inbox', inboxRoutes);
app.use('/api', testMailRoute);

// Root Route
app.get('/', (req, res) => {
  res.send('Email Inbox Checker API is running');
  console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack || err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
