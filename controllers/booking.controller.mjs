import Booking from "../models/booking.model.mjs";
import Seat from "../models/seat.model.mjs";

const isSeatAvailable = async (seat_code, start_time, end_time) => {
	// Lookup the seat by its seat_code to retrieve its _id
	const seat = await Seat.findOne({ seat_code });
	if (!seat) {
		throw new Error(`Seat not found with seat_code: ${seat_code}`);
	}
	const seat_id = seat._id;

	// Find any booking for the same seat where the times overlap
	const conflict = await Booking.findOne({
		seat_id,
		start_time: { $lt: end_time },
		end_time: { $gt: start_time },
	});

	return !conflict; // returns true if there's no conflict
};

const checkAvailability = async (req, res) => {
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
		const available = await isSeatAvailable(seat_code, startDate, endDate);

		res.status(200).json({ seat_code, available });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const createBooking = async (req, res) => {
	try {
		// Extract seat_code along with the other fields from the request body
		const { seat_code, start_time, end_time, created_by } = req.body;

		// Parse and validate date inputs
		const startDate = new Date(start_time);
		const endDate = new Date(end_time);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return res
				.status(400)
				.json({ error: "Invalid date format provided." });
		}

		// Check if end_date is after start_date
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

		// Retrieve the seat's _id for booking creation
		const seat = await Seat.findOne({ seat_code });
		if (!seat) {
			return res.status(404).json({
				error: "Seat not found with the provided seat_code.",
			});
		}

		// Create the booking using the seat's _id and the date objects
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

export { isSeatAvailable, checkAvailability, createBooking };

// import Booking from "../models/booking.model.mjs";
// import Seat from "../models/seat.model.mjs";

// const isSeatAvailable = async (seat_code, start_time, end_time) => {
//   // Lookup the seat by its seat_code to retrieve its _id
//   const seat = await Seat.findOne({ seat_code });
//   if (!seat) {
//     throw new Error(`Seat not found with seat_code: ${seat_code}`);
//   }
//   const seat_id = seat._id;

//   // Find any booking for the same seat where the times overlap
//   const conflict = await Booking.findOne({
//     seat_id,
//     start_time: { $lt: end_time },
//     end_time: { $gt: start_time },
//   });

//   return !conflict; // returns true if there's no conflict
// };

// const createBooking = async (req, res) => {
//   try {
//     // Extract seat_code along with the other fields from the request body
//     const { seat_code, start_time, end_time, created_by } = req.body;

//     // Check for booking conflicts using the seat_code
//     const available = await isSeatAvailable(
//       seat_code,
//       new Date(start_time),
//       new Date(end_time)
//     );
//     if (!available) {
//       return res.status(400).json({
//         error: "This seat is already booked for the selected time range.",
//       });
//     }

//     // Retrieve the seat's _id for booking creation
//     const seat = await Seat.findOne({ seat_code });
//     if (!seat) {
//       return res.status(404).json({
//         error: "Seat not found with the provided seat_code.",
//       });
//     }

//     // Create the booking using the seat's _id
//     const booking = await Booking.create({
//       seat_id: seat._id,
//       created_by,
//       start_time,
//       end_time,
//     });

//     res.status(201).json(booking);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export { isSeatAvailable, createBooking };
