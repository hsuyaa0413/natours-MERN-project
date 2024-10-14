const mongoose = require("mongoose")
const slugify = require("slugify")
// const validator = require("validator")

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name."],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have 40 or less characters."],
      minlength: [10, "A tour name must have 10 or more characters."],
      // validate: [validator.isAlpha, "tour name should only contain alphabets"],
      // validator.isAlpha doesn't work for spaces in names, so we didn't use here; we don't want that to happen
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy,medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Ratings Average must be greater than 1.0"],
      max: [5, "Ratings Average must be less than 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // 'this' only points on NEW document creation, not on updation
          return val < this.price
        },
        // message: props => `Discount price ${props.value} should be below its regular price`,
        message: "Discount price ({VALUE}) should be below its regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // won't show if selected to false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create() not on document updation
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true })
  next()
})

// tourSchema.pre("save", function (next) {    // pre logs out things earlier in the system
//   console.log("Saving the document....")
//   next()
// })

// tourSchema.post("save", function (doc, next) {  // after posting in the document
//   console.log(doc)
//   next()
// })

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  // instead of 'find' we used regex coz other methods like 'findOne' wouldn't have worked like we expected
  this.find({ secretTour: { $ne: true } })

  this.startTime = Date.now()
  next()
})

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.startTime} milliseconds!😵`)
  next()
})

tourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
  next()
})

const Tour = mongoose.model("Tour", tourSchema)

module.exports = Tour
