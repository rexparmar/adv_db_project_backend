const db = require("../db/db");
const axios = require("axios");

exports.saveHomeAddress = async (req, res) => {
  const { address } = req.body;

  try {
    // 1. Call Google Geocoding API
    const geoRes = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.GOOGLE_API_KEY}`
    );

    console.log("Geocode response:", geoRes.data);

    if (!geoRes.data.results.length) {
      console.log("NO RESULTS FROM GOOGLE");
      return res.status(400).json({ message: "Invalid address" });
    }

    const result = geoRes.data.results[0];
    const lat = result.geometry.location.lat;
    const lng = result.geometry.location.lng;

    // 2. Store in database (overwrite single row)
    db.query(
      `REPLACE INTO home_address (id, address, latitude, longitude) VALUES (1, ?, ?, ?)`,
      [address, lat, lng]
    );

    res.json({ message: "Home address saved", address, lat, lng });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getHomeAddress = (req, res) => {
  db.query(`SELECT * FROM home_address WHERE id = 1`, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
};
