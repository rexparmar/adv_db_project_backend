const express = require("express");
const router = express.Router();
const { getNearbyPlaces } = require("../controllers/nearbyController");

router.get("/", getNearbyPlaces);

module.exports = router;
