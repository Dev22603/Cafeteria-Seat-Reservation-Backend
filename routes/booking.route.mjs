import express from "express";
import {
	createBooking,
	checkSeatAvailability,
	deleteBooking,
	getAvailableSeatsByTime,
} from "../controllers/booking.controller.mjs";
import { authenticate } from "../middlewares/auth.mjs";

const router = express.Router();

// POST /bookings - Create a new booking
router.post("/bookings", authenticate, createBooking);

// DELETE /bookings/:id - Delete a booking by its ID
router.delete("/bookings/:booking_id", authenticate, deleteBooking);

// GET /bookings/availability - Check if a seat is available
router.get("/bookings/check-seat-availability", checkSeatAvailability);
router.get("/bookings/get-available-seats-by-time", getAvailableSeatsByTime);

export default router;
