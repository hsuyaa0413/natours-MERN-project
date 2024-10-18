const { promisify } = require("util")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body)
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  })
  // this is done so as to only take required inputs in the server avoiding serious security issues/flaws

  const token = signToken(newUser._id)

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  })
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // 1. check if email and password exist
  if (!email || !password)
    return next(new AppError("Please provide email and password", 400))

  // 2. check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password")
  // const correct = await user.correctPassword(password, user.password)

  // this is done coz if there is no user, then there is no need of checking if the password is correct or not
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Invalid email or password", 401))

  // 3. if everything is ok, send token back to the client
  const token = signToken(user._id)

  res.status(200).json({
    status: "success",
    token,
  })
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1. Getting token and checking if its there
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token)
    return next(
      new AppError("You're not logged in. Please login to get access!", 401)
    )

  // 2. Verfication of token (if something is wrong with the token, throws error)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3. Check if user still exists (when jwt token was received but somehow user was deleted, so now token should no longer work hence this check is implemented)
  const freshUser = await User.findById(decoded.id)
  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token no longer exists."),
      401
    )
  }

  // 4. Check if user changed their password after the token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again.", 401)
    )
  }

  // GRANT ACCESS TO THE PROTECTED ROUTE
  req.user = freshUser
  next()
})
