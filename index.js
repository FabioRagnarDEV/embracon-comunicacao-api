require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

const app = express();
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { 
        fieldSize: 50 * 1024 * 1024, 
        fileSize: 200 * 1024 * 1024   
    } 
});

app.get('/status', (req, res) => {
    res.json({ mensagem: '✅ API da Plataforma Integradora rodando com sucesso!' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({ email, password });
    if (authError) return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });

    const { data: usuarioData, error: dbError } = await supabaseAdmin
        .from('usuarios')
        .select(`id, nome_completo, perfis ( nome )`)
        .eq('id', authData.user.id)
        .single();

    if (dbError) return res.status(500).json({ erro: 'Erro ao buscar o perfil do usuário.' });

    res.json({
        mensagem: 'Login realizado com sucesso!',
        token: authData.session.access_token,
        usuario: {
            id: usuarioData.id,
            nome: usuarioData.nome_completo,
            email: authData.user.email,
            perfil: usuarioData.perfis.nome 
        }
    });
});

app.post('/comunicados', upload.array('arquivos', 5), async (req, res) => {
    const { titulo, conteudo, tags, autor_id } = req.body;

    if (!titulo || !conteudo || !autor_id) {
        return res.status(400).json({ erro: 'Título, conteúdo e autor são obrigatórios.' });
    }

    try {
        const { data: comunicadoData, error: comunicadoError } = await supabaseAdmin
            .from('comunicados_oficiais')
            .insert([{ titulo, conteudo, tags, autor_id }])
            .select()
            .single();
            
        if (comunicadoError) throw comunicadoError;
        
        const comunicadoId = comunicadoData.id;

        const { data: usuarios } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .neq('id', autor_id);

        if (usuarios && usuarios.length > 0) {
            const pacotesNotificacao = usuarios.map(user => ({
                usuario_id: user.id,
                comunicado_id: comunicadoId,
                titulo: 'Novo Comunicado Oficial!',
                mensagem: `O assunto "${titulo}" acabou de ser publicado. Não deixe de ler.`
            }));
            
            const { error: erroNotif } = await supabaseAdmin.from('notificacoes').insert(pacotesNotificacao);
                if (erroNotif) {
                    console.error("🚨 ERRO GRAVE NA NOTIFICAÇÃO:", erroNotif);
                } else {
                        console.log("✅ Notificações salvas com sucesso no banco!");
}
        }
        
        if (req.files && req.files.length > 0) {
            for (const arquivo of req.files) {
                const nomeLimpo = arquivo.originalname
                    .normalize('NFD') 
                    .replace(/[\u0300-\u036f]/g, '') 
                    .replace(/[^a-zA-Z0-9.\-_]/g, '_'); 

                const nomeUnico = `${Date.now()}_${nomeLimpo}`;
                
                const { error: uploadError } = await supabaseAdmin.storage
                    .from('anexos')
                    .upload(nomeUnico, arquivo.buffer, { contentType: arquivo.mimetype });

                if (uploadError) {
                    continue; 
                }
                
                const { data: publicUrlData } = supabaseAdmin.storage
                    .from('anexos')
                    .getPublicUrl(nomeUnico);

                await supabaseAdmin
                    .from('anexos_comunicados')
                    .insert([{
                        comunicado_id: comunicadoId,
                        nome_arquivo: arquivo.originalname,
                        url_arquivo: publicUrlData.publicUrl,
                        tipo_arquivo: arquivo.mimetype
                    }]);
            }
        }

        res.status(201).json({ mensagem: 'Comunicado e anexos publicados com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno ao salvar o comunicado.' });
    }
});

