import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import {server} from "socket.io";

dotenv.config();

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
