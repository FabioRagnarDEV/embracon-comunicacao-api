const logger = require('../utils/logger');

/**
 * Middleware global de tratamento de erros
 */
function errorHandler(err, req, res, next) {
    // Log do erro
    logger.error(`Erro não tratado: ${err.message}`, {
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        usuario: req.usuario?.id || 'não autenticado'
    });

    // Erro de validação do Multer (upload)
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                erro: 'Arquivo muito grande. Tamanho máximo: 200MB' 
            });
        }
        return res.status(400).json({ 
            erro: 'Erro no upload de arquivo.' 
        });
    }

    // Erro de sintaxe JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ 
            erro: 'JSON inválido na requisição.' 
        });
    }

    // Erro padrão
    res.status(err.status || 500).json({
        erro: process.env.NODE_ENV === 'production' 
            ? 'Erro interno do servidor.' 
            : err.message
    });
}

/**
 * Middleware para rotas não encontradas
 */
function notFoundHandler(req, res) {
    res.status(404).json({ 
        erro: 'Rota não encontrada.',
        rota: req.originalUrl 
    });
}

module.exports = {
    errorHandler,
    notFoundHandler
};
