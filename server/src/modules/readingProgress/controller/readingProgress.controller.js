import { ReadingProgressService } from "../service/readingProgress.service.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { ApiError } from "../../../utils/apiError.js";

const progressService = new ReadingProgressService();

export const updateProgress = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  const data = req.body;
  if (!bookId) {
    throw new ApiError(400, "Book ID is required");
  }
  
  const progress = await progressService.updateProgress(req.user._id, bookId, data);
  return res.status(200).json(new ApiResponse(200, progress, "Reading progress updated"));
});

export const getProgress = asyncHandler(async (req, res) => {
  const { bookId } = req.params;
  if (!bookId) {
    throw new ApiError(400, "Book ID is required");
  }

  const progress = await progressService.getProgress(req.user._id, bookId);
  return res.status(200).json(new ApiResponse(200, progress, "Reading progress fetched"));
});
