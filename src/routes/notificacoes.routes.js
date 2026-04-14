const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/notificacoes.controller');
const autenticar = require('../middlewares/auth');

/**
 * @route   GET /api/notificacoes
 * @desc    Listar notificações do usuário autenticado
 * @access  Private
 */
router.get('/', autenticar, notificacoesController.listar);

/**
 * @route   PUT /api/notificacoes/:id/ler
 * @desc    Marcar notificação como lida
 * @access  Private
 */
router.put('/:id/ler', autenticar, notificacoesController.marcarComoLida);

module.exports = router;
