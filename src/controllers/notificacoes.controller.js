const notificacoesService = require('../services/notificacoes.service');
const logger = require('../utils/logger');

class NotificacoesController {
    /**
     * Listar notificações do usuário
     */
    async listar(req, res) {
        try {
            const usuario_id = req.usuario.id;
            const notificacoes = await notificacoesService.listarPorUsuario(usuario_id);
            res.json(notificacoes);
        } catch (error) {
            logger.error(`Erro ao listar notificações: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao buscar notificações.' });
        }
    }

    /**
     * Marcar notificação como lida
     */
    async marcarComoLida(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;

            // Verificar se a notificação pertence ao usuário
            const notificacao = await notificacoesService.buscarPorId(id);
            if (!notificacao || notificacao.usuario_id !== usuario_id) {
                return res.status(403).json({ erro: 'Acesso negado.' });
            }

            await notificacoesService.marcarComoLida(id);
            res.json({ mensagem: 'Marcada como lida.' });
        } catch (error) {
            logger.error(`Erro ao marcar notificação: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao atualizar notificação.' });
        }
    }
}

module.exports = new NotificacoesController();
