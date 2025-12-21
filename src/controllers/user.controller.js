const User = require("../models/user");
const sharp = require("sharp");
const { promises, readFile } = require("fs");
const { UserService } = require("../services/user.service");

const getUserInfo = async (req, res) => {
    try {
        const { user } = req;
        res.status(200).send({ user });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await UserService.findUserById(req.params.id);
        res.status(200).send(user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.user._id.toString() },
        }).exec();
        res.status(200).send({ users: users });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const dataKeys = Object.keys(req.body);
        const allowedUpdates = ["name", "email", "password", "bio", "phone"];
        const isValidOperation = dataKeys.every((key) => allowedUpdates.includes(key));

        if (!isValidOperation) {
            throw "Invalid updates!";
        }

        const user = await UserService.update({ _id: req.user._id }, req.body);
        res.send({ user });
    } catch (error) {
        console.log(error);
        return res.status(400).send({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        await User.deleteOne(req.user);
        res.send({ user: req.user });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};

const updateUserAvatar = async (req, res) => {
    try {
        // Mettre a jour l'avatar de l'utilisateur
        req.user.avatar = req.user.avatarDirName + req.user.avatarFileName;
        await req.user.save();
        res.send({ url: req.user.avatar });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const deleteUserAvatar = async (req, res) => {
    try {
        await promises.rm(req.user.avatar, { recursive: true });
        req.user.avatar = undefined;
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

const getUserAvatar = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
        return res.send({ error: "Not have avatar!" });
    }

    const extension = user.avatar.split(".")[1];

    readFile(user.avatar, async (error, data) => {
        if (error) return res.status(400).send({ error: error.message });

        const avatarFormat = await sharp(data).resize({ width: 128, height: 128 }).toBuffer();
        res.send({
            avatar: {
                base64: avatarFormat.toString("base64"),
                type: extension,
            },
        });
    });
};

module.exports = {
    getUser,
    getUserInfo,
    getAllUsers,
    updateUser,
    deleteUser,
    updateUserAvatar,
    deleteUserAvatar,
    getUserAvatar,
};
