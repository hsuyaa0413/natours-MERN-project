// const fs = require("fs")
const Tour = require("../models/tourModel")

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// )

/* custom checkID params middleware for valid id checking; not needed now coz it'll be checked by mongodb itself */

// exports.checkID = (req, res, next, value) => {
//   console.log(`tour id is ${value}`)
//   if (req.params.id * 1 >= tours.length) {
//     return res.status(404).json({
//       status: "failure",
//       message: "Invalid ID",
//     })
//   }
//   next()
// }

/* just to demonstrate the use of middlewares */
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: "failure",
//       message: "Missing either name or price.",
//     })
//   }
//   next()
// }

exports.getAllTours = async (req, res) => {
  // console.log(req.requestTime)
  try {
    // BUILD QUERY
    const queryObj = { ...req.query }
    const excludedFields = ["sort", "page", "limit", "fields"]
    excludedFields.forEach(el => delete queryObj[el])

    const query = Tour.find(queryObj)

    // const query = await Tour.find()
    //   .where("duration")
    //   .equals(5)
    //   .where("difficulty")
    //   .equals("easy")

    // AWAIT QUERY
    const tours = await query

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: tours.length,
      data: {
        tours,
      },
    })
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: err,
    })
  }
}

exports.getTour = async (req, res) => {
  // const id = req.params.id * 1
  // const tour = tours.find(el => el.id === id)
  try {
    const tour = await Tour.findById(req.params.id)
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    })
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: err,
    })
  }
}

exports.createTour = async (req, res) => {
  // const newId = tours[tours.length - 1].id + 1
  // const newTour = Object.assign({ id: newId }, req.body)

  // tours.push(newTour)

  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   err => {
  //     res.status(201).json({
  //       status: "success",
  //       data: {
  //         tour: newTour,
  //       },
  //     })
  //   }
  // )
  try {
    const newTour = await Tour.create(req.body)

    res.status(201).json({
      status: "success",
      data: {
        tour: newTour,
      },
    })
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: err,
    })
  }
}

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    })
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: err,
    })
  }
}

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id)

    res.status(204).json({
      status: "success",
      data: {
        tour: null,
      },
    })
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: err,
    })
  }
}
