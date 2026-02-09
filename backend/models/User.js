const mongoose = require('mongoose');

const userSchema =new mongoose.Schema({
    spotifyId: {
        type: String,
        required: true,
        unique: true, 
        index: true   
  },
    displayName: {
        type: String,
        required: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true 
  },
  images: [
    {
      url: String,
      height: Number,
      width: Number
    }
  ],
  accessToken: {
    type: String,
    required: true,
    select: false 
  },
  refreshToken: {
    type: String,
    required: true,
    select: false 
  },
  tokenExpiresIn: {
    type: Number,
    required: true
  },
  tokenUpdatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.needsRefresh = function() {
  const now = Date.now();
  return now >= (this.tokenUpdatedAt.getTime() + (this.tokenExpiresIn * 1000) - 300000);
};

module.exports = mongoose.model('User', userSchema);