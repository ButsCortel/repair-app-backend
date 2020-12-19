const Repair = require("../models/Repair");
const History = require("../models/History");
const User = require("../models/User");

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
      }).exec();
      req.repair = repair;
      next();
    } catch (error) {
      console.log(error);
      return res.status(400).json("Missing required information!");
    }
  },
  async updateStatus(req, res) {
    const { prevStatus, status, note } = req.body;
    const { repairId } = req.params;
    const repair = await Repair.findById(repairId).exec();
    if (!repair) return res.status(404).json("Request does not exist!");
    if (status === prevStatus) {
      return res.status(400).json("Cannot update with same status!");
    }
    try {
      switch (status) {
        case prevStatus:
          return res.status(400).json("Cannot update with same status!");
        case "RECEIVED":
          if (prevStatus !== "INCOMING") throw "Cannot update to RECEIVED";
          break;
        case "ONGOING":
          if (prevStatus !== "RECEIVED" && prevStatus !== "ON HOLD")
            throw "Cannot update to ONGOING";
          const occupied = await Repair.findOne({
            status,
            user: req.user._id,
          }).exec();
          if (occupied) throw "Already have ongoing request!";
          break;
        case "ON HOLD":
          if (prevStatus !== "ONGOING") throw "Cannot update to ON HOLD";
          break;
        case "OUTGOING":
          if (
            prevStatus !== "ONGOING" &&
            prevStatus !== "ON HOLD" &&
            prevStatus !== "CANCELLED"
          )
            throw "Cannot update to OUTGOING";
          break;
        case "COMPLETED":
          if (prevStatus !== "OUTGOING") throw "Cannot update to COMPLETED";
          break;
        case "CANCELLED":
          if (repair.customer.toString() !== req.user._id.toString())
            throw "Cannot cancel other's request";
          break;
        default:
          if (prevStatus === "OUTGOING" || prevStatus === "COMPLETED")
            throw `Cannot cancel ${prevStatus} request`;
          break;
      }
      if (req.user.type === "USER" && status !== "CANCELLED") {
        throw "Only Technicians can update repairs";
      }
      repair.lastUpdate = Date.now();
      repair.user = req.user._id;
      repair.status = status;
      repair.save();
      await History.create({
        date: Date.now(),
        user: req.user._id,
        repair: repairId,
        device: repair.device,
        note,
        status,
      });
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  },
  async deleteRepair(req, res, next) {
    const { repId } = req.params;

    try {
      Repair.findByIdAndDelete(repId, (err, doc) => {
        if (err) return res.status(400).json("Request does not exist!");
        req.filename = doc.image;
        next();
      });
    } catch (err) {
      return res.status(400).json("Request does not exist!");
    }
  },
  async getRepairById(req, res) {
    const { repairId } = req.params;
    try {
      const repair = await Repair.findById(repairId);
      const result = await History.find({ repair: repairId });
      if (!repair) return res.status(400).json("Request does not Exist!");
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
      return res.status(400).json("Request does not Exist!");
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

        return res.json(repairs);
      }
      return res.status(400).json("There are no available requests yet.");
    } catch (error) {
      console.log(error);
      return res.status(400).json("There are no available requests yet.");
    }
  },
  async getOngoing(req, res) {
    try {
      const repair = await Repair.findOne({
        user: req.user._id,
        status: "ONGOING",
      });
      res.json(repair);
    } catch (error) {
      console.log(error);
      res.status(500).json("Error fetching Ongoing request!");
    }
  },
  async getRepairByTech(req, res) {
    try {
      const results = await History.find({ user: req.user._id });

      if (!results.length) {
        return res.status(404).json("There are no available requests yet.");
      }
      const promises = results.map(
        async (result) =>
          await result.populate("user").populate("repair").execPopulate()
      );
      const history = await Promise.all(promises);
      res.json(history);
    } catch (error) {
      console.log(error);
      return res.status(500).json("Error getting history!");
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

        return res.json(repairs);
      }
      return res.status(400).json("There are no available requests yet.");
    } catch (error) {
      console.log(error);
      return res.status(400).json("There are no available requests yet.");
    }
  },
};
