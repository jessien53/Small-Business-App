// Load environment variables from the .env file
require('dotenv').config();

// Import required modules
const express = require('express'); // Web framework for Node.js
const axios = require('axios'); // Library for making HTTP requests
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing

const app = express(); // Create an Express application
const PORT = 5000; // Define the port number for the server

// Middleware setup
app.use(cors()); // Enable CORS to allow frontend requests from different origins
app.use(express.json()); // Enable parsing of JSON request bodies

// Define an API endpoint to fetch businesses from Yelp
app.get('/api/businesses', async (req, res) => {
  // Extract query parameters from the request (e.g., location and search term)
  const { location, term } = req.query;

  try {
    // Make a GET request to the Yelp API
    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: { Authorization: `Bearer ${process.env.YELP_API_KEY}` }, // Send API key in headers
      params: { location, term, limit: 5 }, // Set query parameters (location, term, limit results to 5)
    });

    // Send the received data back to the frontend
    res.json(response.data.businesses);
  } catch (error) {
    // Handle errors and send an error response
    res.status(500).json({ error: error.message });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
