const rateLimit = require('express-rate-limit');

/**
 * Rate limiter geral para todas as rotas
 */
const limiterGeral = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        erro: 'Muitas requisições deste IP. Tente novamente mais tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter específico para login (mais restritivo)
 */
const limiterLogin = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: {
        erro: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter para upload de arquivos
 */
const limiterUpload = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // 20 uploads por hora
    message: {
        erro: 'Limite de uploads atingido. Tente novamente mais tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    limiterGeral,
    limiterLogin,
    limiterUpload
};
