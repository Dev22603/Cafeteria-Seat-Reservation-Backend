// controllers\user.controller.mjs
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.mjs";

const signup = async (req, res) => {
	console.log(req.body);

	const { name, email, phone_number, password, role } = req.body;

	if (!name || !email || !password || !phone_number || !role) {
		return res.status(400).json({ message: "Please fill in all fields" });
	}

	// Trim inputs
	const trimmedName = name.trim();
	const trimmedEmail = email.trim();
	const trimmedPhoneNumber = phone_number.trim();
	const trimmedPassword = password.trim();
	const trimmedRole = role.trim().toLowerCase(); // Ensure case consistency

	// Validate role (only 3 allowed)
	const allowedRoles = ["customer", "admin"];
	if (!allowedRoles.includes(trimmedRole)) {
		return res.status(400).json({ error: "Invalid role provided" });
	}

	// Ensure only one admin exists
	if (trimmedRole === "admin") {
		const existingadmin = await User.findOne({ role: "admin" });
		if (existingadmin) {
			return res.status(400).json({ error: "Only one admin is allowed" });
		}
	}

	// Validate name
	if (!trimmedName) {
		return res.status(400).json({ message: "Name is required" });
	}

	// Validate email
	const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
	if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
		return res.status(400).json({ error: "Invalid email format" });
	}

	// Validate password
	const passwordRegex =
		/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
	if (!trimmedPassword || !passwordRegex.test(trimmedPassword)) {
		return res.status(400).json({ error: "Password must be strong" });
	}

	try {
		// Check if the email already exists
		const existingUser = await User.findOne({ email: trimmedEmail });
		if (existingUser) {
			return res
				.status(400)
				.json({ error: "User with this email already exists" });
		}

		// Check if the phone_number already exists
		const existingUserPhone = await User.findOne({
			phone_number: trimmedPhoneNumber,
		});
		if (existingUserPhone) {
			return res
				.status(400)
				.json({ error: "User with this phone number already exists" });
		}

		// Hash the password before saving
		const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

		// Create a new user
		const newUser = new User({
			name: trimmedName,
			email: trimmedEmail,
			phone_number: trimmedPhoneNumber,
			role: trimmedRole,
			password: hashedPassword,
		});

		// Save the new user to the database
		await newUser.save();

		// Return a success message
		res.status(201).json({ message: "User created successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Failed to create user",
			error: error,
		});
	}
};

const login = async (req, res) => {
	const { email, phone_number, password } = req.body;

	if ((!email && !phone_number) || !password) {
		return res
			.status(400)
			.json({ error: "Email or phone number and password are required" });
	}

	try {
		const user = await User.findOne({
			$or: [{ email }, { phone_number }],
		});
		if (!user) {
			return res.status(400).json({ error: "Invalid credentials" });
		}

		console.log(user);

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign(
			{ id: user._id, role: user.role },
			process.env.JWT_SECRET,
			{ expiresIn: "1h" }
		);

		res.status(200).json({
			message: "Login successful",
			token: token,
			userId: user._id,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Login failed" });
	}
};

const getUserById = async (req, res) => {
	try {
		const { id } = req.params; // Extract user ID from request parameters
		const user = await User.findById(id).select("-password"); // Exclude password field

		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.error("Error fetching user:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const updateUser = async (req, res) => {
	try {
		const { id } = req.params; // Extract user ID from request parameters
		const updates = req.body; // Get update fields from request body
		console.log(updates);

		// Ensure password is not updated here for security reasons
		if (updates.password) {
			return res.status(400).json({
				success: false,
				message: "Password cannot be updated here",
			});
		}
		


		
		// Ensure _id is not updated here for security reasons
		if (updates._id) {
			return res.status(400).json({
				success: false,
				message: "_id cannot be updated as it is immutable",
			});
		}

		// Find user by ID and update
		const updatedUser = await User.findByIdAndUpdate(
			id,
			{ ...updates, updated_at: Date.now() }, // Set updated timestamp
			{ new: true, runValidators: true, select: "-password" } // Return updated document & exclude password
		);

		if (!updatedUser) {
			return res
				.status(404)
				.json({ success: false, message: "User not found" });
		}

		res.status(200).json({
			success: true,
			message: "User updated successfully",
			user: updatedUser,
		});
	} catch (error) {
		console.error("Error updating user:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

const deleteUser = async (req, res) => {
	const { userId } = req.params;

	try {
		// Check if user exists
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}


		// Delete the user
		await User.findByIdAndDelete(userId);

		res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Error deleting user" });
	}
};

export { signup, login, getUserById, updateUser, deleteUser };
