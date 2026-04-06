import express from "express";
import { getRequests, createRequest } from "../controllers/requestController.js";

const router = express.Router();

router.get("/", getRequests);
router.post("/", createRequest);

export default router