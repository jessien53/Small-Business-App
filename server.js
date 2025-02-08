/*  Run backend first before frontend website using:
    node server.js
    otherwise frontend wont be able to fetch anything
*/
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

// Yelp API Endpoint (Fetch businesses in Chicago with < 500 Reviews)
app.get("/yelp", async (req, res) => {
  try {
      const apiKey = process.env.YELP_API_KEY;
      const url = `https://api.yelp.com/v3/businesses/search?location=Chicago&limit=50`; 

      const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${apiKey}` },
      });

      const yelpData = response.data.businesses
          .filter((business) => business.review_count < 500) // Only keep businesses with < 500 reviews
          .map((business) => ({
              
              name: business.name,
              type: business.categories[0]?.title || "Unknown",
              price: business.price || "N/A",
              address: business.location.address1,
              contact: business.display_phone || "N/A",
              rating: business.rating,
              review_count: business.review_count, // Include review count in response
              description: business.alias || "No description available",
              hours: business.hours ? business.hours[0].open : "Not available",
              
          }));

      res.json(yelpData);
  } catch (error) {
      res.status(500).json({ error: "Failed to fetch Yelp data", details: error.message });
  }
});

// get specific business by name
app.get("/business/:name", (req,res)=>{
  const name = req.params.name;
  const business = businesses.find((b) => b.name.toLowerCase() === name.toLowerCase());

  if (business) {
      res.json(business);
  } else {
      res.status(404).json({ error: "Business not found" });
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
