// Aqui van los comandos que se ejecutan en el servidor cuando un cliente se conecta
/*
const {Socket} = require("socket.io");
var s = new Socket() // s es para testear como va un socket, no hace nada
*/
const fs = require("fs");

// Log
const IOlog = (id, event, data) => {
  try {
      fs.appendFileSync("./logs/IO_server.csv", [
          id, 
          event,
          String(data)
      ].join(";") + "\n");
  } catch (error) {
      console.error("IOlog():", error.message);
      process.exit(1);
  }
}

// RaspLog sistem #########################################################
var log_sockets = new Array();
setInterval(() => {
  var log = "rasp not available";
  if (log_sockets.length != 0) {
    IOlog("server", "log", log.join(";"));
  }
  log_sockets.forEach((socket) => {
    socket.emit("log",log.join(";"));
  });
}, 3000);

// Broadcast sistem #######################################################
var socketsList = new Array();
const goBroadcast = (socket, msj) => {
  socketsList.forEach(sock => {
    if (sock != socket) {
      sock.send(msj);
    }
  });
}

const stringfySocket = (list) => {
  try {
      var aux = []
      list.forEach(socket => {
          aux.push(socket.id)
      });
      return `[${aux.join(", ")}]`
  } catch (error) {
      console.error("stringfySocket():", error.message);
      process.exit(1);
  }
}

// HUB sistem #######################################################
var socketsHUB = new Array();
const goHub = (socket, msj) => {
  socketsList.forEach(sock => {
    if (sock != socket) {
      socket.send("enviado a:", sock.id);
      sock.emit("hub", msj);
    }
  });
}

// Exports ################################################################
exports.connect = (socket) => {
  socketsList.push(socket);
} // /socket.io/socket.io.js

exports.disconnect = (socket) => {
  socketsList.pop(socket);
  try {
    log_sockets.pop(socket);
  } catch {}
}

exports.events = {
  "message": (socket, msj) => {
    goBroadcast(socket, msj);
  },
  "rasplog": (socket, msj) => {
    log_sockets.push(socket);
  },
  "hub": (socket, msj) => {
    socketsHUB.push(socket);
  },
  "ajustes": (socket, msj) => {
    goHub(socket, msj);
  },
  "list": (socket, msj) => {
    switch (msj) {
      case "":
        socket.send(stringfySocket(socketsList));
        break;
      case "log":
        socket.send(stringfySocket(log_sockets));
        break;
      case "hub":
        socket.send(stringfySocket(socketsHUB));
        break;
      default:
        socket.send(stringfySocket(socketsList));
        break;
    }
  },
  "loglist": (socket, msj) => {
    socket.send(stringfySocket(log_sockets));
  },
}