const mongoose = require("mongoose")
const validator = require("validator")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "The name field should not be blank"],
  },
  email: {
    type: String,
    required: [true, "Email address is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email address"],
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Password can not be empty"],
    minlength: [8, "Password must be atleast 8 characters or more"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
  },
})

const User = mongoose.model("User", userSchema)

module.exports = User
