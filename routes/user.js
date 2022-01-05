// create router
const express = require("express");
const router = express.Router();

// import routes for user
const userCtrl = require("../controllers/user");

// routes for signup and login
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
