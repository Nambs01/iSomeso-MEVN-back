const jwt = require("jsonwebtoken");
const { UserService } = require("./user.service");

class AuthService {
    static async handleLogin(req, res) {
        try {
            const refreshToken = req.body.refresh_token;
            const foundUser = await UserService.findByCredentials(
                req.body.email,
                req.body.password
            );
            const { _id, email } = foundUser;
            const accessToken = this.generateAccessToken({ _id, email });

            const newRefreshToken = this.generateRefreshToken(email);
            const newRefreshTokenArray = !refreshToken
                ? foundUser.refreshToken
                : foundUser.refreshToken.filter((rt) => rt !== refreshToken);

            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            await foundUser.save();

            return res.status(200).send({ accessToken, refreshToken: newRefreshToken });
        } catch (error) {
            return res.status(400).send({ message: error.message ?? "INTERNAL_SERVER_ERROR" });
        }
    }

    static async handleLogout(req, res) {
        try {
            const refreshToken = req.body.refreshToken;
            if (!refreshToken) return res.sendStatus(204);

            const foundUser = await UserService.findOne({ refreshToken });
            if (foundUser) {
                foundUser.refreshToken = foundUser.refreshToken.filter((rt) => rt !== refreshToken);
                await foundUser.save();
            }
            return res.sendStatus(204);
        } catch (error) {
            return res.status(500).send({ message: "INTERNAL_SERVER_ERROR" });
        }
    }

    static async handleLogoutAll(req, res) {
        try {
            const user = req.user;
            await UserService.update({ _id: user._id }, { refreshToken: [] });
            return res.sendStatus(204);
        } catch (error) {
            return res.status(500).send({ message: "INTERNAL_SERVER_ERROR" });
        }
    }

    static async handleRefreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) throw { status: 401, message: "No refresh token available!" };

            const foundUser = await UserService.findOne({ refreshToken });

            if (!foundUser) {
                jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET_KEY,
                    async (err, decoded) => {
                        if (!err) await UserService.update({ ...decoded }, { refreshToken: [] });
                    }
                );
                throw { status: 403, message: "Forbidden!" };
            }

            const newRefreshTokenArray = foundUser.refreshToken.filter((rt) => rt !== refreshToken);

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY, async (err, decoded) => {
                if (err) {
                    foundUser.refreshToken = [...newRefreshTokenArray];
                    await foundUser.save();
                }
                if (decoded && foundUser.email != decoded.email)
                    throw { status: 403, message: "Forbidden!" };

                const { _id, email } = foundUser;
                const accessToken = this.generateAccessToken({ _id, email });
                const newRefreshToken = this.generateRefreshToken(email);
                foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
                await foundUser.save();

                return res.status(200).send({ accessToken, refreshToken: newRefreshToken });
            });
        } catch (error) {
            console.log(error);

            return res.status(error.status ?? 400).send({
                message: error.message ?? "INTERNAL_SERVER_ERROR",
            });
        }
    }

    static async handleRegister(payload) {
        try {
            const existingUser = await UserService.findOne({ email: payload.email });
            if (existingUser) throw { status: 400, message: "User already exists!" };

            const user = await UserService.create(payload);
            const accessToken = this.generateAccessToken({ _id: user._id, email: user.email });
            const newRefreshToken = this.generateRefreshToken(user.email);
            user.refreshToken = [newRefreshToken];
            await user.save();

            return res.status(201).send({ accessToken, refreshToken: newRefreshToken });
        } catch (error) {
            return res.status(error.status ?? 400).send({
                message: error.message ?? "INTERNAL_SERVER_ERROR",
            });
        }
    }

    static async handleUserConnected({ io, socket, id }) {
        await UserService.update({ _id: id }, { socketId: socket.id });
        const usersConnected = await UserService.getAllUsersConnected();
        io.emit("userConnected", usersConnected);
        socket.emit("userConnected", usersConnected);
    }

    static async handleDeconnection({ io, socket }) {
        await UserService.update({ socketId: socket.id }, { socketId: "" });
        const usersConnected = await UserService.getAllUsersConnected();
        io.emit("userConnected", usersConnected);

        console.log("User Deconnected : ", socket.id);
    }

    static generateAccessToken(payload) {
        return jwt.sign(payload, process.env.TOKEN_SECRET_KEY, { expiresIn: "15m" });
    }

    static generateRefreshToken(email) {
        return jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET_KEY, { expiresIn: "7days" });
    }
}

module.exports = { AuthService };
