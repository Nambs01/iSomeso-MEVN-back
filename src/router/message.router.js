const express = require("express");
const AuthMiddleware = require("../middleware/auth.middleware");
const MessageController = require("../controllers/message.controller");
const router = express.Router();

router.get(
  "/last-conversation",
  AuthMiddleware,
  MessageController.getLastMessages
);

router.post("/get-messages/:id", AuthMiddleware, MessageController.getMessages);

router.post("/new-message", AuthMiddleware, MessageController.sendMessage);

router.delete("/messages/:id", AuthMiddleware, MessageController.deleteMessage);

module.exports = router;
