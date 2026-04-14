const { body, validationResult } = require('express-validator');

/**
 * Validação para login
 */
const validarLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('E-mail é obrigatório')
        .isEmail().withMessage('E-mail inválido')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Senha é obrigatória')
        .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),

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
    validarLogin
};
