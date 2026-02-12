import { Router } from "express";
import { generateTravelPlan, searchPopularPlaces } from "../controllers/travelController.js";

const router = Router();

router.post("/plan", generateTravelPlan);
router.get("/places", searchPopularPlaces);

export default router;
