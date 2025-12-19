const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    coordinates: {
      lat: Number,
      lng: Number,
    },
    rooms: {
      type: Number,
      required: true,
    },
    size: {
      type: Number, // square feet
    },
    images: [String],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "rented", "sold"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
