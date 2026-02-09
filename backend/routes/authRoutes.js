const express = require("express");
const { login, callback, getMe } = require("../controllers/authController");

const router = express.Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/me", getMe);

module.exports = router;
