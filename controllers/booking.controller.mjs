import Booking from "../models/booking.model.mjs";
import Seat from "../models/seat.model.mjs";

const isSeatAvailable = async (
	seat_code,
	new_booking_start_time,
	new_booking_end_time
) => {
	console.log("------", new_booking_start_time);
	// Lookup the seat by its seat_code to retrieve its _id
	const seat = await Seat.findOne({ seat_code });
	if (!seat) {
		throw new Error(`Seat not found with seat_code: ${seat_code}`);
	}
	const seat_id = seat._id;

	// Find any booking for the same seat where the times overlap
	const conflict = await Booking.findOne({
		seat_id,
		start_time: { $lt: new_booking_end_time },
		end_time: { $gt: new_booking_start_time },
	});

	return !conflict; // returns true if there's no conflict
};

// Function to check if the time range is valid
const validateTimeRange = (start_time, end_time) => {
	if (!start_time || !end_time) {
		throw new Error("start_time and end_time are required.");
	}

	const startDate = new Date(start_time);
	const endDate = new Date(end_time);

	if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
		throw new Error("Invalid date format.");
	}

	if (endDate <= startDate) {
		throw new Error("end_time must be after start_time.");
	}

	return { startDate, endDate };
};

// Function to get the booked seats for the given time range
const getBookedSeats = async (startDate, endDate) => {
	// Find all booked seats that overlap with the given time range
	const bookedSeats = await Booking.find({
		start_time: { $lt: endDate },
		end_time: { $gt: startDate },
	}).distinct("seat_id"); // Get only seat IDs

	return bookedSeats;
};

// Function to get the available seats by excluding booked ones
const getAvailableSeats = async (bookedSeats) => {
	// Find all seats that are NOT in the booked list
	const availableSeats = await Seat.find({
		_id: { $nin: bookedSeats }, // Exclude booked seats
	}).select("seat_code");

	return availableSeats;
};

// Main function to check availability
const getAvailableSeatsByTime = async (req, res) => {
	try {
		// Extract start_time and end_time from query params
		const { start_time, end_time } = req.query;

		// Validate the time range
		const { startDate, endDate } = validateTimeRange(start_time, end_time);

		// Get the booked seats
		const bookedSeats = await getBookedSeats(startDate, endDate);

		// Get available seats
		const availableSeats = await getAvailableSeats(bookedSeats);

		// Respond with the list of available seats
		res.status(200).json({
			available_seats: availableSeats.map((seat) => seat.seat_code),
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const checkSeatAvailability = async (req, res) => {
	try {
		const { seat_code, start_time, end_time } = req.query;

		// Validate inputs
		if (!seat_code || !start_time || !end_time) {
			return res.status(400).json({
				error: "seat_code, start_time, and end_time are required.",
			});
		}

		const startDate = new Date(start_time);
		const endDate = new Date(end_time);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return res.status(400).json({ error: "Invalid date format." });
		}

		if (endDate <= startDate) {
			return res
				.status(400)
				.json({ error: "end_time must be after start_time." });
		}

		// Check seat availability
		console.log(startDate);

		const available = await isSeatAvailable(seat_code, startDate, endDate);

		res.status(200).json({ seat_code, available });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const createBooking = async (req, res) => {
	try {
		// Extract seat_code, start_time, end_time from request body
		const { seat_code, start_time, end_time } = req.body;

		// Get user ID from the token
		const created_by = req.user.id; // Extracted from token
		console.log(req.user);

		// Parse and validate date inputs
		const startDate = new Date(start_time);
		const endDate = new Date(end_time);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return res
				.status(400)
				.json({ error: "Invalid date format provided." });
		}

		// Ensure end_time is after start_time
		if (endDate <= startDate) {
			return res
				.status(400)
				.json({ error: "end_time must be after start_time." });
		}

		// Check for booking conflicts using the seat_code and date objects
		const available = await isSeatAvailable(seat_code, startDate, endDate);
		if (!available) {
			return res.status(400).json({
				error: "This seat is already booked for the selected time range.",
			});
		}

		// Retrieve the seat's _id from seat_code
		const seat = await Seat.findOne({ seat_code });
		if (!seat) {
			return res
				.status(404)
				.json({ error: "Seat not found with the provided seat_code." });
		}

		// Create the booking using the seat's _id and user ID from token
		const booking = await Booking.create({
			seat_id: seat._id,
			created_by,
			start_time: startDate,
			end_time: endDate,
		});

		res.status(201).json(booking);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// ✅ Delete a booking
const deleteBooking = async (req, res) => {
	try {
		const { booking_id } = req.params;
		console.log(booking_id);

		// Find the booking by ID
		const booking = await Booking.findById(booking_id);
		if (!booking) {
			return res.status(404).json({ error: "Booking not found." });
		}

		// Only the booking owner or an admin can delete the booking
		if (
			req.user.id !== booking.created_by.toString() &&
			req.user.role !== "admin"
		) {
			return res
				.status(403)
				.json({ error: "Unauthorized to delete this booking." });
		}

		// Delete the booking
		await Booking.findByIdAndDelete(booking_id);

		res.status(200).json({ message: "Booking deleted successfully." });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export {
	checkSeatAvailability,
	createBooking,
	deleteBooking,
	getAvailableSeatsByTime,
};
