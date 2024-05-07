// Aqui van los comandos que se ejecutan en el servidor cuando un cliente se conecta
/*
const {Socket} = require("socket.io");
var s = new Socket() // s es para testear como va un socket, no hace nada
*/
const fs = require("fs");
const { IOserver } = require("./http_server");
var socketsList = new Array();

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

// String a list of sockets
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

class SocketManager {
  constructor() {
    this.sockets = new Array();
    this.lists = new Object();
  }

  addSocket(socket){
    this.sockets.push(socket);
  }

  removeSocket(socket){
    for (const key in this.lists) {
      if (Object.hasOwnProperty.call(this.lists, key)) {
        try {
          this.lists[key].pop(socket)
        } catch (error) {continue}
      }
    }
    this.sockets.pop(socket);
  }

  broadcast(socket, msj){
    this.sockets.forEach(sock => {
      if (sock != socket) {
        sock.send(msj);
      }
    });
  }

  join(socket, key){
    try {
      this.lists[key].push(socket);
      IOlog(socket.id, "join", key);
    } catch (error) {
      console.error(`SocketManager.join(${socket.id},${key}):`, error.message);
      process.exit(1);
    }
  }

  exit(socket, key){
    try {
      this.lists[key].pop(socket);
      IOlog(socket.id, "exit", key);
    } catch (error) {
      console.error(`SocketManager.exit(${socket.id},${key}):`, error.message);
      process.exit(1);
    }
  }

  list(socket, key){
    if (key == "") {
      socket.send(stringfySocket(this.sockets));
      IOlog(socket.id, "list", key);
      return;
    }
    try {
      socket.send(stringfySocket(this.lists[key]));
      IOlog(socket.id, "list", key);
    } catch (error) {
      console.error(`SocketManager.list(${socket.id},${key}):`, error.message);
      process.exit(1);
    }
  }

  send(socket, key, msj){
    try {
      this.lists[key].forEach(sock => {
        sock.send(msj);
      });
      IOlog(socket.id, key, msj);
    } catch (error) {
      console.error(`SocketManager.send(${socket.id},${key},${msj}):`, error.message);
      process.exit(1);
    }
  }
}

/*
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
*/
// Broadcast sistem #######################################################

const goBroadcast = (socket, msj) => {
  socketsList.forEach(sock => {
    if (sock != socket) {
      sock.send(msj);
    }
  });
}

// SocketManager
const ioServer = new SocketManager();

// Exports ################################################################
exports.connect = (socket) => {
  // socketsList.push(socket);
  ioServer.addSocket(socket);
} // /socket.io/socket.io.js

exports.disconnect = (socket) => {
  /*
  socketsList.pop(socket);
  try {
    log_sockets.pop(socket);
  } catch {}
  */
  ioServer.removeSocket(socket);
}

exports.events = {
  "message": (socket, msj) => {
    // goBroadcast(socket, msj);
    ioServer.broadcast(socket, msj);
  },/*
  "rasplog": (socket, msj) => {
    log_sockets.push(socket);
  },
  "hub": (socket, msj) => {
    socketsHUB.push(socket);
  },
  "ajustes": (socket, msj) => {
    goHub(socket, msj);
  },*/
  "list": (socket, msj) => {
    /*
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
    }*/
    ioServer.list(socket, msj);
  },
  "join": (socket, msj) => {
    ioServer.join(socket, msj);
  },
  "exit": (socket, msj) => {
    ioServer.exit(socket, msj);
  },
  "send": (socket, msj) => {
    let data = String(msj).split("=");
    let key = data[0];
    data.pop(key);
    let message = data.join("=")
    ioServer.send(socket, key, message);
  }
}