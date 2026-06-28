import { BookmarkRepository } from "../repository/bookmark.repository.js";
import { ApiError } from "../../../utils/apiError.js";

export class BookmarkService {
  constructor() {
    this.bookmarkRepository = new BookmarkRepository();
  }

  async createBookmark(userId, bookId, page, title) {
    try {
      return await this.bookmarkRepository.create({ userId, bookId, page, title });
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(409, "Bookmark for this page already exists");
      }
      throw error;
    }
  }

  async getBookmarks(userId, bookId) {
    return await this.bookmarkRepository.findByUserIdAndBookId(userId, bookId);
  }

  async deleteBookmark(bookmarkId, userId) {
    const deleted = await this.bookmarkRepository.deleteByIdAndUser(bookmarkId, userId);
    if (!deleted) {
      throw new ApiError(404, "Bookmark not found or you are not authorized to delete it");
    }
    return deleted;
  }
}
