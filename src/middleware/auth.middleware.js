const { UserService } = require("../services/user.service");
const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    try {
        const accessToken = req.header("Authorization").split(" ")[1];
        const decoded = jwt.verify(accessToken, process.env.TOKEN_SECRET_KEY);
        const user = await UserService.findUserById(decoded._id);

        if (!user) {
            throw "Unable token!";
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(403).send({ error: "Please authenticate!" });
    }
};

module.exports = auth;
