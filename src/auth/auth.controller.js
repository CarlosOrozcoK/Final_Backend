import User from '../users/user.model.js';
import { hash as hashPassword, verify as verifyPassword } from 'argon2';
import { generateJWT } from '../helpers/generate-jwt.js';

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials - user not found!' });
        }

        if (!user.status) {
            return res.status(400).json({ msg: 'The user is inactive!' });
        }

        const isPasswordValid = await verifyPassword(user.password, password);
        if (!isPasswordValid) {
            return res.status(400).json({ msg: 'Incorrect password!' });
        }

        const token = await generateJWT(user._id);

        return res.status(200).json({
            msg: 'Login successful!',
            userDetails: {
                username: user.username,
                token
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error!',
            error: error.message
        });
    }
};

export const register = async (req, res) => {
    try {
        const {
            name,
            username,
            dpi,
            address,
            phone,
            email,
            password,
            role
        } = req.body;

        // Check if user already exists by username, email or dpi
        const existingUser = await User.findOne({
            $or: [{ username }, { email }, { dpi }]
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'A user with that username, email, or DPI already exists.'
            });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = new User({
            name,
            username,
            dpi,
            address,
            phone,
            email,
            password: hashedPassword,
            role: role || 'CLIENT_ROLE',
            status: true
        });

        await newUser.save();

        return res.status(201).json({
            message: 'User registered successfully',
            userDetails: {
                username: newUser.username
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error creating user',
            error: error.message
        });
    }
};
