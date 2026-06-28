import { Router } from "express";
import { createBookmark, getBookmarks, deleteBookmark } from "../controller/bookmark.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(verifyJWT);

// Route structure: /bookmarks/:bookId
router.route("/:bookId").post(createBookmark).get(getBookmarks);
// Route structure: /bookmarks/:bookmarkId
router.route("/:bookmarkId").delete(deleteBookmark);

export default router;
