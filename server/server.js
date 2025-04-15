// Servidor para XC25
// Conexiones
const http = require("http");
const { Server } = require("socket.io");

// Modulos
const io_server = require("./modules/io_server");
const ngsi = require('./modules/ngsi');
const app = require("./modules/app")

// Inicializar servidor y app
const PORT = 80;
const httpServer = http.createServer(app);
const io = new Server(httpServer);


// Sockets
io.on("connection", (socket) => {
  io_server.connect(socket);  // iniciar conexion
  socket.on("disconnect", () => io_server.disconnect(socket)); // desconectar
  socket.on("message", (msg) => {
    io_server.message(socket, msg); // procesado de mensaje
  });
});

// Servidor HTTP
httpServer.listen(PORT, () => {
  console.log("Servidor disponible la siguiente dirección:");
  console.log(`http://localhost:${PORT}/`);
  ngsi.start(); // Arrancar todos los procesos entre servidores
});

// Para cerrar el docker en 0.3s en vez de 10.3
process.on("SIGTERM", () => {
  io.close(() => {
    console.log("HANGING UP...");
  });
  httpServer.close(() => {
    console.log("CLOSING...");
  });
})