import { Book } from "../model/book.model.js";

export class BookRepository {
  async create(bookData) {
    return await Book.create(bookData);
  }

  async findByHash(sha256Hash) {
    return await Book.findOne({ sha256Hash });
  }

  async findById(id) {
    return await Book.findById(id);
  }

  async findAll(query = {}, skip = 0, limit = 20) {
    return await Book.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });
  }

  async updateById(id, updateData) {
    return await Book.findByIdAndUpdate(id, updateData, { new: true });
  }
}
