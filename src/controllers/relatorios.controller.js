const relatoriosService = require('../services/relatorios.service');
const logger = require('../utils/logger');

class RelatoriosController {
    /**
     * Obter métricas e relatórios de leitura
     */
    async obterMetricas(req, res) {
        try {
            const metricas = await relatoriosService.obterMetricas();
            res.json(metricas);
        } catch (error) {
            logger.error(`Erro ao obter métricas: ${error.message}`);
            res.status(500).json({ erro: 'Erro ao processar métricas.' });
        }
    }
}

module.exports = new RelatoriosController();
