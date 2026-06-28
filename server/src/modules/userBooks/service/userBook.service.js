import { UserBookRepository } from "../repository/userBook.repository.js";

export class UserBookService {
  constructor() {
    this.userBookRepository = new UserBookRepository();
  }

  async getUserLibrary(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await this.userBookRepository.findByUserId(userId, { isArchived: false }, skip, limit);
  }

  async addToLibrary(userId, bookId) {
    const existingEntry = await this.userBookRepository.findByUserAndBook(userId, bookId);
    if (existingEntry) {
      return existingEntry;
    }
    return await this.userBookRepository.create({ userId, bookId });
  }

  async toggleFavorite(userId, bookId) {
    const userBook = await this.userBookRepository.findByUserAndBook(userId, bookId);
    if (!userBook) {
      return null;
    }
    return await this.userBookRepository.updateByUserAndBook(userId, bookId, { isFavorite: !userBook.isFavorite });
  }
}
