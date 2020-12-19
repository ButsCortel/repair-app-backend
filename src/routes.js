const express = require("express");
const Multer = require("multer");

const repairController = require("./controllers/RepairController");
const userController = require("./controllers/UserController");
const loginController = require("./controllers/LoginController");

//Config
const verify = require("./config/verify");
const cloudHelper = require("./config/cloudHelper");
const formidable = require("./config/formHelper");

const routes = express.Router();

routes.get("/status", (req, res) => {
  res.send({
    status: 200,
  });
});

// Request Repair
routes.post(
  "/requests/create",
  verify,
  formidable,
  repairController.createRepair,
  cloudHelper.upload
);
// Delete Repair
routes.delete(
  "/requests/delete/:repId?",
  verify,
  repairController.deleteRepair,
  cloudHelper.deleteImage
);
// Get all Repairs
routes.get("/requests/all/:status?", verify, repairController.getRepairs);
// Get Repair by Id
routes.get("/requests/:repairId?", verify, repairController.getRepairById);
// Update Status
routes.put("/requests/:repairId?", verify, repairController.updateStatus);
// get repairs
routes.get("/user/requests", verify, repairController.getRepairByUser);
routes.get("/tech/requests", verify, repairController.getRepairByTech);
routes.get("/tech/ongoing", verify, repairController.getOngoing);
// Create user
routes.post("/user/create", userController.createUser);
// log in
routes.post("/user/login", loginController.login);

module.exports = routes;
