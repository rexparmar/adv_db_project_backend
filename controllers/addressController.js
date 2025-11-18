const db = require("../db/db");
const axios = require("axios");

exports.saveHomeAddress = async (req, res) => {
  console.log(req.body)
  const { address, latitude, longitude } = req.body;

  try {
    let lat, lng;
    let finalAddress = address;

    // 🟢 CASE 1: If frontend provided latitude and longitude directly
    if (latitude && longitude) {
      lat = latitude;
      lng = longitude;
      finalAddress = address || "Current Location";
    }
    // 🟢 CASE 2: If only address is provided → use Google Geocoding API
    else if (address) {
      const geoRes = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_API_KEY}`
      );

      if (!geoRes.data.results.length) {
        return res.status(400).json({ message: "Invalid address" });
      }

      const result = geoRes.data.results[0];
      lat = result.geometry.location.lat;
      lng = result.geometry.location.lng;
      finalAddress = result.formatted_address;
    } else {
      return res.status(400).json({ message: "No address or coordinates provided" });
    }

    // ✅ Save in MySQL (overwrite existing)
    db.query(
      `REPLACE INTO home_address (id, address, latitude, longitude) VALUES (1, ?, ?, ?)`,
      [finalAddress, lat, lng],
      (err) => {
        if (err) {
          console.error("DB insert error:", err);
          return res.status(500).json({ error: err.message });
        }

        res.json({
          message: "Home address saved successfully",
          address: finalAddress,
          latitude: lat,
          longitude: lng,
        });
      }
    );
  } catch (error) {
    console.error("Save address error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getHomeAddress = (req, res) => {
  db.query(`SELECT * FROM home_address WHERE id = 1`, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
};
