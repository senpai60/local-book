import { Router } from "express";
import { authRoutes } from "../modules/auth/index.js";
import { userRoutes } from "../modules/users/index.js";
import { bookRoutes } from "../modules/books/index.js";
import { userBookRoutes } from "../modules/userBooks/index.js";
import { uploadRoutes } from "../modules/uploads/index.js";
import { readingProgressRoutes } from "../modules/readingProgress/index.js";
import { bookmarkRoutes } from "../modules/bookmarks/index.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy!" });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/books/upload", uploadRoutes);
router.use("/books", bookRoutes);
router.use("/library", userBookRoutes);
router.use("/progress", readingProgressRoutes);
router.use("/bookmarks", bookmarkRoutes);

export default router;
