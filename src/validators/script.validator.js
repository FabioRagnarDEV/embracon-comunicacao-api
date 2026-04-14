const { body, validationResult } = require('express-validator');

/**
 * Validação para criação/atualização de script
 */
const validarScript = [
    body('titulo')
        .trim()
        .notEmpty().withMessage('Título é obrigatório')
        .isLength({ min: 3, max: 200 }).withMessage('Título deve ter entre 3 e 200 caracteres')
        .escape(),
    
    body('conteudo')
        .trim()
        .notEmpty().withMessage('Conteúdo é obrigatório')
        .isLength({ min: 5, max: 50000 }).withMessage('Conteúdo deve ter entre 5 e 50000 caracteres'),
    
    body('visivel_equipe')
        .optional()
        .isIn(['true', 'false']).withMessage('visivel_equipe deve ser true ou false'),

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
    validarScript
};
