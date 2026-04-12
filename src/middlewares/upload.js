const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fieldSize: 50 * 1024 * 1024,
        fileSize: 200 * 1024 * 1024
    }
});

module.exports = upload;
