const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', verifyToken, isAdmin, (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard' });
});

module.exports = router;
