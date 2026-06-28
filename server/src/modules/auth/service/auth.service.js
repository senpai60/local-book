import { UserRepository } from "../../users/repository/user.repository.js";
import { ApiError } from "../../../utils/apiError.js";

export class AuthService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async registerUser(userData) {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const user = await this.userRepository.create(userData);
    const { password, refreshToken, ...createdUser } = user.toObject();
    
    return createdUser;
  }

  async loginUser(email, plainPassword) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(plainPassword);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const { password, refreshToken: rt, ...loggedInUser } = user.toObject();

    return { user: loggedInUser, accessToken, refreshToken };
  }

  async logoutUser(userId) {
    await this.userRepository.updateById(userId, {
      $set: { refreshToken: undefined },
    });
  }
}
