import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
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
    page: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: "Untitled Bookmark",
    },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, bookId: 1, page: 1 }, { unique: true });

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
