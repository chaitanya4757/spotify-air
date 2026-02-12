require("dotenv").config();
const axios = require("axios");

(async () => {
  try {
    const res = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${process.env.GEMINI_API_KEY}`
    );

    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("ERROR:", err.response?.data || err.message);
  }
})();
