const { supabaseAdmin } = require('../config/supabase');
const { uploadArquivo, removerArquivos } = require('../utils/storage');
const { sanitizarHTML } = require('../utils/sanitizer');

class ScriptsService {
    /**
     * Listar scripts do usuário e da equipe
     */
    async listarPorUsuario(usuario_id) {
        const { data, error } = await supabaseAdmin
            .from('scripts_atendimento')
            .select(`
                *,
                anexos_scripts ( id, nome_arquivo, url_arquivo, tipo_arquivo ),
                usuarios ( nome_completo )
            `)
            .or(`autor_id.eq.${usuario_id},visivel_equipe.eq.true`)
            .order('criado_em', { ascending: false });

        if (error) throw new Error(`Erro ao buscar scripts: ${error.message}`);
        return data;
    }

    /**
     * Buscar script por ID
     */
    async buscarPorId(id) {
        const { data, error } = await supabaseAdmin
            .from('scripts_atendimento')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data;
    }

    /**
     * Criar novo script
     */
    async criar({ titulo, conteudo, autor_id, visivel_equipe, arquivos }) {
        const conteudoLimpo = sanitizarHTML(conteudo);

        const { data: script, error: scriptError } = await supabaseAdmin
            .from('scripts_atendimento')
            .insert([{ 
                titulo: titulo.trim(), 
                conteudo: conteudoLimpo, 
                autor_id, 
                visivel_equipe 
            }])
            .select()
            .single();

        if (scriptError) throw new Error(`Erro ao criar script: ${scriptError.message}`);

        // Processar anexos
        if (arquivos && arquivos.length > 0) {
            await this.processarAnexos(script.id, arquivos);
        }

        return script;
    }

    /**
     * Atualizar script existente
     */
    async atualizar(id, { titulo, conteudo, visivel_equipe, arquivos }) {
        const conteudoLimpo = sanitizarHTML(conteudo);

        const { error: updateError } = await supabaseAdmin
            .from('scripts_atendimento')
            .update({ 
                titulo: titulo.trim(), 
                conteudo: conteudoLimpo, 
                visivel_equipe 
            })
            .eq('id', id);

        if (updateError) throw new Error(`Erro ao atualizar script: ${updateError.message}`);

        // Se houver novos arquivos, remover os antigos e adicionar os novos
        if (arquivos && arquivos.length > 0) {
            await this.removerAnexosAntigos(id);
            await this.processarAnexos(id, arquivos);
        }
    }

    /**
     * Deletar script
     */
    async deletar(id) {
        await this.removerAnexosAntigos(id);

        const { error } = await supabaseAdmin
            .from('scripts_atendimento')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Erro ao deletar script: ${error.message}`);
    }

    /**
     * Processar upload de anexos
     */
    async processarAnexos(script_id, arquivos) {
        for (const arquivo of arquivos) {
            const resultado = await uploadArquivo(arquivo, 'scripts');
            
            if (resultado) {
                await supabaseAdmin
                    .from('anexos_scripts')
                    .insert([{
                        script_id,
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
    async removerAnexosAntigos(script_id) {
        const { data: anexos } = await supabaseAdmin
            .from('anexos_scripts')
            .select('url_arquivo')
            .eq('script_id', script_id);

        if (anexos && anexos.length > 0) {
            const urls = anexos.map(a => a.url_arquivo);
            await removerArquivos(urls);
            
            await supabaseAdmin
                .from('anexos_scripts')
                .delete()
                .eq('script_id', script_id);
        }
    }
}

module.exports = new ScriptsService();
