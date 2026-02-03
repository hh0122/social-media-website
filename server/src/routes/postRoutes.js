import { Router } from "express";
import { createPost, getPosts } from "../controllers/postController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/", getPosts);
router.post("/", auth, createPost);

export default router;
