// const mongoose = require('mongoose');
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: { type: String, required: true },
  profileImage: { type: String, default: "" },
});
const User = mongoose.model('User', userSchema); 
export default User; 