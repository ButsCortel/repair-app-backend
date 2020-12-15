const Repair = require("../models/Repairs");
const History = require("../models/History");
const Users = require("../models/Users");

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
    const { status, note, user } = req.body;
    const { repairId } = req.params;
    try {
      //CHECK IF TECH/ADMIN
      if (status === "CANCELLED") {
        if (req.user.type !== "USER" && req.user.type !== "ADMIN")
          return res
            .json({ message: "Only requestors can cancel their request!" })
            .status(401);
        Repair.findById(repairId, (err, doc) => {
          if (err || !doc)
            return res.json({ message: "Request does not exist!" }).status(400);
          if (doc.customer._id !== req.user._id)
            return res
              .json({ message: "Only requestors can cancel their request!" })
              .status(401);
        });
      }
      //CHECK IF TECH IS OCCUPIED
      if (status === "ONGOING") {
        if (user.occupied)
          return res.status(400).json({ message: "Already occupied!" });
      }
      const updatedUser = await Users.findByIdAndUpdate(
        req.user._id,
        {
          occupied: status === "ONGOING" ? true : false,
          repair: status === "ONGOING" ? repairId : null,
        },
        { returnOriginal: false },
        (err, userDoc) => {
          if (err) {
            console.log(err);
            return res.status(400).json({ message: "error updating status!" });
          }
          if (!userDoc) {
            return res.status(400).json({ message: "User does not exist!" });
          }
          Repair.findByIdAndUpdate(
            repairId,
            {
              status,
              user: req.user._id,
              lastUpdate: Date.now(),
            },
            (err, repairDoc) => {
              if (err) {
                console.log(err);
                return res
                  .status(400)
                  .json({ message: "error updating status!" });
              }
              if (!userDoc) {
                return res
                  .status(400)
                  .json({ message: "Request does not exist!" });
              }
              History.create({
                date: Date.now(),
                user: req.user._id,
                repair: repairId,
                device: repairDoc.device,
                note,
                status,
              });
            }
          );
        }
      );
      updatedUser
        .populate("repair")
        .execPopulate()
        .then((data) => res.json({ user: data }));
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
      Repair.findByIdAndDelete(repId, (err, doc) => {
        if (err)
          return res.status(400).json({
            message: "Request does not exist!",
          });
        req.filename = doc.image;
        next();
      });
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
      const result = await History.find({ repair: repairId });
      if (!repair)
        return res.status(400).json({
          message: "Request does not Exist!",
        });
      let history = null;
      if (result.length) {
        const promises = result.map(
          async (history) =>
            await history.populate("user").populate("customer").execPopulate()
        );
        history = await Promise.all(promises);
      }
      await repair.populate("user").populate("customer").execPopulate();
      return res.json({ repair, history });
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
      const results = await History.find({ user: req.user._id });
      if (results.length) {
        const promises = results.map(
          async (result) =>
            await result.populate("user").populate("repair").execPopulate()
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
