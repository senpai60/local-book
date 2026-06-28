import { Router } from "express";
import { getBooks, getBook, streamBookFile } from "../controller/book.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getBooks);
router.route("/:id").get(getBook);
router.route("/:id/file").get(streamBookFile);

export default router;
