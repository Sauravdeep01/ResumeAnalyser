
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');

exports.register = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ msg: 'Database not connected. Please check MONGO_URI.' });
        }
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new User({ name, email, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Registration Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ msg: 'Database not connected. Please check MONGO_URI.' });
        }
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

