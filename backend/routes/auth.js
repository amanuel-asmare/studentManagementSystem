const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt with email:', email);

        // Validate request body
        if (!email || !password) {
            console.log('Missing email or password in request');
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign({ email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET, { expiresIn: '1h' }
        );

        console.log('Login successful for user:', email);
        res.status(200).json({
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                settings: user.settings,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error: Unable to login' });
    }
});

module.exports = router;
/*const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Sign Up (Admin Only for non-student roles)
router.post('/signin', authMiddleware(['admin']), async(req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'Name, Email, Password, and Role are required' });
        }
        if (!['admin', 'student', 'teacher'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password.trim(), 10);
        const user = new User({ name: name.trim(), email: email.trim().toLowerCase(), password: hashedPassword, role });
        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Sign Up Error:', err);
        res.status(500).json({ message: 'Server error: Unable to create user' });
    }
});

// Log In
router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password.trim(), user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Server error: Unable to login' });
    }
});

// Get Authenticated User Data
router.get('/user', authMiddleware(['admin', 'student', 'teacher']), async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select('name email role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Fetch user error:', error);
        res.status(500).json({ message: 'Server error: Unable to fetch user data' });
    }
});

module.exports = router; */