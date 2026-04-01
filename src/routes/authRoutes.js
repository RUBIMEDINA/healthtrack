const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', auth, (req, res) => {
    res.json({ usuario: req.usuario });
});
router.get('/users', auth, authController.getAllUsers);

module.exports = router; 