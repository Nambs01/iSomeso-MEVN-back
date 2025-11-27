const cors = require("cors");

const corsOption = {
    origin: "*",
    credentials: true,
};

module.exports = cors(corsOption);
