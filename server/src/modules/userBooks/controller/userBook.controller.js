import { UserBookService } from "../service/userBook.service.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { ApiError } from "../../../utils/apiError.js";

const userBookService = new UserBookService();

export const getLibrary = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const library = await userBookService.getUserLibrary(req.user._id, page, limit);
  return res.status(200).json(new ApiResponse(200, library, "Library fetched successfully"));
});

export const addLibraryEntry = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  if (!bookId) {
    throw new ApiError(400, "Book ID is required");
  }
  const entry = await userBookService.addToLibrary(req.user._id, bookId);
  return res.status(201).json(new ApiResponse(201, entry, "Book added to library successfully"));
});

export const toggleFavoriteStatus = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const entry = await userBookService.toggleFavorite(req.user._id, bookId);
  if (!entry) {
    throw new ApiError(404, "Book not found in library");
  }
  return res.status(200).json(new ApiResponse(200, entry, "Favorite status toggled successfully"));
});

export const removeLibraryEntry = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const entry = await userBookService.removeFromLibrary(req.user._id, bookId);
  if (!entry) {
    throw new ApiError(404, "Book not found in library");
  }
  return res.status(200).json(new ApiResponse(200, {}, "Book removed from library successfully"));
});
