import User from "../Model/user.js";
import multer from "multer";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import ResponseBuilder from "../Response/ResponseBuilder.js";
import dotenv from "dotenv";
import UserResource from "../Resources/UserResource.js";
import Lang from "../Lang/en.js";
import sendEmail from "../Mail/sendEmail.js";
import sendSMS from "../Services/smsService.js";

dotenv.config();

// 🖼️ Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store images in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file to avoid conflicts
  },
});

const upload = multer({ storage: storage }).single("profileImage");

export const AuthServices = {
  createUser: async (req, resp) => {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password || !phone) {
        return resp.status(400).json({ error: "All fields are required" });
      }

      const sanetizeEmail = email.trim().toLowerCase();
      const exist = await User.findOne({ email: sanetizeEmail });

      if (exist) {
        return ResponseBuilder.errorMessage("Email already exists", 400).build(resp);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        name,
        email: sanetizeEmail,
        password: hashedPassword,
        phone,
      });

      await user.save();
      
      await sendEmail(email, "Welcome to Our App", `Hello ${name}, welcome to our platform!`);
      await sendSMS(phone, `Hello ${name}, your registration was successful! Welcome to our platform.`);

      return ResponseBuilder.successMessage(Lang.SUCCESS.USER_CREATED, 201, user).build(resp);
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

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      return ResponseBuilder.successMessage(Lang.SUCCESS.LOGIN_SUCCESS, 200, { token }).build(res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getUserProfile: async (req, res) => {
    try {
      const user = req.user;
      const formattedUser = UserResource.format(user);

      return new ResponseBuilder(Lang.SUCCESS.PROFILE_FETCHED, 200, formattedUser).build(res);
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  },

  updateProfile: async (req, resp) => {
    try {
      upload(req, resp, async (err) => {
        if (err) {
          return resp.status(400).json({ message: "Image upload failed" });
        }

        const userId = req.user._id;
        const { name, email, password } = req.body;
        const profileImage = req.filename ? `/Uploads/${req.file.filename}` : null;

        console.log(profileImage)
        const user = await User.findById(userId);
        if (!user) {
          return new ResponseBuilder("User not found", 404).build(resp);
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (password) {
          user.password = await bcrypt.hash(password, 10);
        }
        if (profileImage) user.profileImage = profileImage;

        await user.save();
        return new ResponseBuilder(Lang.SUCCESS.PROFILE_UPDATED, 200, user).build(resp);
      });
    } catch (error) {
      return resp.status(500).json({ message: "Internal Server Error" });
    }
  },

  deleteUser: async (req, resp) => {
    try {
      const { user_id } = req.body;
  
      if (!user_id) {
        return resp.status(400).json({ message: "User ID is required" });
      }
  
      const user = await User.findByIdAndDelete(user_id);
      
      if (!user) {
        return resp.status(404).json({ message: "User not found" });
      }
  
      return new ResponseBuilder(Lang.SUCCESS.DELETE_SUCCESS, 200, user).build(resp);
    } catch (error) {
      resp.status(500).json({ message: "Server Error", error });
    }
  }
};
