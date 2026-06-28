import { Router } from "express";
import { getBooks, getBook } from "../controller/book.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getBooks);
router.route("/:id").get(getBook);

export default router;
