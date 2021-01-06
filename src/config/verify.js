const jwt = require("jsonwebtoken");

const verify = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token)
    return res.status(401).json({
      message: "Unauthorized!",
    });
  try {
    const verified = jwt.verify(token, process.env.SECRET);

    if (!verified)
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
