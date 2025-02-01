const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

const registerUser = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required." });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        // Create a new user (password will be hashed automatically)
        const newUser = new User({
            username,
            password, // Save raw password; the model will hash it automatically
            role: role || "user", // Default role is "user"
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Generate a JWT token
        const token = jwt.sign({ id: savedUser._id, username: savedUser.username, role: savedUser.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        // Send success response
        res.status(201).json({
            message: "User registered successfully.",
            token,
            user: {
                id: savedUser._id,
                username: savedUser.username,
                role: savedUser.role,
            },
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
};


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است.' });
        }

        // Compare the provided password with the hashed password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'نام کاربری یا رمز عبور اشتباه است.' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '6h' } // Token expiry time
        );

        // Send response
        res.status(200).json({
            message: 'ورود با موفقیت انجام شد.',
            token,
            user: { id: user._id, username: user.username, role: user.role },
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'خطایی رخ داده است.', error });
    }
};

module.exports = { loginUser, registerUser };
