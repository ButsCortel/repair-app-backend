const Repair = require("../models/Repairs");


module.exports = {
    async createRepair(req, res, next) {
        console.log(req);
        const {
            customer,
            device,
            issue,
            status,
            price
        } = req.body;
        const {
            _id
        } = req.user;
        try {
            const repair = await Repair.create({
                user: _id,
                customer,
                device,
                issue,
                status,
                price,
                image: req.filename
            })
            req.repair = repair;
            next();
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Missing required information!"
            });
        }
    },
    async updateStatus(req, res) {
        const {
            status
        } = req.body
        const {
            repairId
        } = req.params;
        try {
            Repair.findOneAndUpdate({
                _id: repairId
            }, {
                $set: {
                    status
                }
            }, {
                returnOriginal: false
            }, (err, doc) => {
                if (err) {
                    console.log(err)
                    return res.status(400).json({
                        message: "Update error!"
                    })
                } else if (!doc) return res.status(400).json({
                    message: "Request does not exist!"
                })
                res.json(doc)
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Server error!"
            })
        }
    },
    async deleteRepair(req, res, next) {
        const {
            repId
        } = req.params

        try {
            await Repair.findOneAndDelete({
                _id: repId
            }, async (err, request) => {
                console.log(request)
                if (err || !request) return res.status(400).json({
                    message: "Request does not exist!"
                })
                req.filename = request.image;
                next();

            })

            // next();
        } catch (err) {
            return res.status(400).json({
                message: "Request does not exist!"
            })
        }

    },
    async getRepairById(req, res) {
        const {
            repairId
        } = req.params;
        try {
            const repair = await Repair.findById(repairId);
            if (!repair) return res.status(400).json({
                message: "Request does not Exist!"
            })
            await repair.populate("user").execPopulate();
            return res.json(repair);

        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "Request does not Exist!"
            })
        }

    },
    async getRepairs(req, res) {
        const {
            status
        } = req.params;
        const query = status === undefined ? {} : {
            status
        };
        try {
            const result = await Repair.find(query);
            if (result.length) {
                const promises = result.map(
                    async (repair) =>
                        await repair.populate("user").execPopulate()
                );
                const repairs = await Promise.all(promises);

                return res.json({
                    repairs
                })
            }
            return res.status(400).json({
                message: "There are no available requests yet."
            })
        } catch (error) {
            console.log(error)
            return res.status(400).json({
                message: "There are no available requests yet."
            })
        }
    }
}