import express from "express";
import authRoutes from "./routes/user.routes.mjs";
import seatRoutes from "./routes/seat.routes.mjs";
import bookingRoutes from "./routes/booking.route.mjs";
import connectDB from "./db/database.mjs";

const app = express();
connectDB();
// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // If using form data
app.use("/api", authRoutes);
app.use("/api", seatRoutes);
app.use("/api",bookingRoutes);

export { app };
