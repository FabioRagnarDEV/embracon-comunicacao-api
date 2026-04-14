const { supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Middleware de autenticação — valida o JWT do Supabase em todas as rotas protegidas
 */
async function autenticar(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
        }

        const token = authHeader.split(' ')[1];

        // Validar token com Supabase
        const { data, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !data?.user) {
            logger.warn(`Tentativa de acesso com token inválido: ${req.ip}`);
            return res.status(401).json({ erro: 'Token inválido ou expirado.' });
        }

        // Buscar perfil do usuário
        const { data: usuarioData, error: dbError } = await supabaseAdmin
            .from('usuarios')
            .select('id, nome_completo, perfil_id, perfis(nome)')
            .eq('id', data.user.id)
            .single();

        if (dbError || !usuarioData) {
            logger.error(`Erro ao buscar dados do usuário ${data.user.id}: ${dbError?.message}`);
            return res.status(401).json({ erro: 'Usuário não encontrado.' });
        }

        // Adicionar dados do usuário à requisição
        req.usuario = {
            id: usuarioData.id,
            nome: usuarioData.nome_completo,
            perfil: usuarioData.perfis.nome,
            email: data.user.email
        };

        next();
    } catch (error) {
        logger.error(`Erro no middleware de autenticação: ${error.message}`);
        res.status(500).json({ erro: 'Erro ao processar autenticação.' });
    }
}

module.exports = autenticar;
