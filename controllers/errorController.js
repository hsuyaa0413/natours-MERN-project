const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
  // Get Tour
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
  // Create New Tour
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]

  const message = `Duplicate field value: ${value}. Please use another value!`
  return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
  // Update Tour
  const errors = Object.values(err.errors).map(el => el.message)

  const message = `Invalid input data. ${errors.join(". ")}`
  return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

const sendErrorProd = (err, res) => {
  // Operational, trusted errors: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })

    // Programming or other unknown errors: don't leak error details
  } else {
    // 1. Log error on the console
    console.error("ERROR💥:", err)

    // 2. Send generic response/message
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    })
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || "error"

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err }

    if (err.name === "CastError") error = handleCastErrorDB(err)
    if (err.code === 11000) error = handleDuplicateFieldsDB(err)
    if (err.name === "ValidationError") error = handleValidationErrorDB(err)

    sendErrorProd(error, res)
  }
}
