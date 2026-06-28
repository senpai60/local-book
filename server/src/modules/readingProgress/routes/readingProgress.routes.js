import { Router } from "express";
import { updateProgress, getProgress } from "../controller/readingProgress.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const router = Router({ mergeParams: true }); // Important if we want to nest it under books route, but let's keep it direct for now

router.use(verifyJWT);

// Route structure: /progress/:bookId
router.route("/:bookId").get(getProgress).put(updateProgress);

export default router;
