# 🎧 Spotify Air

![Spotify Air Banner](https://via.placeholder.com/1200x400?text=Spotify+Air+-+Real-Time+Music+Sharing) 

**Spotify Air** is a real-time music sharing and visualization application that redefines collaborative listening. Built with the MERN stack and powered by the Spotify API, it allows users to connect in shared audio rooms, visualize music through AI-driven vibe maps, and democratically manage what plays next.

## 📖 About the Project

Music is inherently social, but managing a group playlist is usually a chaotic tug-of-war. Whether you are at a house party, on a road trip, or hanging out in a Discord call, the "pass the aux cable" method is outdated, and one person usually ends up playing dictator over the music. 

**Spotify Air** was built to solve this problem by transforming passive listening into a fully interactive, democratic experience. 

### The Purpose
The core mission of Spotify Air is to decentralize the DJ experience. We wanted to build a platform where every listener in a room has an equal voice in curating the vibe. By bridging real-time WebSocket communication with the Spotify API, this project eliminates the friction of shared listening.

### Why It's Useful
Spotify Air isn't just another music player wrapper; it is a social listening room. 
* **For Gatherings & Parties:** No more fighting over the speaker connection. Guests can simply join the room from their own phones, search the Spotify library, and add their tracks to a shared queue.
* **Fair Play:** The democratic voting system means if a song is killing the vibe, the room can collectively vote to skip it. 
* **Visual Immersion:** We integrated an AI Vibe Engine that reads the mood, tempo, and audio features of the current track to generate real-time visual maps, turning a simple listening session into an immersive audiovisual experience. 

Ultimately, Spotify Air brings people together by making music curation a shared, engaging, and visually dynamic activity.

## ✨ Key Features

* **Real-Time Synchronization:** Seamless music playback across multiple connected clients using WebSockets.
* **Democratic Queue Management:** A fair, interactive system for users to add, vote on, and skip tracks in the shared queue.
* **AI Vibe Maps & Visualization:** Dynamic visual engines that react to the mood, tempo, and audio features of the currently playing track.
* **Interactive UI:** Highly polished, responsive song cards and player controls built for an immersive user experience.
* **Spotify Integration:** Full integration with the Spotify API for secure authentication, searching tracks, and managing playback state.

## 🛠️ Tech Stack

**Frontend:**
* React.js
* Tailwind CSS (v4)
* Socket.io-client

**Backend:**
* Node.js
* Express.js
* Socket.io (Real-time bi-directional communication)

**Database:**
* MongoDB (with Mongoose)

**Third-Party Services:**
* Spotify Web API
* AI Vibe Engine (Generative visualization/mood mapping)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v16.x or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
* A Spotify Developer Account with a registered app to obtain your `Client ID` and `Client Secret`.

### Installation

**1. Clone the repository:**
```bash
git clone [https://github.com/your-username/spotify-air.git](https://github.com/your-username/spotify-air.git)
cd spotify-air