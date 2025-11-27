const { Server } = require("socket.io");
const { AuthService } = require("./services/auth.service");
const { MessageService } = require("./services/message.service");

function createWsServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Nouvelle connexion :", socket.id);

    socket.on("userConnected", (id) =>
      AuthService.handleUserConnected({ io, socket, id })
    );

    socket.on("handleShowMessage", (payload) =>
      MessageService.handleShowMessage({ io, payload })
    );

    socket.on("disconnect", () => {
      AuthService.handleDeconnection({ io, socket });
      // onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
      // io.emit("getOnlineUsers", onlineUsers);
      // console.log("User deconnected");
    });

    // socket.on("message", (msg) => chatService.handleMessage(io, socket, msg));
    // socket.on("joinRoom", (room) =>
    //   chatService.handleJoinRoom(io, socket, room)
    // );
    // socket.on("disconnect", () => chatService.handleDisconnect(socket));
  });

  // let onlineUsers = Array();

  // io.on("connect", (socket, id) => {
  //   console.log("New connection", socket.id);
  //   console.log(socket.);
  //   socket.on("LAST_CONVERSATION_LIST_RES", () => {
  //     console.log("TONGA");
  //     socket.emit("LAST_CONVERSATION_LIST_RES");
  //   });

  //   // listen to a connection
  //   socket.on("addNewUser", (userId) => {
  //     !onlineUsers.some((user) => user.userId === userId) &&
  //       onlineUsers.push({
  //         userId,
  //         socketId: socket.id,
  //       });
  //     console.log(onlineUsers);

  //     io.emit("getOnlineUsers", onlineUsers);
  //   });

  //   // add Message
  //   socket.on("sendMessage", (message) => {
  //     const user = onlineUsers.find((user) => user.userId === message.to);

  //     if (user) {
  //       io.to(user.socketId).emit("getMessage", message);
  //     }
  //   });

  // });

  return io;
}

module.exports = createWsServer;
