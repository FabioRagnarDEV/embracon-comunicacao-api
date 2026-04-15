const { body, param, validationResult } = require('express-validator');

/**
 * Extrai texto puro de HTML (para validar tamanho real do conteúdo)
 */
const extrairTexto = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
};

/**
 * Validação para criação/atualização de comunicado
 */
const validarComunicado = [
    body('titulo')
        .trim()
        .notEmpty().withMessage('Título é obrigatório')
        .isLength({ min: 3, max: 200 }).withMessage('Título deve ter entre 3 e 200 caracteres'),
        // Sem .escape() — a sanitização do HTML é feita pelo DOMPurify no service
    
    body('conteudo')
        .notEmpty().withMessage('Conteúdo é obrigatório')
        .custom((value) => {
            const textoLimpo = extrairTexto(value);
            if (textoLimpo.length < 3) {
                throw new Error('Conteúdo não pode estar vazio');
            }
            if (value.length > 10000000) { // 10MB de HTML (suporta imagens base64)
                throw new Error('Conteúdo excede o limite máximo permitido');
            }
            return true;
        }),
    
    body('tags')
        .trim()
        .notEmpty().withMessage('Tags são obrigatórias')
        .isLength({ max: 200 }).withMessage('Tags devem ter no máximo 200 caracteres'),
        // Sem .escape() — sanitizado no service

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                erro: errors.array()[0].msg,
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
        .notEmpty().withMessage('ID do comunicado é obrigatório'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                erro: errors.array()[0].msg,
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
