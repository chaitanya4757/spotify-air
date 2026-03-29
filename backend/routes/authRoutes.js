const express = require("express");
const { login, callback, getMe, logout } = require("../controllers/authController");

const router = express.Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/me", getMe);
router.get("/logout", logout);

module.exports = router;