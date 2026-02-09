const express = require('express');
const router = express.Router();

const { createRoom, getRoom, testSpotify } = require('../controllers/roomController');

router.post('/create', createRoom);
router.get('/:roomId', getRoom);

// Temporary test route
router.get('/test-spotify/:userId', testSpotify);

module.exports = router;
