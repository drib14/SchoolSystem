import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// Helper to generate JWT
const generateToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Register
export const register = async (req, res) => {
    const { name, email, password, role, grade, section } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: 'Email already registered' });

        const verifyToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({ name, email, password, role, grade, section, verifyToken });

        const link = `${process.env.CLIENT_URL}/verify/${verifyToken}`;
        await sendEmail(email, 'Verify Your Email', `Click to verify: ${link}`);

        res.status(201).json({ msg: 'Registered. Check email for verification link.' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Verify Email
export const verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ verifyToken: req.params.token });
        if (!user) return res.status(400).json({ msg: 'Invalid token' });

        user.isVerified = true;
        user.verifyToken = '';
        await user.save();

        res.json({ msg: 'Email verified successfully' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        if (!user.isVerified) return res.status(403).json({ msg: 'Please verify your email first' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = generateToken(user._id);
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'User not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 1000 * 60 * 10; // 10 minutes
        await user.save();

        const link = `${process.env.CLIENT_URL}/reset/${resetToken}`;
        await sendEmail(email, 'Reset Password', `Click to reset password: ${link}`);

        res.json({ msg: 'Reset link sent to email' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });

        user.password = password;
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({ msg: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
