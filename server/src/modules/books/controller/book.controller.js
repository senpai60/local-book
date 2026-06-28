import { BookService } from "../service/book.service.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/apiResponse.js";

const bookService = new BookService();

export const getBook = asyncHandler(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);
  return res.status(200).json(new ApiResponse(200, book, "Book fetched successfully"));
});

export const getBooks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const books = await bookService.getAllBooks(page, limit);
  return res.status(200).json(new ApiResponse(200, books, "Books fetched successfully"));
});

import fs from "fs";
import path from "path";

export const streamBookFile = asyncHandler(async (req, res) => {
  const book = await bookService.getBookById(req.params.id);
  
  if (!book || !book.fileStoragePath) {
    throw new ApiError(404, "Book file not found");
  }

  const resolvedPath = path.resolve(book.fileStoragePath);
  
  if (!fs.existsSync(resolvedPath)) {
    throw new ApiError(404, "Physical file missing on server");
  }

  // Set proper headers for PDF serving
  res.setHeader('Content-Type', 'application/pdf');
  // Use inline disposition so the browser/react-pdf can render it, instead of downloading
  res.setHeader('Content-Disposition', `inline; filename="${book.title}.pdf"`);
  
  const fileStream = fs.createReadStream(resolvedPath);
  fileStream.pipe(res);
});
