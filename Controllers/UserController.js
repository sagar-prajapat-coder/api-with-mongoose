import User from "../Model/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ResponseBuilder from "../Response/ResponseBuilder.js";
import crypto from "crypto";
import dotenv from "dotenv";
import UserResource from "../Resources/UserResource.js";
import Lang from "../Lang/en.js";
import sendEmail from "../Mail/sendEmail.js";
import sendSMS from "../Services/smsService.js";
dotenv.config();

export const AuthServices = {
  createUser: async (req, resp) => {
    try {
      const { name, email, password, phone } = req.body;
      if (!name || name.trim() === "") {
        return resp.status(400).json({ error: "Name is required" });
      }
      if (!email || email.trim() === "") {
        return resp.status(400).json({ error: "Email is required" });
      }
      const sanetizeEmail = email.trim().toLowerCase();
      const exit = await User.findOne({ email: sanetizeEmail });
      if (exit) {
        return ResponseBuilder.errorMessage("Email already exists", 400).build(
          resp
        );
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      let data = new User({
        name: name,
        email: sanetizeEmail,
        password: hashedPassword,
        phone: phone,
      });
      let result = await data.save();
      await sendEmail(
        email,
        "Welcome to Our App",
        `Hello ${name}, welcome to our platform!`
      );
 
      // Send SMS after successful registration
      const smsMessage = `Hello ${name}, your registration was successful! Welcome to our platform.`;
      await sendSMS(phone, smsMessage);

      return ResponseBuilder.successMessage(
        Lang.SUCCESS.USER_CREATED,
        200,
        result
      ).build(resp);
    } catch (error) {
      console.error("Error creating user:", error);
      return resp.status(500).json({ error: "Internal Server Error" });
    }
  },

  login: async (req, res) => {
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
      // const secretKey = crypto.randomBytes(64).toString("hex");
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return ResponseBuilder.successMessage(Lang.SUCCESS.LOGIN_SUCCESS, 200, {
        token: token,
      }).build(res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const user = req.user;
      const formattedUser = UserResource.format(user);
      return new ResponseBuilder(
        Lang.SUCCESS.PROFILE_FETCHED,
        200,
        formattedUser
      ).build(res);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateProfile: async (req, resp) => {
    try {
      const userId = req.user._id;
      const { name, email, password } = req.body;
      const profileImage = req.file ? req.file.path : null;

      const user = await User.findById(userId);
      if (!user) {
        return new ResponseBuilder("User not found", 404).build(res);
      }
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
      if (profileImage) user.profileImage = profileImage; 

      await user.save();
      return new ResponseBuilder(Lang.SUCCESS.PROFILE_UPDATED, 200, user).build(
        resp
      );
    } catch (error)
    {
      return res.status(500).json({message: "Internal Server Error"});
    }

  },
};
