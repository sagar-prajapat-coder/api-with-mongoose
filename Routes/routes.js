const express = require("express");
const { createUser,login } = require("../Controllers/UserController");

const router = express.Router();


// Apply validation middleware before the controller function
router.post("/create-user", createUser);
router.post("/login", login);

module.exports = router;
