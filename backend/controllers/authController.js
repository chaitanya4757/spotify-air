import axios from "axios";
import querystring from "querystring";

const redirecturi= "http://localhost:5000/api/auth/callback";

export const login = (req, res) => {
    const scope=[
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing"
    ].json(" ");

    const params = querystring.stringify({
        response_type: "code",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope,
        redirect_uri: redirectUri
    });

    const authUrl= `https://accounts.spotify.com/authorize?${params}`;

     res.redirect(authUrl);
};

export const callback = async (req, res) => {
    const code = req.query.code || null;

    if (!code){
         return res.status(400).json({ error: "No code provided" });
    }

    if (process.env.MOCK_SPOTIFY === "true") {
    return res.json({
        message: "Mock Spotify login successful 🚀",
        access_token: "mock_access_token",
        refresh_token: "mock_refresh_token"
        });
    }
    try{
        const response = await axios.post(
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

        res.json({
            message: "Spotify token received (when API is live)",
            data: response.data
        });
    }catch (error) {
    console.error("Spotify Auth Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Spotify authentication failed" });
  }
};