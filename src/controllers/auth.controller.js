const authService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {
    /**
     * Login de usuário
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;
            
            const resultado = await authService.autenticar(email, password);
            
            logger.info(`Login bem-sucedido: ${email}`);
            
            res.json({
                mensagem: 'Login realizado com sucesso!',
                token: resultado.token,
                usuario: resultado.usuario
            });
        } catch (error) {
            logger.error(`Erro no login: ${error.message}`);
            
            if (error.message === 'Credenciais inválidas') {
                return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
            }
            
            res.status(500).json({ erro: 'Erro interno ao processar login.' });
        }
    }

    /**
     * Logout de usuário
     */
    async logout(req, res) {
        try {
            // Implementar lógica de blacklist de tokens se necessário
            logger.info(`Logout: usuário ${req.usuario.id}`);
            res.json({ mensagem: 'Logout realizado com sucesso.' });
        } catch (error) {
            logger.error(`Erro no logout: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao processar logout.' });
        }
    }

    /**
     * Obter dados do usuário autenticado
     */
    async getMe(req, res) {
        try {
            const usuario = await authService.obterDadosUsuario(req.usuario.id);
            res.json({ usuario });
        } catch (error) {
            logger.error(`Erro ao obter dados do usuário: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao buscar dados do usuário.' });
        }
    }
}

module.exports = new AuthController();