app.get('/comunicados', async (req, res) => {
    try {
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
                    usuarios ( nome_completo )
                )
            `)
            .order('criado_em', { ascending: false });

        if (error) return res.status(500).json({ erro: 'Erro ao buscar dados na base.' });

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ erro: 'Falha interna no servidor.' });
    }
});

app.post('/comunicados/:id/curtir', async (req, res) => {
    const { id } = req.params; 
    const { usuario_id } = req.body;

    try {
        const { data: existente } = await supabaseAdmin
            .from('curtidas_comunicados')
            .select('*')
            .eq('comunicado_id', id)
            .eq('usuario_id', usuario_id)
            .single();

        if (existente) {
            await supabaseAdmin
                .from('curtidas_comunicados')
                .delete()
                .eq('comunicado_id', id)
                .eq('usuario_id', usuario_id);
                
            res.status(200).json({ curtiu: false });
        } else {
            await supabaseAdmin.from('curtidas_comunicados').insert([{ comunicado_id: id, usuario_id }]);
            res.status(200).json({ curtiu: true });
        }
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao processar curtida' });
    }
});

app.delete('/comunicados/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabaseAdmin
            .from('comunicados_oficiais')
            .delete()
            .eq('id', id);

        if (error) return res.status(500).json({ erro: 'Erro de exclusão no banco.' });
        res.status(200).json({ mensagem: 'Comunicado deletado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: 'Falha interna no servidor.' });
    }
});

app.put('/comunicados/:id', upload.array('arquivos', 5), async (req, res) => {
    const { id } = req.params;
    const { titulo, conteudo, tags } = req.body;

    try {
        const { error: updateError } = await supabaseAdmin
            .from('comunicados_oficiais')
            .update({ titulo, conteudo, tags, atualizado_em: new Date() })
            .eq('id', id);

        if (updateError) throw updateError;

        if (req.files && req.files.length > 0) {
            
            const { data: anexosAntigos } = await supabaseAdmin
                .from('anexos_comunicados')
                .select('url_arquivo')
                .eq('comunicado_id', id);

            if (anexosAntigos && anexosAntigos.length > 0) {
                const arquivosParaApagar = anexosAntigos.map(anexo => {
                    const partes = anexo.url_arquivo.split('/anexos/');
                    return partes[partes.length - 1]; 
                });

                await supabaseAdmin.storage.from('anexos').remove(arquivosParaApagar);
                await supabaseAdmin.from('anexos_comunicados').delete().eq('comunicado_id', id);
            }

            for (const arquivo of req.files) {
                const nomeLimpo = arquivo.originalname
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-zA-Z0-9.\-_]/g, '_');

                const nomeUnico = `${Date.now()}_${nomeLimpo}`;

                const { error: uploadError } = await supabaseAdmin.storage
                    .from('anexos')
                    .upload(nomeUnico, arquivo.buffer, { contentType: arquivo.mimetype });

                if (uploadError) continue;

                const { data: publicUrlData } = supabaseAdmin.storage.from('anexos').getPublicUrl(nomeUnico);

                await supabaseAdmin.from('anexos_comunicados').insert([{
                    comunicado_id: id,
                    nome_arquivo: arquivo.originalname,
                    url_arquivo: publicUrlData.publicUrl,
                    tipo_arquivo: arquivo.mimetype
                }]);
            }
        }

        res.status(200).json({ mensagem: 'Comunicado e anexos atualizados com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: 'Falha interna no servidor.' });
    }
});

app.post('/comunicados/ler', async (req, res) => {
    const { usuario_id, comunicado_id } = req.body;
    
    if (!usuario_id || !comunicado_id) {
        return res.status(400).json({ erro: 'Dados incompletos para o log.' });
    }

    try {
        const { error } = await supabaseAdmin
            .from('logs_leitura')
            .insert([{ usuario_id, comunicado_id }]);

        if (error) throw error;
        
        res.status(200).json({ mensagem: 'Leitura registrada com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao registrar log.' });
    }
});

app.post('/scripts', upload.array('arquivos', 5), async (req, res) => {
    const { titulo, conteudo, autor_id, visivel_equipe } = req.body;
    try {
        const { data: scriptData, error: scriptError } = await supabaseAdmin
            .from('scripts_atendimento')
            .insert([{ titulo, conteudo, autor_id, visivel_equipe: visivel_equipe === 'true' }])
            .select()
            .single();
            
        if (scriptError) throw scriptError;

        if (req.files && req.files.length > 0) {
            for (const arquivo of req.files) {
                const nomeLimpo = arquivo.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.\-_]/g, '_');
                const nomeUnico = `scripts/${Date.now()}_${nomeLimpo}`;
                
                const { error: uploadError } = await supabaseAdmin.storage.from('anexos').upload(nomeUnico, arquivo.buffer, { contentType: arquivo.mimetype });
                if (uploadError) continue;
                
                const { data: publicUrlData } = supabaseAdmin.storage.from('anexos').getPublicUrl(nomeUnico);

                await supabaseAdmin.from('anexos_scripts').insert([{
                    script_id: scriptData.id,
                    nome_arquivo: arquivo.originalname,
                    url_arquivo: publicUrlData.publicUrl,
                    tipo_arquivo: arquivo.mimetype
                }]);
            }
        }
        res.status(201).json({ mensagem: 'Script salvo com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao salvar o script.' });
    }
});

app.get('/scripts/:autor_id', async (req, res) => {
    const { autor_id } = req.params;
    try {
        const { data, error } = await supabaseAdmin
            .from('scripts_atendimento')
            .select(`
                *,
                anexos_scripts ( id, nome_arquivo, url_arquivo, tipo_arquivo )
            `)
            .or(`autor_id.eq.${autor_id},visivel_equipe.eq.true`)
            .order('criado_em', { ascending: false });

        if (error) {
            return res.status(500).json({ erro: 'Erro interno do Supabase', detalhes: error });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar scripts.' });
    }
});

app.put('/scripts/:id', upload.array('arquivos', 5), async (req, res) => {
    const { id } = req.params;
    const { titulo, conteudo, visivel_equipe } = req.body;

    try {
        const { error: updateError } = await supabaseAdmin
            .from('scripts_atendimento')
            .update({ titulo, conteudo, visivel_equipe: visivel_equipe === 'true' })
            .eq('id', id);

        if (updateError) throw updateError;

        if (req.files && req.files.length > 0) {
            const { data: anexosAntigos } = await supabaseAdmin.from('anexos_scripts').select('url_arquivo').eq('script_id', id);
            if (anexosAntigos && anexosAntigos.length > 0) {
                const arquivosParaApagar = anexosAntigos.map(anexo => anexo.url_arquivo.split('/anexos/')[1]);
                await supabaseAdmin.storage.from('anexos').remove(arquivosParaApagar);
                await supabaseAdmin.from('anexos_scripts').delete().eq('script_id', id);
            }

            for (const arquivo of req.files) {
                const nomeLimpo = arquivo.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9.\-_]/g, '_');
                const nomeUnico = `scripts/${Date.now()}_${nomeLimpo}`;

                const { error: uploadError } = await supabaseAdmin.storage.from('anexos').upload(nomeUnico, arquivo.buffer, { contentType: arquivo.mimetype });
                if (uploadError) continue;

                const { data: publicUrlData } = supabaseAdmin.storage.from('anexos').getPublicUrl(nomeUnico);
                await supabaseAdmin.from('anexos_scripts').insert([{
                    script_id: id,
                    nome_arquivo: arquivo.originalname,
                    url_arquivo: publicUrlData.publicUrl,
                    tipo_arquivo: arquivo.mimetype
                }]);
            }
        }
        res.status(200).json({ mensagem: 'Script atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: 'Falha interna no servidor.' });
    }
});

app.delete('/scripts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await supabaseAdmin.from('scripts_atendimento').delete().eq('id', id);
        res.status(200).json({ mensagem: 'Script deletado com sucesso!' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao deletar o script.' });
    }
});

app.get('/relatorios', async (req, res) => {
    try {
        const { data: logs, error } = await supabaseAdmin
            .from('logs_leitura')
            .select(`
                id,
                lido_em,
                usuarios ( nome_completo, perfil_id ),
                comunicados_oficiais ( titulo, tags )
            `)
            .order('lido_em', { ascending: false });

        if (error) throw error;

        const contagem = {};
        logs.forEach(log => {
            const titulo = log.comunicados_oficiais?.titulo || 'Comunicado Excluído'; 
            
            if (!contagem[titulo]) {
                contagem[titulo] = { 
                    titulo: titulo, 
                    acessos: 0, 
                    tags: log.comunicados_oficiais?.tags || 'N/A' 
                };
            }
            contagem[titulo].acessos += 1;
        });

        const ranking = Object.values(contagem).sort((a, b) => b.acessos - a.acessos);

        res.status(200).json({
            ranking: ranking,
            historico: logs
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao processar as métricas.' });
    }
});

app.get('/notificacoes/:usuario_id', async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const { data, error } = await supabaseAdmin
            .from('notificacoes')
            .select('*')
            .eq('usuario_id', usuario_id)
            .order('criado_em', { ascending: false })
            .limit(10); 

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar notificações' });
    }
});

app.put('/notificacoes/:id/ler', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabaseAdmin
            .from('notificacoes')
            .update({ lida: true })
            .eq('id', id);

        if (error) throw error;
        res.status(200).json({ mensagem: 'Marcada como lida' });
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao atualizar notificação' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend iniciado na porta ${PORT}`);
});