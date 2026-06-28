import { BookRepository } from "../repository/book.repository.js";
import { ApiError } from "../../../utils/apiError.js";

export class BookService {
  constructor() {
    this.bookRepository = new BookRepository();
  }

  async getBookById(id) {
    const book = await this.bookRepository.findById(id);
    if (!book) {
      throw new ApiError(404, "Book not found");
    }
    return book;
  }

  async getAllBooks(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await this.bookRepository.findAll({}, skip, limit);
  }
}
