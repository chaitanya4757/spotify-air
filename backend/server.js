import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import {Server} from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

// import { connect } from "http2";

dotenv.config();

connectDB()

const app=express();

const server = http.createServer(app);

const io = new Server(server, {
    cors:{
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"],
        Credentials: true
    }
});

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({message: "Spotify Air backend running 🚀"});
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", ()=>{
        console.log("User disconnected:", socket.id)
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});