const { createClient } = require('@supabase/supabase-js');
const { supabaseAdmin, supabaseUrl, supabaseKey } = require('../config/supabase');

class AuthService {
    /**
     * Autenticar usuário com email e senha
     */
    async autenticar(email, password) {
        // Criar cliente Supabase para autenticação
        const supabaseAuth = createClient(supabaseUrl, supabaseKey, { 
            auth: { persistSession: false } 
        });

        // Tentar autenticar
        const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({ 
            email, 
            password 
        });

        if (authError) {
            throw new Error('Credenciais inválidas');
        }

        // Buscar dados do usuário no banco
        const { data: usuarioData, error: dbError } = await supabaseAdmin
            .from('usuarios')
            .select(`
                id, 
                nome_completo, 
                perfil_id,
                perfis ( nome )
            `)
            .eq('id', authData.user.id)
            .single();

        if (dbError) {
            throw new Error('Erro ao buscar perfil do usuário');
        }

        return {
            token: authData.session.access_token,
            usuario: {
                id: usuarioData.id,
                nome: usuarioData.nome_completo,
                email: authData.user.email,
                perfil: usuarioData.perfis.nome
            }
        };
    }

    /**
     * Obter dados do usuário autenticado
     */
    async obterDadosUsuario(usuario_id) {
        const { data, error } = await supabaseAdmin
            .from('usuarios')
            .select(`
                id, 
                nome_completo, 
                email,
                perfil_id,
                perfis ( nome )
            `)
            .eq('id', usuario_id)
            .single();

        if (error) throw new Error('Usuário não encontrado');
        
        return {
            id: data.id,
            nome: data.nome_completo,
            email: data.email,
            perfil: data.perfis.nome
        };
    }
}

module.exports = new AuthService();
