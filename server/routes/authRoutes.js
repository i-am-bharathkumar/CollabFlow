// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', (req, res) => {
  authController.registerUser(req, res);
});

router.post('/login', (req, res) => {
  authController.loginUser(req, res);
});

router.get('/profile', (req, res) => {
  authController.getUserProfile(req, res);
});

module.exports = router;