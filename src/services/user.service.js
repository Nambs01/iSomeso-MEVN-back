const User = require("../models/user");

class UserService {
    static async findOne(filter) {
        return await User.findOne({ ...filter }).exec();
    }

    static async findUserById(id) {
        return await User.findById(id).exec();
    }

    static async create(payload) {
        const user = new User(payload);
        return await user.save();
    }

    static async update(filter, data) {
        return await User.findOneAndUpdate({ ...filter }, { ...data }, { new: true }).exec();
    }

    static async getAllUsersConnected() {
        return (
            await User.find({
                socketId: { $exists: true, $ne: "" },
            })
                .select("_id")
                .exec()
        ).map((u) => u._id.toString());
    }

    static async findByCredentials(email, password) {
        return await User.findByCredentials(email, password);
    }
}

module.exports = { UserService };
