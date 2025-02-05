import express from "express";
import {
	createSeat,
	getAllSeats,
	getSeatBySeatCode,
	updateSeat,
	deleteSeat,
} from "../controllers/seat.controller.mjs";
import { authenticate, authorize } from "../middlewares/auth.mjs";

const router = express.Router();

router.post(
	"/seats",
	authenticate,
	authorize(["admin"]),
	createSeat
);
router.get("/seats", getAllSeats);
router.get("/seats/code/:code", getSeatBySeatCode);
router.put("/seats/code/:code", updateSeat);
router.delete("/seats/code/:code", deleteSeat);

export default router;
