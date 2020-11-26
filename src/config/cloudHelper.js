const {
    Storage
} = require("@google-cloud/storage");




module.exports = {
    async upload(req, res) {
        if (!req.file) return res.status(400).json({
            message: "Missing Image!"
        });
        try {
            const storage = new Storage({
                projectId: process.env.PROJECT_ID,
                credentials: {
                    client_email: process.env.CLIENT_EMAIL,
                    private_key: process.env.PRIVATE_KEY.split("\\n").join("\n"),
                }
            });

            const bucket = storage.bucket(process.env.BUCKET_NAME);
            const file = bucket.file(req.filename);

            const stream = file.createWriteStream()
            stream.on("finish", () => {
                return res.status(200).json({
                    repair: req.repair,
                    message: "Upload successful"
                })

            })
            stream.end(req.file.buffer);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    },
    async deleteImage(req, res) {
        try {
            const storage = new Storage({
                projectId: process.env.PROJECT_ID,
                credentials: {
                    client_email: process.env.CLIENT_EMAIL,
                    private_key: process.env.PRIVATE_KEY.split("\\n").join("\n"),
                }
            });
            const bucket = storage.bucket(process.env.BUCKET_NAME);
            const file = bucket.file(req.filename);
            const deleted = await file.delete();
            console.log(deleted);
            res.sendStatus(200);
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    }
}