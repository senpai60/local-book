import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
    },
    sha256Hash: {
      type: String,
      required: true,
      unique: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    pages: {
      type: Number,
    },
    language: {
      type: String,
      default: "en",
    },
    coverImage: {
      type: String,
    },
    fileStoragePath: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storageProvider: {
      type: String,
      default: "local",
    },
    mimeType: {
      type: String,
      default: "application/pdf",
    },
    status: {
      type: String,
      enum: ["processing", "available", "error"],
      default: "available",
    },
  },
  { timestamps: true }
);

export const Book = mongoose.model("Book", bookSchema);
