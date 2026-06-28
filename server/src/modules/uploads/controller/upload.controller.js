import { UploadService } from "../service/upload.service.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { ApiError } from "../../../utils/apiError.js";

const uploadService = new UploadService();

export const uploadBook = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "PDF file is required");
  }

  const book = await uploadService.processUpload(req.user._id, req.file, req.body);
  return res.status(201).json(new ApiResponse(201, book, "Book uploaded successfully"));
});
