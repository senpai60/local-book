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
