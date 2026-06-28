import mongoose from "mongoose";

const userBookSchema = new mongoose.Schema(
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
    dateAdded: {
      type: Date,
      default: Date.now,
    },
    lastOpened: {
      type: Date,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure a user cannot have the same book twice in their library
userBookSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const UserBook = mongoose.model("UserBook", userBookSchema);
