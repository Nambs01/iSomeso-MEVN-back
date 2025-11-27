const { MessageService } = require("../services/message.service");
const { UserService } = require("../services/user.service");
// Dernier message par chaque utilisateur

const getLastMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const lastMessage = await MessageService.getLastConversation(userId);

    res.send(lastMessage);
  } catch (error) {
    res.status(500).send({ error: error });
  }
};

// Discussion avec un utilisateur (tous les messages)

const getMessages = async (req, res) => {
  try {
    const data = await MessageService.getMessages(
      req.user._id,
      req.params.id,
      req.body.page
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: error });
  }
};

const sendMessage = async (req, res) => {
  try {
    const io = req.app.get("io");
    const message = await MessageService.sendMessage(req.user._id, req.body);
    const userReceived = await UserService.findUserById(req.body.to);
    if (userReceived?.socketId) {
      io.to(userReceived.socketId).emit("handleNewMessage", message);
    }
    res.status(201).send(message);
  } catch (error) {
    res.status(400).send({ error: error });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await MessageService.deleteMessage(req.params.id);
    res.send();
  } catch (error) {
    res.status(500).send({ error: error });
  }
};

module.exports = {
  getLastMessages,
  getMessages,
  sendMessage,
  deleteMessage,
};
