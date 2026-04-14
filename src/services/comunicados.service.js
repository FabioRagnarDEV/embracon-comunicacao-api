const { supabaseAdmin } = require('../config/supabase');
const { uploadArquivo, removerArquivos } = require('../utils/storage');
const notificacoesService = require('./notificacoes.service');
const { sanitizarHTML } = require('../utils/sanitizer');

class ComunicadosService {
    /**
     * Listar todos os comunicados com anexos e curtidas
     */
    async listarTodos() {
        const { data, error } = await supabaseAdmin
            .from('comunicados_oficiais')
            .select(`
                *,
                anexos_comunicados (
                    id,
                    nome_arquivo,
                    url_arquivo,
                    tipo_arquivo
                ),
                curtidas_comunicados (
                    usuario_id,
                    usuarios ( nome_completo )
                )
            `)
            .order('criado_em', { ascending: false });

        if (error) throw new Error(`Erro ao buscar comunicados: ${error.message}`);
        return data;
    }

    /**
     * Criar novo comunicado
     */
    async criar({ titulo, conteudo, tags, autor_id, arquivos }) {
        // Sanitizar conteúdo HTML
        const conteudoLimpo = sanitizarHTML(conteudo);

        // Inserir comunicado
        const { data: comunicado, error: comunicadoError } = await supabaseAdmin
            .from('comunicados_oficiais')
            .insert([{ 
                titulo: titulo.trim(), 
                conteudo: conteudoLimpo, 
                tags: tags.trim(), 
                autor_id 
            }])
            .select()
            .single();

        if (comunicadoError) throw new Error(`Erro ao criar comunicado: ${comunicadoError.message}`);

        // Processar anexos
        if (arquivos && arquivos.length > 0) {
            await this.processarAnexos(comunicado.id, arquivos);
        }

        // Criar notificações para todos os usuários
        await notificacoesService.notificarNovoComunicado(comunicado.id, titulo, autor_id);

        return comunicado;
    }

    /**
     * Atualizar comunicado existente
     */
    async atualizar(id, { titulo, conteudo, tags, arquivos }) {
        const conteudoLimpo = sanitizarHTML(conteudo);

        const { error: updateError } = await supabaseAdmin
            .from('comunicados_oficiais')
            .update({ 
                titulo: titulo.trim(), 
                conteudo: conteudoLimpo, 
                tags: tags.trim(), 
                atualizado_em: new Date() 
            })
            .eq('id', id);

        if (updateError) throw new Error(`Erro ao atualizar comunicado: ${updateError.message}`);

        // Se houver novos arquivos, remover os antigos e adicionar os novos
        if (arquivos && arquivos.length > 0) {
            await this.removerAnexosAntigos(id);
            await this.processarAnexos(id, arquivos);
        }
    }

    /**
     * Deletar comunicado
     */
    async deletar(id) {
        // Remover anexos físicos antes de deletar
        await this.removerAnexosAntigos(id);

        const { error } = await supabaseAdmin
            .from('comunicados_oficiais')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Erro ao deletar comunicado: ${error.message}`);
    }

    /**
     * Toggle curtida em comunicado
     */
    async toggleCurtida(comunicado_id, usuario_id) {
        const { data: existente } = await supabaseAdmin
            .from('curtidas_comunicados')
            .select('*')
            .eq('comunicado_id', comunicado_id)
            .eq('usuario_id', usuario_id)
            .single();

        if (existente) {
            await supabaseAdmin
                .from('curtidas_comunicados')
                .delete()
                .eq('comunicado_id', comunicado_id)
                .eq('usuario_id', usuario_id);
            
            return { curtiu: false };
        } else {
            await supabaseAdmin
                .from('curtidas_comunicados')
                .insert([{ comunicado_id, usuario_id }]);
            
            return { curtiu: true };
        }
    }

    /**
     * Registrar leitura de comunicado
     */
    async registrarLeitura(usuario_id, comunicado_id) {
        const { error } = await supabaseAdmin
            .from('logs_leitura')
            .insert([{ usuario_id, comunicado_id }]);

        if (error) throw new Error(`Erro ao registrar leitura: ${error.message}`);
    }

    /**
     * Processar upload de anexos
     */
    async processarAnexos(comunicado_id, arquivos) {
        for (const arquivo of arquivos) {
            const resultado = await uploadArquivo(arquivo);
            
            if (resultado) {
                await supabaseAdmin
                    .from('anexos_comunicados')
                    .insert([{
                        comunicado_id,
                        nome_arquivo: arquivo.originalname,
                        url_arquivo: resultado.publicUrl,
                        tipo_arquivo: arquivo.mimetype
                    }]);
            }
        }
    }

    /**
     * Remover anexos antigos
     */
    async removerAnexosAntigos(comunicado_id) {
        const { data: anexos } = await supabaseAdmin
            .from('anexos_comunicados')
            .select('url_arquivo')
            .eq('comunicado_id', comunicado_id);

        if (anexos && anexos.length > 0) {
            const urls = anexos.map(a => a.url_arquivo);
            await removerArquivos(urls);
            
            await supabaseAdmin
                .from('anexos_comunicados')
                .delete()
                .eq('comunicado_id', comunicado_id);
        }
    }
}

module.exports = new ComunicadosService();
