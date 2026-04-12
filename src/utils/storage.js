const { supabaseAdmin } = require('../config/supabase');

// Sanitiza o nome do arquivo para evitar falhas de URI no bucket
function sanitizarNome(nomeOriginal) {
    return nomeOriginal
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

// Faz upload de um arquivo para o bucket e retorna a URL pública
async function uploadArquivo(arquivo, pasta = '') {
    const nomeLimpo = sanitizarNome(arquivo.originalname);
    const prefixo = pasta ? `${pasta}/` : '';
    const nomeUnico = `${prefixo}${Date.now()}_${nomeLimpo}`;

    const { error: uploadError } = await supabaseAdmin.storage
        .from('anexos')
        .upload(nomeUnico, arquivo.buffer, { contentType: arquivo.mimetype });

    if (uploadError) {
        console.warn(`Upload falhou para ${arquivo.originalname}:`, uploadError.message);
        return null;
    }

    const { data } = supabaseAdmin.storage.from('anexos').getPublicUrl(nomeUnico);
    return { nomeUnico, publicUrl: data.publicUrl };
}

// Remove arquivos físicos do bucket a partir de uma lista de URLs públicas
async function removerArquivos(urls) {
    if (!urls || urls.length === 0) return;

    const caminhos = urls
        .map(url => {
            const partes = url.split('/anexos/');
            return partes.length > 1 ? partes[1] : null;
        })
        .filter(Boolean);

    if (caminhos.length > 0) {
        const { error } = await supabaseAdmin.storage.from('anexos').remove(caminhos);
        if (error) console.warn('Falha ao remover arquivos do storage:', error.message);
    }
}

module.exports = { uploadArquivo, removerArquivos };
