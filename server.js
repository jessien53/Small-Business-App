/*  Run backend first before frontend website using:
    node server.js
    otherwise frontend wont be able to fetch anything

    if node does not run do this before running it:
    npm install dotenv express axios cors

    use Crtl + C on the terminal to kill the server
*/
// Load environment variables
import dotenv from "dotenv";
dotenv.config();

// Import required modules
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express(); // Create an Express application
const PORT = 5000; // Define the port number for the server

// Middleware setup
app.use(cors()); // Enable CORS to allow frontend requests from different origins
app.use(express.json()); // Enable parsing of JSON request bodies

// Store fetched businesses in memory
let businesses = [];

// Function to fetch businesses from Yelp with pagination
async function fetchYelpBusinesses(apiKey, offset = 0) {
    const url = `https://api.yelp.com/v3/businesses/search?location=Chicago&limit=50&offset=${offset}`;
    const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
    });
    return response.data;
}

// Yelp API Endpoint (Fetch businesses in Chicago with < 500 Reviews)
app.get("/yelp", async (req, res) => {
  try {
      const apiKey = process.env.YELP_API_KEY;
      const page = parseInt(req.query.page) || 1; //default to page 1
      const limit = parseInt(req.query.limit) || 50;
      const offset = (page -1) * limit;
      let allBusinesses = [];
      // Make multiple requests to get more businesses
        // Yelp allows up to 1000 results with offset
        const numberOfRequests = 3; // This will get 150 businesses (3 * 50)
        
        for (let i = 0; i < numberOfRequests; i++) {
            const offset = i * limit;
            console.log(`Fetching businesses with offset ${offset}...`);
            
            const data = await fetchYelpBusinesses(apiKey, offset);
            
            if (data.businesses && data.businesses.length > 0) {
                allBusinesses = [...allBusinesses, ...data.businesses];
            } else {
                break; // No more results
            }
        }
      

      // Store the filtered businesses in memory
      businesses = allBusinesses
        .filter((business) => business.review_count < 500)
        .map((business) => ({
            name: business.name,
            type: business.categories[0]?.title || "Unknown",
            price: business.price || "N/A",
            address: business.location.address1,
            contact: business.display_phone || "N/A",
            rating: business.rating,
            review_count: business.review_count,
            description: business.alias || "No description available",
      }));

      res.json(businesses);
  } catch (error) {
    console.error("Yelp API Error:", error.message);
    res.status(500).json({ 
        error: "Failed to fetch Yelp data", 
        details: error.message 
    });  }
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
