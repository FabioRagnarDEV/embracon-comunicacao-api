const multer = require('multer');

// Upload em memória — buffers repassados diretamente para o Supabase Storage
// Limite de 200MB para suportar documentos e apresentações institucionais pesadas
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fieldSize: 50 * 1024 * 1024,
        fileSize: 200 * 1024 * 1024
    }
});

module.exports = upload;
