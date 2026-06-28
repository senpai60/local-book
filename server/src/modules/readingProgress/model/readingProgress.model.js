import mongoose from "mongoose";

const readingProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
    scrollPercentage: {
      type: Number,
      default: 0,
    },
    zoom: {
      type: Number,
      default: 100,
    },
    theme: {
      type: String,
      default: "light",
    },
    lastOpened: {
      type: Date,
      default: Date.now,
    },
    timeSpentReading: {
      type: Number,
      default: 0, // in seconds
    },
  },
  { timestamps: true }
);

readingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const ReadingProgress = mongoose.model("ReadingProgress", readingProgressSchema);
