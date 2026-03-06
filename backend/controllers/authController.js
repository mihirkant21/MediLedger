const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { sendOTP } = require('../utils/emailService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.validatedData || req.body;

    // Check if user exists
    let userExists = await User.getUserByEmail(email);
    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      } else {
        // User exists but not verified, let's resend OTP or allow them to continue
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        await User.updateUser(userExists.userId, {
            name,
            phone,
            otp,
            otpExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString()
        });
        
        const emailSent = await sendOTP(email, otp);

        if (!emailSent) {
          return res.status(500).json({
            success: false,
            message: 'Failed to send OTP email. Please check your email configuration or try again later.'
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Verification OTP sent to email. Please verify to complete registration.'
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const user = await User.createUser({
      name,
      email,
      password,
      phone,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });

    const emailSent = await sendOTP(email, otp);

    if (!emailSent) {
      // Note: Full rollback would be an option here, but we will leave them unverified for now.
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check your email configuration or try again later.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Verification OTP sent to email. Please verify to complete registration.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.validatedData || req.body;

    const user = await User.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    if (user.otp !== otp || new Date(user.otpExpires).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Verify user
    await User.updateUser(user.userId, {
        isVerified: true,
        // DynamoDB allows us to delete attributes using REMOVE, but for simplicity, we empty them
        otp: null,
        otpExpires: null
    });

    const token = generateToken(user.userId);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.validatedData || req.body;

    // Check for user
    const user = await User.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.password) {
      return res.status(401).json({
         success: false,
         message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await User.comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email to login'
      });
    }

    // Update last login
    await User.updateUser(user.userId, { lastLogin: new Date().toISOString() });

    const token = generateToken(user.userId);

    res.json({
      success: true,
      token,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user might have ._id or .id from old middleware, ensure compatibility
    const userId = req.user.id || req.user._id || req.user.userId;
    const user = await User.getUserById(userId);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // delete user.password
    const { password, ...userWithoutPwd } = user;

    res.json({
      success: true,
      data: userWithoutPwd
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Login/Registration
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.validatedData || req.body;

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if user already exists
    let user = await User.getUserByEmail(email);

    if (user) {
      // If user exists but no googleId is linked, link it now
      if (!user.googleId) {
        user = await User.updateUser(user.userId, {
            googleId,
            isVerified: true
        });
      }
    } else {
      // Create a new user for Google login
      user = await User.createUser({
        name,
        email,
        googleId,
        isVerified: true
      });
    }

    // Update last login
    await User.updateUser(user.userId, { lastLogin: new Date().toISOString() });

    // Generate token
    const token = generateToken(user.userId);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid Google token'
    });
  }
};
