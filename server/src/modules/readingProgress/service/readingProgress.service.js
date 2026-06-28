import { ReadingProgressRepository } from "../repository/readingProgress.repository.js";
import { BookRepository } from "../../books/repository/book.repository.js";

export class ReadingProgressService {
  constructor() {
    this.progressRepository = new ReadingProgressRepository();
    this.bookRepository = new BookRepository();
  }

  async updateProgress(userId, bookId, data) {
    const progressData = {
      currentPage: data.currentPage,
      scrollPercentage: data.scrollPercentage,
      lastOpened: Date.now(),
    };
    
    // Update total pages of the book if they are sent from client and not set yet
    if (data.totalPages) {
      await this.bookRepository.updateById(bookId, { pages: data.totalPages });
    }

    return await this.progressRepository.upsertProgress(userId, bookId, progressData);
  }

  async getProgress(userId, bookId) {
    let progress = await this.progressRepository.getProgress(userId, bookId);
    if (!progress) {
      // Return default progress if not started
      progress = {
        userId,
        bookId,
        currentPage: 1,
        scrollPercentage: 0,
        zoom: 100,
        theme: "light",
        timeSpentReading: 0,
      };
    }
    return progress;
  }
}
