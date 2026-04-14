const express = require('express');
const router = express.Router();
const scriptsController = require('../controllers/scripts.controller');
const autenticar = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { validarScript } = require('../validators/script.validator');

/**
 * @route   GET /api/scripts
 * @desc    Listar scripts do usuário e da equipe
 * @access  Private
 */
router.get('/', autenticar, scriptsController.listar);

/**
 * @route   POST /api/scripts
 * @desc    Criar novo script
 * @access  Private
 */
router.post(
    '/',
    autenticar,
    upload.array('arquivos', 5),
    validarScript,
    scriptsController.criar
);

/**
 * @route   PUT /api/scripts/:id
 * @desc    Atualizar script existente
 * @access  Private (Apenas autor)
 */
router.put(
    '/:id',
    autenticar,
    upload.array('arquivos', 5),
    validarScript,
    scriptsController.atualizar
);

/**
 * @route   DELETE /api/scripts/:id
 * @desc    Deletar script
 * @access  Private (Apenas autor)
 */
router.delete('/:id', autenticar, scriptsController.deletar);

module.exports = router;
