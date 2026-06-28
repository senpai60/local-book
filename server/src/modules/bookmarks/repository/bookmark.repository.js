import { Bookmark } from "../model/bookmark.model.js";

export class BookmarkRepository {
  async create(bookmarkData) {
    return await Bookmark.create(bookmarkData);
  }

  async findByUserIdAndBookId(userId, bookId) {
    return await Bookmark.find({ userId, bookId }).sort({ page: 1 });
  }

  async deleteByIdAndUser(id, userId) {
    return await Bookmark.findOneAndDelete({ _id: id, userId });
  }
}
