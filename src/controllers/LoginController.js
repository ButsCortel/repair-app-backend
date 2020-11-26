const User = require("../models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
    async login(req, res) {
        try {
            const {
                email,
                password
            } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    message: "Required field/s missing!"
                })
            }
            const user = await User.findOne({
                email
            }).select("+password");
            if (!user) {
                return res.status(401).json({
                    message: "Email or Password does not match!"
                })
            } else if (user && (await bcrypt.compare(password, user.password))) {
                const userResponse = {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                };
                const token = jwt.sign(userResponse, process.env.SECRET);
                return res.header("auth-token", token).sendStatus(200);
            } else {
                return res.status(401).json({
                    message: "Email or Password does not match!"
                })
            }

        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Error while trying to log in! " + error
            })
        }

    }
}