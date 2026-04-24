import express from "express";
import { getAdmins, createAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.get("/", getAdmins);
router.post("/", createAdmin);

export default router;