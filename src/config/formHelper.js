const formidable = require("formidable");
const path = require("path")

const formData = async (req, res, next) => {
    const form = formidable({
        multiples: true
    });
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err);
            return res.status(409).json({
                message: "error uploading!"
            })
        };
        const ext = path.extname(files.image.name).toLowerCase();
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            return res.status(400).json({
                message: "Only .PNG, .JPG and .JPEG files are Allowed!"
            })
        }
        req.fields = fields;
        req.files = files;
        const name = path.basename(files.image.name, ext);
        req.filename = `${Date.now()}_${name.replace(/[^a-zA-Z0-9]/g,'_').replace(/_{2,}/g,'_')}${ext}`
        next();
    })
}
module.exports = formData;