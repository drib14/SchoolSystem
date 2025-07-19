const express = require('express');
const { register, login, verifyEmail } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify/:token', verifyEmail);

// Example protected route
router.get('/me', protect, (req, res) => {
    res.json({ msg: 'Authenticated user', user: req.user });
});

module.exports = router;
