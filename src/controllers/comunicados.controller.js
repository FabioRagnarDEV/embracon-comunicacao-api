const comunicadosService = require('../services/comunicados.service');
const logger = require('../utils/logger');

class ComunicadosController {
    /**
     * Listar todos os comunicados
     */
    async listar(req, res) {
        try {
            const comunicados = await comunicadosService.listarTodos();
            res.json(comunicados);
        } catch (error) {
            logger.error(`Erro ao listar comunicados: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao buscar comunicados.' });
        }
    }

    /**
     * Criar novo comunicado
     */
    async criar(req, res) {
        try {
            const { titulo, conteudo, tags } = req.body;
            const autor_id = req.usuario.id;
            const arquivos = req.files;

            // Verificar permissão
            if (req.usuario.perfil !== 'MONITOR_QUALIDADE') {
                return res.status(403).json({ erro: 'Apenas monitores podem criar comunicados.' });
            }

            const comunicado = await comunicadosService.criar({
                titulo,
                conteudo,
                tags,
                autor_id,
                arquivos
            });

            logger.info(`Comunicado criado: ${comunicado.id} por ${autor_id}`);
            res.status(201).json({ 
                mensagem: 'Comunicado publicado com sucesso!',
                comunicado 
            });
        } catch (error) {
            logger.error(`Erro ao criar comunicado: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao salvar comunicado.' });
        }
    }

    /**
     * Atualizar comunicado existente
     */
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { titulo, conteudo, tags } = req.body;
            const arquivos = req.files;

            // Verificar permissão
            if (req.usuario.perfil !== 'MONITOR_QUALIDADE') {
                return res.status(403).json({ erro: 'Apenas monitores podem editar comunicados.' });
            }

            await comunicadosService.atualizar(id, {
                titulo,
                conteudo,
                tags,
                arquivos
            });

            logger.info(`Comunicado atualizado: ${id} por ${req.usuario.id}`);
            res.json({ mensagem: 'Comunicado atualizado com sucesso!' });
        } catch (error) {
            logger.error(`Erro ao atualizar comunicado: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao atualizar comunicado.' });
        }
    }

    /**
     * Deletar comunicado
     */
    async deletar(req, res) {
        try {
            const { id } = req.params;

            // Verificar permissão
            if (req.usuario.perfil !== 'MONITOR_QUALIDADE') {
                return res.status(403).json({ erro: 'Apenas monitores podem deletar comunicados.' });
            }

            await comunicadosService.deletar(id);

            logger.info(`Comunicado deletado: ${id} por ${req.usuario.id}`);
            res.json({ mensagem: 'Comunicado deletado com sucesso!' });
        } catch (error) {
            logger.error(`Erro ao deletar comunicado: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao deletar comunicado.' });
        }
    }

    /**
     * Curtir/descurtir comunicado
     */
    async curtir(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.usuario.id;

            const resultado = await comunicadosService.toggleCurtida(id, usuario_id);

            res.json({ curtiu: resultado.curtiu });
        } catch (error) {
            logger.error(`Erro ao processar curtida: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao processar curtida.' });
        }
    }

    /**
     * Registrar leitura de comunicado
     */
    async registrarLeitura(req, res) {
        try {
            const { comunicado_id } = req.body;
            const usuario_id = req.usuario.id;

            await comunicadosService.registrarLeitura(usuario_id, comunicado_id);

            res.json({ mensagem: 'Leitura registrada com sucesso.' });
        } catch (error) {
            logger.error(`Erro ao registrar leitura: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao registrar leitura.' });
        }
    }
}

module.exports = new ComunicadosController();
