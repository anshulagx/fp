const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    id: String,
    publishedAt: Date,
    title: String,
    description: String,
    default_thumb: String,
    medium_thumb: String,
    high_thumb: String,
  },
  { timestamps: true }
);

module.exports = mongoose.models.Video ?? mongoose.model("Video", schema);
