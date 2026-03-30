const session = require("express-session");
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Import your custom files
const connectDB = require('./config/db'); // Ensure db.js uses module.exports
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const spotifyRoutes = require('./routes/spotifyRoutes'); // <--- 1. IMPORTED SPOTIFY ROUTES
const socketHandler = require('./socket/socketHandler'); 

// import { connect } from "http2";

dotenv.config();

console.log("CLIENT_ID:", process.env.SPOTIFY_CLIENT_ID);

const app=express();
const server = http.createServer(app);

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true only in production with HTTPS
      httpOnly: true
    }
  })
);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ DB Error:', err));

app.use("/api/auth", authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/spotify', spotifyRoutes); // <--- 2. MOUNTED SPOTIFY ROUTES

const io = socketHandler(server); // <--- Pass the server to the handler

app.get("/", (req, res) => {
    res.json({message: "Spotify Air backend running 🚀"});
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => 
    console.log(`🚀 Server running on port ${PORT}`));