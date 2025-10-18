const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { _id: false, timestamps: true }
);

const fileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    originalName: { type: String },
    mimetype: { type: String },
    size: { type: Number },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    files: [fileSchema],
    ratings: [ratingSchema],
    avgRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectSchema.methods.recomputeAvg = function () {
  if (!this.ratings || this.ratings.length === 0) {
    this.avgRating = 0;
    return this.avgRating;
  }
  const total = this.ratings.reduce((sum, r) => sum + (r.score || 0), 0);
  this.avgRating = Math.round((total / this.ratings.length) * 10) / 10;
  return this.avgRating;
};

module.exports = mongoose.model("Project", projectSchema);
