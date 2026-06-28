import { Router } from "express";
import { uploadBook } from "../controller/upload.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
import { upload } from "../../../middlewares/upload.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(upload.single("file"), uploadBook);

export default router;
