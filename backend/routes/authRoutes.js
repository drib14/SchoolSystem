import express from 'express';
import {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.post('/forgot', forgotPassword);
router.post('/reset/:token', resetPassword);

export default router;
