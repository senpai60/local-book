import { Router } from "express";
import { getProfile } from "../controller/user.controller.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Protect all routes below

router.route("/profile").get(getProfile);

export default router;
