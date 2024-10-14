const express = require("express")
const morgan = require("morgan")

const AppError = require("./utils/appError")
const globalErrorHandler = require("./controllers/errorController")
const tourRouter = require("./routes/tourRoutes")
const userRouter = require("./routes/userRoutes")

const app = express()

// MIDDLEWARES
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

app.use(express.json())
app.use(express.static(`${__dirname}/public`))

// app.use((req, res, next) => {
//   console.log("hello👋 from the middleware!")
//   next()
// })

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
