import { AuthService } from "../service/auth.service.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/apiResponse.js";
import { env } from "../../../config/env.js";

const authService = new AuthService();

const setCookies = (res, accessToken, refreshToken) => {
  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  };
  res.cookie("accessToken", accessToken, options);
  res.cookie("refreshToken", refreshToken, options);
};

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  return res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.loginUser(email, password);

  setCookies(res, accessToken, refreshToken);

  return res.status(200).json(new ApiResponse(200, { user, accessToken, refreshToken }, "User logged in successfully"));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.user._id);

  const options = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const getAuthProfile = asyncHandler(async (req, res) => {
  // Can just return req.user or use UserService, but the request requires GET /auth/profile
  return res.status(200).json(new ApiResponse(200, req.user, "Profile fetched successfully"));
});
