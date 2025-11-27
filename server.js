const express = require('express');
const cors = require('cors');
const studentsData = require('./data.js'); // Import our mock database

const app = express();
const PORT = process.env.PORT || 3000; // Use Render's port or 3000 for local dev

// Enable CORS for all routes. This is crucial for allowing your frontend,
// which is on a different domain, to make requests to this backend.
app.use(cors());

// Define a simple route for the root URL to confirm it's working
app.get('/', (req, res) => {
  res.send('Report Card API is running!');
});

// The main API endpoint to get a student's data.
// It uses a dynamic parameter `:id` to capture the student ID from the URL.
app.get('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  const student = studentsData[studentId];

  if (student) {
    res.json(student); // If found, send the student data as JSON
  } else {
    res.status(404).json({ error: 'Student not found' }); // If not found, send a 404 error
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});