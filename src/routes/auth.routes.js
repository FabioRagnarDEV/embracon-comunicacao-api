const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validarLogin } = require('../validators/auth.validator');

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuário e retornar token JWT
 * @access  Public
 */
router.post('/login', validarLogin, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Invalidar sessão do usuário
 * @access  Private
 */
router.post('/logout', authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Obter dados do usuário autenticado
 * @access  Private
 */
router.get('/me', authController.getMe);

module.exports = router;
