import express from "express";
import { createBooking, checkAvailability } from "../controllers/booking.controller.mjs";
import { authenticate} from "../middlewares/auth.mjs";

const router = express.Router();

// POST /bookings - Create a new booking
router.post("/bookings", authenticate, createBooking);

// DELETE /bookings/:id - Delete a booking by its ID
// router.delete("/bookings/:id", authenticate, deleteBooking);

// GET /bookings/availability - Check if a seat is available
router.get("/bookings/availability", checkAvailability);

export default router;
