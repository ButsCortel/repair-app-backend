const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const verify = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token)
    return res.status(401).json({
      message: "Unauthorized!",
    });
  try {
    const verified = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(verified.user._id);
    if (!user)
      return res.status(401).json({
        message: "Unauthorized!",
      });
    req.user = verified.user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Unauthorized!",
    });
  }
};
module.exports = verify;
