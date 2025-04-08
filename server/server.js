// Servidor para XC25
// Conexiones
const http = require("http");
const { Server } = require("socket.io");

// Modulos
const dir = require('./modules/dir');
const socket_events = require("./modules/socket_events");
const { http_logger } = require('./modules/log');
const ngsi = require('./modules/ngsi');
const app = require("./modules/app")

// Inicializar servidor y app
const PORT = 80;
const httpServer = http.createServer(app);
const io = new Server(httpServer);


// Sockets
io.on("connection", (socket) => {
  socket_events.connect(socket);
  console.log("Conexion desde:", socket.conn.id);

  socket.on("disconnect", () => socket_events.disconnect(socket));

  socket.on("message", (msj) => {
    console.log(`Mensaje ${msj} de ${socket.conn.id}`)
    socket_events.events["message"](socket, msj);
  });
});

// Servidor HTTP
httpServer.listen(PORT, () => {
  console.log("Servidor disponible la siguiente dirección:");
  console.log(`http://localhost:${PORT}/`);
  ngsi.subscribe();
});
