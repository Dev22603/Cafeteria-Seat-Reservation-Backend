import Seat from "../models/seat.model.mjs";

// Create a new Seat
const createSeat = async (req, res) => {
	try {
		const seat_code = req.body.seat_code.toString();

		if (!seat_code || !seat_code.trim()) {
			return res.status(400).json({ error: "Seat code is required." });
		}

		// Check if seat_code already exists
		const existingSeat = await Seat.findOne({ seat_code });
		if (existingSeat) {
			return res.status(400).json({
				error: `Seat with code '${seat_code}' already exists.`,
			});
		}

		const newSeat = new Seat({
			seat_code,
		});

		await newSeat.save();
		res.status(201).json({
			message: "Seat created successfully.",
			newSeat,
		});
	} catch (error) {
		res.status(500).json({
			error: "An unexpected error occurred. Please try again later.",
		});
		console.log(error);
	}
};

// Get all Seats
const getAllSeats = async (req, res) => {
	try {
		const Seats = await Seat.find();
		res.json(Seats);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get a Seat by ID
const getSeatBySeatCode = async (req, res) => {
	try {
		console.log(req.params.code);

		const Seat = await Seat.findOne({
			Seat_code: req.params.code,
		});

		if (!Seat) return res.status(404).json({ error: "Seat not found" });

		res.json(Seat);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Update a Seat
const updateSeat = async (req, res) => {
	try {
		const { Seat_name, Seat_code, Seat_description } = req.body;

		if (!Seat_name || !Seat_name.trim()) {
			return res.status(400).json({ error: "Seat name is required." });
		}
		const updatedSeat = await Seat.findOneAndUpdate(
			{
				Seat_code: req.params.code,
			},
			{ Seat_name, Seat_code, Seat_description },
			{ new: true }
		);

		if (!updatedSeat)
			return res.status(404).json({ error: "Seat not found" });

		res.json({ message: "Seat updated successfully", updatedSeat });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Delete a Seat
const deleteSeat = async (req, res) => {
	try {
		const seat = await Seat.findOneAndDelete({
			seat_code: req.params.code,
		});

		if (!seat) return res.status(404).json({ error: "Seat not found" });

		res.json({ message: "Seat deleted successfully" });
	} catch (error) {
		res.status(500).json({ error: error.message });
		console.log(error);
	}
};

export { createSeat, deleteSeat, getSeatBySeatCode, updateSeat, getAllSeats };
