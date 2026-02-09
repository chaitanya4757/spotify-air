const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  currentTrack: {
    uri: String,
    title: String,
    artist: String,
    albumArt: String,
    isPlaying: { type: Boolean, default: false },
    progressMs: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  
  currentVibe: {
    mood: { type: String, default: 'Neutral' },
    colorHex: { type: String, default: '#1DB954' }, 
    lyricsSnippet: String
  },

  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      socketId: String,
      joinedAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400
  }
});

module.exports = mongoose.model('Room', roomSchema);