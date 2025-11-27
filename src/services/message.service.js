const Message = require("../models/message");
const { UserService } = require("./user.service");

class MessageService {
  static ROW_LIMIT = 30;
  // Dernier message par chaque utilisateur

  static async getLastConversation(userId) {
    const usersSet = new Set();

    // Trouver tous les utilisateurs avec qui l' utilisateur actuel a eu une conversation
    const fromUsers = await Message.distinct("from", { to: userId });
    const toUsers = await Message.distinct("to", { from: userId });

    fromUsers.forEach((user) => usersSet.add(user.toString()));
    toUsers.forEach((user) => usersSet.add(user.toString()));

    const users = Array.from(usersSet);

    // Recuperer les derniers messages pour chaque utilisateur
    const messages = await Promise.all(
      users.map(async (otherUserId) => {
        const [lastMessage] = await Message.find({
          $or: [
            { from: userId, to: otherUserId },
            { from: otherUserId, to: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1)
          .populate(["to", "from"])
          .exec();

        return lastMessage;
      })
    );
    messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return messages;
  }

  // Discussion avec un utilisateur (tous les messages)

  static async getMessages(userId, otherUserId, page = 1) {
    const { hasNextPage, docs: messages } = await Message.paginate(
      {
        $or: [
          { from: userId, to: otherUserId },
          { from: otherUserId, to: userId },
        ],
      },
      { page, limit: this.ROW_LIMIT, sort: { createdAt: -1 } }
    );

    // modifier tous les messages envoyer par l'autre utilisateur en vue
    // messages.forEach(async (message) => {
    //   if (!message.show && message.from == otherUserId) {
    //     message.show = true;
    //     await message.save();
    //   }
    // });
    return { hasNextPage, messages };
  }

  static async sendMessage(userId, data) {
    const message = new Message({
      ...data,
      from: userId,
    });

    await message.save();
    return message;
  }

  static async deleteMessage(id) {
    const message = await Message.findOneAndDelete({
      _id: id,
    });

    if (!message) {
      throw "Message invalide";
    }
  }

  static async handleShowMessage({ io, payload }) {
    try {
      await Message.updateMany(
        { from: payload.sender, to: payload.receiver, show: false },
        { show: true }
      );
      const user = await UserService.findUserById(payload.sender);
      if (user?.socketId) {
        io.to(user.socketId).emit("handleShowMessage", payload.receiver);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = { MessageService };
