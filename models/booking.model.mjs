import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
	{
		seat_id: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Seat",
		},
		created_by: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		start_time: {
			type: Date,
			required: true,
		},
		end_time: {
			type: Date,
			required: true,
			validate: {
				validator: function (value) {
					return value > this.start_time;
				},
				message: "End time must be after start time.",
			},
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
