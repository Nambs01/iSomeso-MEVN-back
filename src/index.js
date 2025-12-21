require("dotenv").config();
require("./db/connectDB");

const http = require("http");
const createHttpServer = require("./httpServer");
const createWsServer = require("./wsServer");

// Créer le serveur Express
const app = createHttpServer();

// Attacher Express au serveur HTTP
const httpServer = http.createServer(app);

// Attacher Socket.IO au même serveur
const io = createWsServer(httpServer);
app.set("io", io);

// Lancer le serveur
const PORT = 3000;
const HOST = process.env.HOST || "127.0.0.1";

httpServer.listen(process.env.PORT || PORT, HOST, () => {
    console.log(`Serveur REST + WebSocket sur ${HOST}:${PORT}`);
});
