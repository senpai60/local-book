import { ReadingProgress } from "../model/readingProgress.model.js";

export class ReadingProgressRepository {
  async upsertProgress(userId, bookId, progressData) {
    return await ReadingProgress.findOneAndUpdate(
      { userId, bookId },
      { $set: progressData },
      { new: true, upsert: true }
    );
  }

  async getProgress(userId, bookId) {
    return await ReadingProgress.findOne({ userId, bookId });
  }
}
