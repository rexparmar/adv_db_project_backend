const db = require("../db/db");
const axios = require("axios");

exports.getNearbyPlaces = async (req, res) => {
  // frontend sends ?type=school&radius=5000
  const { type = "restaurant", radius = 3000 } = req.query;

  try {
    // 1️. Get saved home address
    const [home] = await new Promise((resolve, reject) => {
      db.query(`SELECT * FROM home_address WHERE id = 1`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (!home) {
      return res.status(400).json({ message: "Home address not set" });
    }

    const { latitude, longitude } = home;

    // 2️. Fetch nearby places from Google
    const placesRes = await axios.get(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {
        params: {
          location: `${latitude},${longitude}`,
          radius: radius, //use user input from frontend
          type,
          key: process.env.GOOGLE_API_KEY,
        },
      }
    );

    const places = placesRes.data.results;

    if (!places.length) {
      return res.status(404).json({ message: "No places found" });
    }

    // 3️. Save each place to the locations table
    for (const place of places) {
      const { name, vicinity, geometry } = place;

      db.query(
        `INSERT INTO locations (name, address, latitude, longitude)
         VALUES (?, ?, ?, ?)`,
        [
          name,
          vicinity || "",
          geometry.location.lat,
          geometry.location.lng,
        ],
        (err) => {
          if (err) console.error("DB insert error:", err);
        }
      );
    }

    // 4️. Return the response to frontend
    res.json(places);
  } catch (error) {
    console.error("Nearby error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
