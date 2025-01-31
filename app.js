const express = require("express")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const { xss } = require("express-xss-sanitizer")
const hpp = require("hpp")

const AppError = require("./utils/appError")
const globalErrorHandler = require("./controllers/errorController")
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")

const app = express()

// GLOBAL MIDDLEWARES
// set security http header
app.use(helmet())

// development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// limit request from same api
const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
})
app.use("/api", limiter)

// body parser; reads data from body into req.body
app.use(express.json({ limit: "10kb" }))

// data sanitization against NoSQL query injection
app.use(mongoSanitize())

// data sanitization against XSS
app.use(xss())

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsAverage",
      "ratingsQuantity",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
)

// serving static files
app.use(express.static(`${__dirname}/public`))

// test middlewares
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

// ROUTES
app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)

// handling unhandled routes
app.all("*", (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`)
  // err.statusCode = 404
  // err.status = "failure"

  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app
