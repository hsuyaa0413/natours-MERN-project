const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

const sendErrorProd = (res, err) => {
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
    sendErrorDev(res, err)
  } else if (process.env.NODE_ENV === "production") {
    sendErrorProd(res, err)
  }
}
