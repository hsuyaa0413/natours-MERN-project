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

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: {
            $gte: 4.5,
          },
        },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: "easy" } },
      // },
    ])

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    })
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: err,
    })
  }
}

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1 // 2021

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: { _id: 0 }, // 0 to not show/project; 1 otherwise
      },
      {
        $sort: { month: 1 }, // 1 for ascending; -1 for descending
      },
      {
        $limit: 12, // just for info; maximum 12 value for each of the 12 months
      },
    ])

    res.status(200).json({
      status: "success",
      data: {
        plan,
      },
    })
  } catch (err) {
    res.status(400).json({
      status: "failure",
      message: err,
    })
  }
}
