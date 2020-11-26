const Multer = require("multer");
const path = require("path")

module.exports = {
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        req.filename = `${Date.now()}-${file.originalname}`
        callback(null, true)
    },
}