import fs from "fs";
import { calculateFileHash } from "../../../utils/hash.js";
import { BookRepository } from "../../books/repository/book.repository.js";
import { UserBookRepository } from "../../userBooks/repository/userBook.repository.js";

export class UploadService {
  constructor() {
    this.bookRepository = new BookRepository();
    this.userBookRepository = new UserBookRepository();
  }

  async processUpload(userId, file, bodyData) {
    const fileHash = await calculateFileHash(file.path);

    let book = await this.bookRepository.findByHash(fileHash);

    if (book) {
      // Remove duplicate physical file since we already have it
      fs.unlinkSync(file.path);
    } else {
      // Create new book entry
      book = await this.bookRepository.create({
        title: bodyData.title || file.originalname.replace(".pdf", ""),
        author: bodyData.author || "Unknown",
        sha256Hash: fileHash,
        fileSize: file.size,
        fileStoragePath: file.path,
        uploadedBy: userId,
        mimeType: file.mimetype,
      });
    }

    // Add to user's library if not already added
    const existingEntry = await this.userBookRepository.findByUserAndBook(userId, book._id);
    if (!existingEntry) {
      await this.userBookRepository.create({ userId, bookId: book._id });
    }

    return book;
  }
}
