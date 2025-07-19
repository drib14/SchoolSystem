const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: 'Email already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(20).toString('hex');

        const user = await User.create({
            name,
            email,
            password: hashed,
            role,
            verificationToken,
        });

        const url = `http://localhost:3000/verify/${verificationToken}`;
        await transporter.sendMail({
            to: email,
            subject: 'Verify your email',
            html: `<a href="${url}">Click to verify your account</a>`,
        });

        res.json({ msg: 'Registered! Check your email to verify.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) return res.status(400).json({ msg: 'Invalid token' });

        user.isVerified = true;
        user.verificationToken = null;
        await user.save();

        res.json({ msg: 'Email verified!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};