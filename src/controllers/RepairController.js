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
      return res.status(400).json("Missing required information!");
    }
  },
  async updateStatus(req, res) {
    const { prevStatus, status, note, user } = req.body;
    const { repairId } = req.params;
    if (status === prevStatus) {
      return res.status(400).json("Cannot update with same status!");
    }
    try {
      switch (status) {
        case "RECEIVED":
          if (prevStatus !== "INCOMING") throw "Cannot update to RECEIVED";
          break;
        case "ONGOING":
          if (prevStatus !== "RECEIVED" && prevStatus !== "ON HOLD")
            throw "Cannot update to ONGOING";
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
        default:
          if (prevStatus === "OUTGOING" || prevStatus === "COMPLETED")
            throw `Cannot cancel ${prevStatus} request`;

          break;
      }
    } catch (error) {
      return res.status(400).json(error);
    }

    try {
      //CHECK IF TECH/ADMIN
      if (req.user.type !== "ADMIN" && status === "CANCELLED") {
        Repair.findById(repairId, (err, doc) => {
          if (err || !doc)
            return res.status(400).json("Request does not exist!");
          if (doc.customer._id.toString() !== req.user._id.toString()) {
            return res
              .status(401)
              .json("Only requestors can cancel their request!");
          }
        });
      }
      //CHECK IF TECH IS OCCUPIED
      if (status === "ONGOING") {
        if (user.occupied) return res.status(400).json("Already occupied!");
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
            return res.status(400).json("error updating status!");
          }
          if (!userDoc) {
            return res.status(400).json("User does not exist!");
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
                return res.status(400).json("error updating status!");
              }
              if (!userDoc) {
                return res.status(400).json("Request does not exist!");
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
      return res.status(500).json("Server error!");
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
      return res.status(400).json("There are no available requests yet.");
    } catch (error) {
      console.log(error);
      return res.status(400).json("There are no available requests yet.");
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
