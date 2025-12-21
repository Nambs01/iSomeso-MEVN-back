const multer = require("multer");
const path = require("path");
const { promises, existsSync } = require("fs");

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const dirPath = path.join("./uploads/images", "user/" + req.user._id);

        if (existsSync(dirPath)) await promises.rm(dirPath, { recursive: true });
        await promises.mkdir(dirPath, { recursive: true });
        req.user.avatarDirName = `images/user/${req.user._id}/`;
        cb(null, dirPath);
    },
    filename: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|svg|jpeg|tiff|gif|webp)$/))
            return cb(new Error("Format fichier invalide!"));

        const extension = path.extname(file.originalname);
        req.user.avatarFileName = Date.now() + extension;
        cb(null, req.user.avatarFileName);
    },
});
const upload = multer({ storage: storage });

module.exports = upload.single("avatar");
