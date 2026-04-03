const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'armor_secret_key';

const nodemailer = require('nodemailer');

// In-memory OTP storage for Hackathon simplicity
global.otpStore = global.otpStore || {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Ensure SMTP is configured, defaults to Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendOtpEmail(email, otp) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('SMTP credentials missing. OTP for ' + email + ' is: ' + otp);
    return;
  }
  
  try {
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 5000));
    await Promise.race([
      transporter.sendMail({
        from: '"Armor Security" <noreply@armor.ai>',
        to: email,
        subject: "Armor AI - Your 2-Step Login OTP",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 30px; text-align: center; color: #333;">
            <h2>Armor AI Two-Step Verification</h2>
            <p>We received a request to access your financial dashboard.</p>
            <p>Your secure One-Time Password is:</p>
            <h1 style="letter-spacing: 8px; color: #3b82f6; background: #eff6ff; display: inline-block; padding: 15px 30px; border-radius: 12px; margin: 20px 0;">
              ${otp}
            </h1>
            <p style="font-size: 13px; color: #888;">This code will expire in 5 minutes. Do not share it with anyone.</p>
          </div>
        `
      }),
      timeoutPromise
    ]);
    console.log('OTP email sent to ' + email);
  } catch (err) {
    console.warn('Email send failed (' + err.message + '). OTP for ' + email + ' is: ' + otp);
  }
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email, password });
    await user.save();

    const otp = generateOTP();
    global.otpStore[user._id.toString()] = otp;
    
    // Dispatch real email (fire-and-forget, do not await)
    sendOtpEmail(email, otp).catch(e => console.error("Email error:", e));

    const tempToken = jwt.sign({ id: user._id, type: 'temp' }, JWT_SECRET, { expiresIn: '5m' });
    res.status(201).json({ requiresOtp: true, tempToken, otpDemoFallback: otp, message: 'OTP sent! (Hackathon Mode)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const otp = generateOTP();
    global.otpStore[user._id.toString()] = otp;
    
    // Dispatch real email (fire-and-forget, do not await)
    sendOtpEmail(email, otp).catch(e => console.error("Email error:", e));

    const tempToken = jwt.sign({ id: user._id, type: 'temp' }, JWT_SECRET, { expiresIn: '5m' });
    res.json({ requiresOtp: true, tempToken, otpDemoFallback: otp, message: 'OTP sent! (Hackathon Mode)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get User (Verify token)
const auth = require('../middleware/auth');
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { tempToken, otp } = req.body;
    if (!tempToken || !otp) return res.status(400).json({ message: 'Missing token or OTP' });

    const decoded = jwt.verify(tempToken, JWT_SECRET);
    if (decoded.type !== 'temp') return res.status(400).json({ message: 'Invalid token type' });

    const storedOtp = global.otpStore[decoded.id];
    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP matched, delete it and issue permanent token
    delete global.otpStore[decoded.id];
    
    const user = await User.findById(decoded.id);
    const permanentToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token: permanentToken, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(400).json({ message: 'OTP session expired' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
