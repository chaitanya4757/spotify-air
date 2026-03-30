const express = require('express');
const router = express.Router();
const { searchTracks } = require('../controllers/spotifyController');

router.get('/search', searchTracks);

module.exports = router;