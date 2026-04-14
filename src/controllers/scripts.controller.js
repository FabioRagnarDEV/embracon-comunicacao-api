const scriptsService = require('../services/scripts.service');
const logger = require('../utils/logger');

class ScriptsController {
    /**
     * Listar scripts do usuário e da equipe
     */
    async listar(req, res) {
        try {
            const usuario_id = req.usuario.id;
            const scripts = await scriptsService.listarPorUsuario(usuario_id);
            res.json(scripts);
        } catch (error) {
            logger.error(`Erro ao listar scripts: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao buscar scripts.' });
        }
    }

    /**
     * Criar novo script
     */
    async criar(req, res) {
        try {
            const { titulo, conteudo, visivel_equipe } = req.body;
            const autor_id = req.usuario.id;
            const arquivos = req.files;

            const script = await scriptsService.criar({
                titulo,
                conteudo,
                autor_id,
                visivel_equipe: visivel_equipe === 'true',
                arquivos
            });

            logger.info(`Script criado: ${script.id} por ${autor_id}`);
            res.status(201).json({ mensagem: 'Script salvo com sucesso!', script });
        } catch (error) {
            logger.error(`Erro ao criar script: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao salvar script.' });
        }
    }

    /**
     * Atualizar script existente
     */
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { titulo, conteudo, visivel_equipe } = req.body;
            const usuario_id = req.usuario.id;
            const arquivos = req.files;

            // Verificar se o usuário é o autor
            const script = await scriptsService.buscarPorId(id);
            if (!script || script.autor_id !== usuario_id) {
                return res.status(403).json({ erro: 'Você não tem permissão para editar este script.' });
            }

            await scriptsService.atualizar(id, {
                titulo,
                conteudo,
                visivel_equipe: visivel_equipe === 'true',
                arquivos
            });

            logger.info(`Script atualizado: ${id} por ${usuario_id}`);
            res.json({ mensagem: 'Script atualizado com sucesso!' });
        } catch (error) {
            logger.error(`Erro ao atualizar script: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao atualizar script.' });
        }
    }

    /**
     * Deletar script
     */
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;

            // Verificar se o usuário é o autor
            const script = await scriptsService.buscarPorId(id);
            if (!script || script.autor_id !== usuario_id) {
                return res.status(403).json({ erro: 'Você não tem permissão para deletar este script.' });
            }

            await scriptsService.deletar(id);

            logger.info(`Script deletado: ${id} por ${usuario_id}`);
            res.json({ mensagem: 'Script deletado com sucesso!' });
        } catch (error) {
            logger.error(`Erro ao deletar script: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao deletar script.' });
        }
    }
}

module.exports = new ScriptsController();
