const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports = {
  async createUser(req, res) {
    try {
      const { firstName, lastName, password, email, type } = req.body;
      const duplicateUser = await User.findOne({
        email,
      });
      if (!duplicateUser) {
        if (email === process.env.EMAIL && password === process.env.PASSWORD) {
          const hashedPass = await bcrypt.hash(password, 10);
          const newUser = await User.create({
            firstName,
            lastName,
            password: hashedPass,
            email,
            type: "ADMIN",
          });
          return res.json(newUser);
        }

        const hashedPass = await bcrypt.hash(password, 10);

        const newUser = await User.create({
          firstName,
          lastName,
          password: hashedPass,
          email,
          type,
        });
        return res.json(newUser);
      }
      return res.status(409).json({
        message: "Email already exists! Login instead?",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error while creating user " + error,
      });
    }
  },
};
