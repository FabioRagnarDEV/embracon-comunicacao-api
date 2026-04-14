const { supabaseAdmin } = require('../config/supabase');

class RelatoriosService {
    /**
     * Obter métricas de leitura e ranking
     */
    async obterMetricas() {
        const { data: logs, error } = await supabaseAdmin
            .from('logs_leitura')
            .select(`
                id,
                lido_em,
                usuarios ( nome_completo, perfil_id ),
                comunicados_oficiais ( titulo, tags )
            `)
            .order('lido_em', { ascending: false });

        if (error) throw new Error(`Erro ao buscar logs: ${error.message}`);

        // Calcular ranking
        const contagem = {};
        logs.forEach(log => {
            const titulo = log.comunicados_oficiais?.titulo || 'Comunicado Excluído';
            
            if (!contagem[titulo]) {
                contagem[titulo] = { 
                    titulo, 
                    acessos: 0, 
                    tags: log.comunicados_oficiais?.tags || 'N/A' 
                };
            }
            contagem[titulo].acessos += 1;
        });

        const ranking = Object.values(contagem).sort((a, b) => b.acessos - a.acessos);

        return {
            ranking,
            historico: logs
        };
    }
}

module.exports = new RelatoriosService();
