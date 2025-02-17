const { validationResult, body } = require("express-validator");
const User = require("../Model/user");
const { response } = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ResponseBuilder = require("../Response/ResponseBuilder"); 
const crypto = require("crypto");


const createUser = async (req, resp) => {
  try {
        const { name, email, password } = req.body;
        if (!name || name.trim() === "") {
          return resp.status(400).json({ error: "Name is required" });
        }
        if (!email || email.trim() === "") { 
            return resp.status(400).json({ error: "Email is required" });
        }
        const sanetizeEmail = email.trim().toLowerCase();
        const exit = await User.findOne({ email: sanetizeEmail });
        if (exit) {
          return ResponseBuilder.errorMessage("Email already exists",400).build(resp);
          
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        let data = new User({
            name: name,
            email: sanetizeEmail, 
            password: hashedPassword, 
        });
        let result = await data.save();

      return ResponseBuilder.successMessage("Data save successfully !",200,result).build(resp);
    }
    catch (error) {
        console.error("Error creating user:", error);
        return resp.status(500).json({ error: "Internal Server Error" });
    }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const secretKey = crypto.randomBytes(64).toString("hex");
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      secretKey,
      { expiresIn: "1h" }
    );

      return ResponseBuilder.successMessage("Login successfully!", 200, {token: token,}).build(res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  createUser,
  login,
};
