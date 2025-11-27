const express = require("express");
const accessAPI = require("./config/accessAPI");

const userRouter = require("./router/user.router");
const messageRouter = require("./router/message.router");

function createHttpServer() {
    const app = express();

    app.use(express.json());
    app.use(accessAPI);
    app.use(userRouter);
    app.use(messageRouter);

    return app;
}

module.exports = createHttpServer;
