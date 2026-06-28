import { UserBook } from "../model/userBook.model.js";

export class UserBookRepository {
  async create(userBookData) {
    return await UserBook.create(userBookData);
  }

  async findByUserAndBook(userId, bookId) {
    return await UserBook.findOne({ userId, bookId });
  }

  async findByUserId(userId, query = {}, skip = 0, limit = 20) {
    return await UserBook.find({ userId, ...query })
      .populate("bookId")
      .skip(skip)
      .limit(limit)
      .sort({ dateAdded: -1 });
  }

  async updateByUserAndBook(userId, bookId, updateData) {
    return await UserBook.findOneAndUpdate({ userId, bookId }, updateData, { new: true });
  }
}
