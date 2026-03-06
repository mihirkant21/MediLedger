const express = require('express');
const router = express.Router();
const { register, login, getMe, verifyOTP, googleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, verifyOtpSchema, googleLoginSchema } = require('../validators/auth');

router.post('/register', validate(registerSchema), register);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOTP);
router.post('/login', validate(loginSchema), login);
router.post('/google', validate(googleLoginSchema), googleLogin);
router.get('/me', protect, getMe);

module.exports = router;
