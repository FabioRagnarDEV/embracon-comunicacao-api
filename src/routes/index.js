const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const comunicadosRoutes = require('./comunicados.routes');
const scriptsRoutes = require('./scripts.routes');
const relatoriosRoutes = require('./relatorios.routes');
const notificacoesRoutes = require('./notificacoes.routes');

// Health check
router.get('/status', (req, res) => {
    res.json({ 
        mensagem: '✅ API da Plataforma Integradora rodando com sucesso!',
        timestamp: new Date().toISOString(),
        ambiente: process.env.NODE_ENV || 'development'
    });
});

// Rotas da aplicação
router.use('/auth', authRoutes);
router.use('/comunicados', comunicadosRoutes);
router.use('/scripts', scriptsRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/notificacoes', notificacoesRoutes);

module.exports = router;
