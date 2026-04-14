/**
 * Middleware para verificar permissões baseadas em perfil
 */
function verificarPermissao(perfisPermitidos) {
    return async (req, res, next) => {
        try {
            const perfilUsuario = req.usuario.perfil;

            if (!perfisPermitidos.includes(perfilUsuario)) {
                return res.status(403).json({ 
                    erro: 'Acesso negado. Você não tem permissão para esta ação.' 
                });
            }

            next();
        } catch (error) {
            res.status(500).json({ erro: 'Erro ao verificar permissões.' });
        }
    };
}

module.exports = {
    verificarPermissao
};
