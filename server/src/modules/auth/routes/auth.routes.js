import { Router } from "express";
import { register, login, logout, getAuthProfile } from "../controller/auth.controller.js";
import { validateRequest } from "../../../middlewares/validation.middleware.js";
import { verifyJWT } from "../../../middlewares/auth.middleware.js";
import { registerSchema, loginSchema } from "../validator/auth.validator.js";

const router = Router();

router.route("/register").post(validateRequest(registerSchema), register);
router.route("/login").post(validateRequest(loginSchema), login);

// Secured routes
router.use(verifyJWT);
router.route("/logout").post(logout);
router.route("/profile").get(getAuthProfile);

export default router;
