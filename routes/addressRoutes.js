const express = require("express");
const router = express.Router();
const { saveHomeAddress, getHomeAddress } = require("../controllers/addressController");

router.post("/save", saveHomeAddress);
router.get("/", getHomeAddress);

module.exports = router;
    