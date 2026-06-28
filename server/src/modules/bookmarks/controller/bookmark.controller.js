import { BookmarkService } from "../service/bookmark.service.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { ApiError } from "../../../utils/apiError.js";

const bookmarkService = new BookmarkService();

export const createBookmark = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const { page, title } = req.body;
  if (!bookId || page === undefined) {
    throw new ApiError(400, "Book ID and page number are required");
  }

  const bookmark = await bookmarkService.createBookmark(req.user._id, bookId, page, title);
  return res.status(201).json(new ApiResponse(201, bookmark, "Bookmark created successfully"));
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!bookId) {
    throw new ApiError(400, "Book ID is required");
  }

  const bookmarks = await bookmarkService.getBookmarks(req.user._id, bookId);
  return res.status(200).json(new ApiResponse(200, bookmarks, "Bookmarks fetched successfully"));
});

export const deleteBookmark = asyncHandler(async (req, res) => {
  const { bookmarkId } = req.params;
  await bookmarkService.deleteBookmark(bookmarkId, req.user._id);
  return res.status(200).json(new ApiResponse(200, null, "Bookmark deleted successfully"));
});
