const express = require('express');
const cors = require('cors');
const studentsData = require('./data.js'); // Import our mock database

// --- DEBUGGING STEP ---
// This will print the loaded data to your terminal when the server starts.
console.log('Data loaded from data.js:', studentsData);

const app = express();
const PORT = process.env.PORT || 3000; // Use Render's port or 3000 for local dev

// Enable CORS for all routes. This is crucial for allowing your frontend,
// which is on a different domain, to make requests to this backend.
app.use(cors());

// Add middleware to parse JSON bodies from incoming requests
app.use(express.json());

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

// API endpoint to UPDATE a student's data
app.put('/api/students/:id', (req, res) => {
  const studentId = req.params.id;
  const updatedData = req.body; // The new student data from the request

  // Check if the student exists in our data
  if (studentsData[studentId]) {
    // Update the student's data in our in-memory object
    studentsData[studentId] = { ...studentsData[studentId], ...updatedData };
    
    console.log(`Updated data for student ${studentId}:`, studentsData[studentId]);

    // Send a success response
    res.json({ message: 'Student data updated successfully', data: studentsData[studentId] });
  } else {
    // If the student doesn't exist, send a 404 error
    res.status(404).json({ error: 'Student not found' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});