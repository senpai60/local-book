import { UserRepository } from "../repository/user.repository.js";
import { ApiError } from "../../../utils/apiError.js";

export class UserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getProfile(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const { password, refreshToken, ...userWithoutSensitiveInfo } = user.toObject();
    return userWithoutSensitiveInfo;
  }
}
