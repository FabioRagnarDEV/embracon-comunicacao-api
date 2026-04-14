const { supabaseAdmin } = require('../config/supabase');

class NotificacoesService {
    /**
     * Listar notificações do usuário
     */
    async listarPorUsuario(usuario_id) {
        const { data, error } = await supabaseAdmin
            .from('notificacoes')
            .select('*')
            .eq('usuario_id', usuario_id)
            .order('criado_em', { ascending: false })
            .limit(10);

        if (error) throw new Error(`Erro ao buscar notificações: ${error.message}`);
        return data;
    }

    /**
     * Buscar notificação por ID
     */
    async buscarPorId(id) {
        const { data, error } = await supabaseAdmin
            .from('notificacoes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    }

    /**
     * Marcar notificação como lida
     */
    async marcarComoLida(id) {
        const { error } = await supabaseAdmin
            .from('notificacoes')
            .update({ lida: true })
            .eq('id', id);

        if (error) throw new Error(`Erro ao atualizar notificação: ${error.message}`);
    }

    /**
     * Criar notificações para novo comunicado
     */
    async notificarNovoComunicado(comunicado_id, titulo, autor_id) {
        // Buscar todos os usuários exceto o autor
        const { data: usuarios } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .neq('id', autor_id);

        if (usuarios && usuarios.length > 0) {
            const notificacoes = usuarios.map(user => ({
                usuario_id: user.id,
                comunicado_id,
                titulo: 'Novo Comunicado Oficial!',
                mensagem: `O assunto "${titulo}" acabou de ser publicado. Não deixe de ler.`
            }));

            const { error } = await supabaseAdmin
                .from('notificacoes')
                .insert(notificacoes);

            if (error) {
                console.error('Erro ao criar notificações:', error.message);
            }
        }
    }
}

module.exports = new NotificacoesService();
