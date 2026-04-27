# 🎧 Spotify Air

![Spotify Air](https://via.placeholder.com/1200x400?text=Spotify+Air+-+Real-Time+Music+Sharing) 

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
* A Spotify Developer Account with a registered app to obtain your `Client ID` and `Client Secret`.(This requires a Premium account)

## ⚙️ Installation & Setup Guide

### Phase 1: Spotify Developer Dashboard Setup
Since Spotify Air relies heavily on the Spotify Web API, you must create an application in the Spotify Developer Dashboard to get your unique credentials.

**1. Create a Developer App**
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in with your Spotify account.
2. Click on the **Create app** button.
3. Fill in the App Name (e.g., "Spotify Air Local") and App Description.
4. For the **Redirect URI**, enter the exact URL your frontend will use to authenticate. If you are running this locally, enter: 
   `http://localhost:3000/callback` *(Update the port if your frontend runs on a different one, like 5173).*
5. Check the Developer Terms of Service box and click **Save**.

**2. Retrieve Your Credentials**
1. On your new app's dashboard, click on **Settings**.
2. Here, you will see your **Client ID**. Copy this down.
3. Click **View client secret** to reveal your **Client Secret**. Copy this down as well. *(Never commit these keys to GitHub!)*

**3. Whitelist Test Users (Crucial for Development Mode)**
Because the app is in Development Mode, only explicitly whitelisted users can log in.
1. In your app's dashboard, go to the **User Management** tab.
2. Add the Spotify account email addresses of anyone who will be testing the app (up to a maximum of 5 users). 
3. *Note: All whitelisted users must have an active Spotify Premium subscription to use the Web Playback features.*

---

### Phase 2: Environment Configuration

Now that you have your Spotify credentials, you need to link them to the local code. 

**1. Backend Environment**
Navigate to the `backend` folder and create a file named `.env`. Add the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
SPOTIFY_CLIENT_ID=paste_your_client_id_here
SPOTIFY_CLIENT_SECRET=paste_your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
CLIENT_URL=http://localhost:3000
```
**2. Frontend Enviroment:**
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

**3. Running the Application Locally:**

Start the Backend Server:  
cd backend
npm install
npm run dev

Start the Frontend Server:  
cd frontend
npm install
npm run dev
