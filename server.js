const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" })

const app = require("./app")

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
)

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successfully established!"))

/* SAVING TOUR TO THE DATABASE - TEST ! */
// const testTour = new Tour({
//   name: "The Park Camper",
//   price: 997,
// })

// testTour
//   .save()
//   .then(doc => {
//     console.log(doc)
//   })
//   .catch(err => {
//     console.log("Error 🎇:", err)
//   })

// console.log(app.get("env"))
// console.log(process.env)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`App running on the port ${port}....`)
})
