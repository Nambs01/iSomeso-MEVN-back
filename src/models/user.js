const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ERROR_MESSAGES = {
    EMAIL_PASSWORD_REQUIRED: "EMAIL_PASSWORD_REQUIRED",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    UNABLE_PASSWORD: "UNABLE_PASSWORD",
};

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        bio: {
            type: String,
            required: false,
            trim: true,
            maxlength: 150,
        },
        phone: {
            type: String,
            required: false,
            trim: true,
            length: 10,
        },
        refreshToken: [String],
        avatar: {
            type: String,
        },
        socketId: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Filtrer les reponses
userSchema.methods.toJSON = function () {
    const user = this;

    const userObject = user.toObject();
    userObject.id = userObject._id;

    delete userObject._id;
    delete userObject.__v;
    delete userObject.password;
    delete userObject.refreshToken;
    delete userObject.socketId;

    return userObject;
};

// Verifier le mot de passe
userSchema.statics.findByCredentials = async function (email, password) {
    if (!email || !password) throw { status: 400, message: ERROR_MESSAGES.EMAIL_PASSWORD_REQUIRED };
    const user = await User.findOne({ email });

    if (!user) {
        throw { status: 401, message: ERROR_MESSAGES.USER_NOT_FOUND };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw { status: 401, message: ERROR_MESSAGES.UNABLE_PASSWORD };
    }
    return user;
};

// Hasher le mot de passe
userSchema.pre("save", async function (next) {
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next();
});

const User = mongoose.model("user", userSchema);

module.exports = User;
