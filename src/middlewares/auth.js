const { supabaseAdmin } = require('../config/supabase');

// Middleware de autenticação — valida o JWT do Supabase em todas as rotas protegidas
async function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
        return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }

    req.usuario = data.user;
    next();
}

module.exports = autenticar;
