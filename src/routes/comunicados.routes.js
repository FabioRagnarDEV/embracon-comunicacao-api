const express = require('express');
const router = express.Router();
const comunicadosController = require('../controllers/comunicados.controller');
const autenticar = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const { validarComunicado, validarCurtida } = require('../validators/comunicado.validator');

/**
 * @route   GET /api/comunicados
 * @desc    Listar todos os comunicados
 * @access  Private
 */
router.get('/', autenticar, comunicadosController.listar);

/**
 * @route   POST /api/comunicados
 * @desc    Criar novo comunicado (apenas MONITOR_QUALIDADE)
 * @access  Private (Monitor)
 */
router.post(
    '/',
    autenticar,
    upload.array('arquivos', 5),
    validarComunicado,
    comunicadosController.criar
);

/**
 * @route   PUT /api/comunicados/:id
 * @desc    Atualizar comunicado existente
 * @access  Private (Monitor)
 */
router.put(
    '/:id',
    autenticar,
    upload.array('arquivos', 5),
    validarComunicado,
    comunicadosController.atualizar
);

/**
 * @route   DELETE /api/comunicados/:id
 * @desc    Deletar comunicado
 * @access  Private (Monitor)
 */
router.delete('/:id', autenticar, comunicadosController.deletar);

/**
 * @route   POST /api/comunicados/:id/curtir
 * @desc    Curtir/descurtir comunicado
 * @access  Private
 */
router.post('/:id/curtir', autenticar, validarCurtida, comunicadosController.curtir);

/**
 * @route   POST /api/comunicados/ler
 * @desc    Registrar leitura de comunicado
 * @access  Private
 */
router.post('/ler', autenticar, comunicadosController.registrarLeitura);

module.exports = router;
