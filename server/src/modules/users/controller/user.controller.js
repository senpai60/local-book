import { UserService } from "../service/user.service.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/apiResponse.js";

const userService = new UserService();

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfile(req.user._id);
  return res.status(200).json(new ApiResponse(200, profile, "User profile fetched successfully"));
});
