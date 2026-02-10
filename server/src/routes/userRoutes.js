import { Router } from "express";
import { getProfile, searchUsers } from "../controllers/userController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/me", auth, getProfile);
router.get("/search", auth, searchUsers);

export default router;
