const db = require("../db/db");
const axios = require("axios");

exports.getNearbyPlaces = async (req, res) => {
  const { type = "restaurant", maxTime = 5 } = req.query;

  try {
    // 1. Get saved home address
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

    // 2. Places Nearby Search
    const placesRes = await axios.get(
  "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
  {
    params: {
      location: `${latitude},${longitude}`,
      radius: 3000,
      type: type,  
      key: process.env.GOOGLE_API_KEY,
    },
  }
);


    console.log("Places API:", placesRes.data);

    const candidates = placesRes.data.results.slice(0, 10);

    // If no places found
    if (!candidates.length) {
      return res.status(404).json({ message: "No places found nearby" });
    }

    // 3. Distance Matrix (time filter)
    const destinations = candidates.map(
      (p) => `${p.geometry.location.lat},${p.geometry.location.lng}`
    );

    const dmRes = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: `${latitude},${longitude}`,
          destinations: destinations.join("|"),
          mode: "driving",
          key: process.env.GOOGLE_API_KEY,
        },
      }
    );

    console.log("Distance Matrix:", dmRes.data);

    const filtered = candidates.filter((place, i) => {
      const durationSec = dmRes.data.rows[0].elements[i].duration.value;
      return durationSec <= maxTime * 60;
    });

    res.json(filtered);
  } catch (error) {
    console.log("Nearby error:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
};
