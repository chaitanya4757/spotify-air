const axios = require("axios");
const querystring = require("querystring");
const User = require("../models/User");

const redirectUri = "http://localhost:5000/api/auth/callback";

exports.login = async (req, res) => {
  console.log("MOCK_SPOTIFY:", process.env.MOCK_SPOTIFY);

  if (process.env.MOCK_SPOTIFY === "true") {
    let user = await User.findOne();

    if (!user) {
      user = await User.create({
        spotifyId: "mock123",
        displayName: "Mock User",
        email: "mock@example.com",
        images: [],
        accessToken: "mock",
        refreshToken: "mock",
        tokenExpiresIn: 3600,
        tokenUpdatedAt: Date.now()
      });
      console.log("Created mock user");
    }

    req.session.userId = user._id;

    console.log("Redirecting to frontend...");
    return res.redirect("http://localhost:5173");
  }

  // Real Spotify flow
  const scope = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing"
  ].join(" ");

  const params = querystring.stringify({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope,
    redirect_uri: redirectUri
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
};


exports.callback = async (req, res) => {
  const code = req.query.code || null;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  if (process.env.MOCK_SPOTIFY === "true") {
    const user = await User.findOne();
    if (user) {
      req.session.userId = user._id;
    }
    return res.json({ message: "Mock login successful 🚀" });
  }

  try {
    const tokenResponse = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri
      }),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              process.env.SPOTIFY_CLIENT_ID +
                ":" +
                process.env.SPOTIFY_CLIENT_SECRET
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;

    const profileResponse = await axios.get(
      "https://api.spotify.com/v1/me",
      {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    const profile = profileResponse.data;

    let user = await User.findOne({ spotifyId: profile.id });

    if (!user) {
      user = await User.create({
        spotifyId: profile.id,
        displayName: profile.display_name,
        email: profile.email,
        profileImage: profile.images?.[0]?.url,
        accessToken: access_token,
        refreshToken: refresh_token
      });
    } else {
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      await user.save();
    }

    req.session.userId = user._id;

    res.json({ message: "Login successful" });

  } catch (error) {
    console.error("Spotify Auth Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Spotify authentication failed" });
  }
};

exports.getMe = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ user: null });
  }

  const user = await User.findById(req.session.userId)
    .select("-accessToken -refreshToken");

  res.json({ user });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
};

