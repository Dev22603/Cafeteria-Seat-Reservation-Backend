import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
	seat_code: { type: String, unique: true, sparse: true, trim: true }, // Unique constraint
});

export default mongoose.model("Seat", seatSchema);
