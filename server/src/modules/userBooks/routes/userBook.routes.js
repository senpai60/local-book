import { Router } from "express";
import { getLibrary, addLibraryEntry, toggleFavoriteStatus } from "../controller/userBook.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getLibrary);
router.route("/").post(addLibraryEntry);
router.route("/:bookId/favorite").patch(toggleFavoriteStatus);

export default router;
