import express from "express";
import insertWaterMark from "../controllers/waterMark.js";
const router = express.Router();

router.post("/generateWaterMark", insertWaterMark);

export default router;
