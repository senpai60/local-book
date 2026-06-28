import { ReadingProgressRepository } from "../repository/readingProgress.repository.js";

export class ReadingProgressService {
  constructor() {
    this.progressRepository = new ReadingProgressRepository();
  }

  async updateProgress(userId, bookId, data) {
    const progressData = {
      ...data,
      lastOpened: Date.now(),
    };
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
