const { body, param, validationResult } = require('express-validator');

/**
 * Validação para criação/atualização de comunicado
 */
const validarComunicado = [
    body('titulo')
        .trim()
        .notEmpty().withMessage('Título é obrigatório')
        .isLength({ min: 5, max: 200 }).withMessage('Título deve ter entre 5 e 200 caracteres')
        .escape(),
    
    body('conteudo')
        .trim()
        .notEmpty().withMessage('Conteúdo é obrigatório')
        .isLength({ min: 10, max: 50000 }).withMessage('Conteúdo deve ter entre 10 e 50000 caracteres'),
    
    body('tags')
        .trim()
        .notEmpty().withMessage('Tags são obrigatórias')
        .isLength({ max: 100 }).withMessage('Tags devem ter no máximo 100 caracteres')
        .escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                erro: 'Dados inválidos', 
                detalhes: errors.array() 
            });
        }
        next();
    }
];

/**
 * Validação para curtida
 */
const validarCurtida = [
    param('id')
        .isUUID().withMessage('ID do comunicado inválido'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                erro: 'Dados inválidos', 
                detalhes: errors.array() 
            });
        }
        next();
    }
];

module.exports = {
    validarComunicado,
    validarCurtida
};
