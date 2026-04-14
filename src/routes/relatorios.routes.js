const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatorios.controller');
const autenticar = require('../middlewares/auth');
const { verificarPermissao } = require('../middlewares/permissoes');

/**
 * @route   GET /api/relatorios
 * @desc    Obter métricas e relatórios de leitura
 * @access  Private (Apenas MONITOR_QUALIDADE)
 */
router.get(
    '/',
    autenticar,
    verificarPermissao(['MONITOR_QUALIDADE']),
    relatoriosController.obterMetricas
);

module.exports = router;
