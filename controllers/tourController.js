const Tour = require("../models/tourModel")
const APIFeatures = require("../utils/apiFeatures")

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = "5"
  req.query.sort = "-ratingsAverage,price"
  req.query.fields = "name,duration,price,difficulty,ratingsAverage"
  next()
}

exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    const tours = await features.query

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
