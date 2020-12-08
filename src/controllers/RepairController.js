const Repair = require("../models/Repairs");

module.exports = {
  async createRepair(req, res, next) {
    const { device, issue, expedite } = req.fields;
    const { _id } = req.user;
    try {
      const repair = await Repair.create({
        user: _id,
        customer: _id,
        device,
        issue,
        expedite: expedite === "Yes" ? true : false,
        image: req.filename,
        dateCreated: new Date(),
        lastUpdate: new Date(),
      });
      req.repair = repair;
      next();
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "Missing required information!",
      });
    }
  },
  async updateStatus(req, res) {
    const { status, note } = req.body;
    const { repairId } = req.params;
    try {
      Repair.findOneAndUpdate(
        {
          _id: repairId,
        },
        {
          $set: {
            status,
            note,
            lastUpdate: new Date(),
            user: req.user._id,
          },
        },
        {
          returnOriginal: false,
        },
        (err, doc) => {
          if (err) {
            console.log(err);
            return res.status(400).json({
              message: "Update error!",
            });
          } else if (!doc)
            return res.status(400).json({
              message: "Request does not exist!",
            });
          res.sendStatus(200);
        }
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Server error!",
      });
    }
  },
  async deleteRepair(req, res, next) {
    const { repId } = req.params;

    try {
      await Repair.findOneAndDelete(
        {
          _id: repId,
        },
        async (err, request) => {
          if (err || !request)
            return res.status(400).json({
              message: "Request does not exist!",
            });
          req.filename = request.image;
          next();
        }
      );

      // next();
    } catch (err) {
      return res.status(400).json({
        message: "Request does not exist!",
      });
    }
  },
  async getRepairById(req, res) {
    const { repairId } = req.params;
    try {
      const repair = await Repair.findById(repairId);
      if (!repair)
        return res.status(400).json({
          message: "Request does not Exist!",
        });
      await repair.populate("user").populate("customer").execPopulate();
      return res.json(repair);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "Request does not Exist!",
      });
    }
  },
  async getRepairByUser(req, res) {
    try {
      const result = await Repair.find({ customer: req.user._id });
      if (result.length) {
        const promises = result.map(
          async (repair) =>
            await repair.populate("user").populate("customer").execPopulate()
        );
        const repairs = await Promise.all(promises);

        return res.json({
          repairs,
        });
      }
      return res.status(400).json({
        message: "There are no available requests yet.",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "There are no available requests yet.",
      });
    }
  },
  async getRepairByTech(req, res) {
    try {
      const result = await Repair.find({ user: req.user._id });
      if (result.length) {
        const promises = result.map(
          async (repair) =>
            await repair.populate("user").populate("customer").execPopulate()
        );
        const repairs = await Promise.all(promises);

        return res.json({
          repairs,
        });
      }
      return res.status(400).json({
        message: "There are no available requests yet.",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "There are no available requests yet.",
      });
    }
  },
  async getRepairs(req, res) {
    const { status } = req.params;
    const query =
      status === undefined
        ? {}
        : {
            status,
          };
    try {
      const result = await Repair.find(query);
      if (result.length) {
        const promises = result.map(
          async (repair) =>
            await repair.populate("user").populate("customer").execPopulate()
        );
        const repairs = await Promise.all(promises);

        return res.json({
          repairs,
        });
      }
      return res.status(400).json({
        message: "There are no available requests yet.",
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "There are no available requests yet.",
      });
    }
  },
};
