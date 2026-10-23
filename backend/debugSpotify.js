// Run from the backend folder:  node debugSpotify.js
// Optional:  node debugSpotify.js <spotify:track:uri> <displayName>
require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("./models/User");
const { getValidAccessToken } = require("./utils/spotifyService");

const TRACK = process.argv[2] || "spotify:track:6wg7xA2fWtLdmt99xTaCDn"; // prison
const NAME = process.argv[3];

const call = async (method, url, token, data) => {
  const r = await axios({
    method,
    url,
    data,
    headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true // never throw, we want to see every status
  });
  return { status: r.status, data: r.data };
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const section = (t) => console.log(`\n=== ${t}`);

const playerSummary = (r) => {
  if (r.status === 204 || !r.data) return `HTTP ${r.status} -> EMPTY (Spotify reports no active playback)`;
  const d = r.data;
  return {
    http: r.status,
    is_playing: d.is_playing,
    device: d.device && { name: d.device.name, type: d.device.type, is_active: d.device.is_active, is_restricted: d.device.is_restricted },
    item: d.item ? `${d.item.name} (${d.item.uri})` : null,
    currently_playing_type: d.currently_playing_type,
    shuffle: d.shuffle_state,
    repeat: d.repeat_state,
    actions_disallows: d.actions && d.actions.disallows
  };
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne(NAME ? { displayName: NAME } : {}).select("+accessToken +refreshToken");
  if (!user) {
    console.log("No user found in DB. Log in through the app first.");
    process.exit(1);
  }
  console.log(`Testing as: ${user.displayName}`);
  const token = await getValidAccessToken(user);

  section("1) Account (/me)");
  const me = await call("get", "https://api.spotify.com/v1/me", token);
  console.log({
    http: me.status,
    product: me.data.product, // must be "premium" for playback control
    country: me.data.country,
    explicit_filter_enabled: me.data.explicit_content && me.data.explicit_content.filter_enabled
  });

  section("2) Devices");
  const dev = await call("get", "https://api.spotify.com/v1/me/player/devices", token);
  console.log(dev.status, JSON.stringify(dev.data, null, 2));

  section("3) Player state BEFORE");
  console.log(playerSummary(await call("get", "https://api.spotify.com/v1/me/player", token)));

  const active = (dev.data.devices || []).find((d) => d.is_active) || (dev.data.devices || [])[0];
  if (!active) {
    console.log("\nNo devices. Open Spotify on this PC, play any song for a few seconds, then run again.");
    process.exit(0);
  }

  section(`4) PLAY ${TRACK} on "${active.name}"`);
  const play = await call("put", `https://api.spotify.com/v1/me/player/play?device_id=${active.id}`, token, {
    uris: [TRACK],
    position_ms: 0
  });
  console.log(`HTTP ${play.status}`, play.data && Object.keys(play.data).length ? JSON.stringify(play.data) : "(empty body = accepted)");

  for (const wait of [2, 4, 6]) {
    await sleep(2000);
    section(`5) Player state ${wait}s after play`);
    console.log(playerSummary(await call("get", "https://api.spotify.com/v1/me/player", token)));
  }

  console.log("\nDone. Paste everything above into the chat.");
  process.exit(0);
})().catch((e) => {
  console.error("Script error:", e.message);
  process.exit(1);
});