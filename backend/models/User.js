const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    studentId: String,
    gradeLevel: String,
    section: String,
    verificationToken: String,
    resetToken: String,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
