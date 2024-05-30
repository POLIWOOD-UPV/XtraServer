// Aqui van los comandos que se ejecutan en el servidor cuando un cliente se conecta
/*
const {Socket} = require("socket.io");
var s = new Socket() // s es para testear como va un socket, no hace nada
*/
const fs = require("fs");
const { IOserver } = require("./http_server");
var socketsList = new Array();

// Log
const IOlog = (id, event, ...data) => {
  try {
      data.forEach((val, ind) => {data[ind] = String(val)});
      fs.appendFileSync("./logs/IO_server.csv", [
          id, 
          event,
          ... data
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
    this.events = {
      "message": (socket, msj) => {
        this.broadcast(socket, msj);
      },
      "list": (socket, msj) => {
        this.list(socket, msj);
      },
      "join": (socket, msj) => {
        this.join(socket, msj);
      },
      "exit": (socket, msj) => {
        this.exit(socket, msj);
      },
      "send": (socket, key, msj) => {
        this.send(socket, key, msj);
      },
      "all": (socket, key, msj) => {
        this.all(socket, key, msj);
      }
    }
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
      if (Object.hasOwnProperty.call(this.lists, key)) {
        this.lists[key].push(socket);
      } else {
        this.lists[key] = [socket];
      }
    } catch (error) {
      console.error(`SocketManager.join(${socket.id},${key}):`, error.message);
      process.exit(1);
    }
  }

  exit(socket, key){
    try {
      if (Object.hasOwnProperty.call(this.lists, key)) {
        this.lists[key].pop(socket);
      }
    } catch (error) {
      console.error(`SocketManager.exit(${socket.id},${key}):`, error.message);
      process.exit(1);
    }
  }

  list(socket, key){
    if (key == "") {
      socket.send(stringfySocket(this.sockets));
      return;
    }
    try {
      if (Object.hasOwnProperty.call(this.lists, key)) {
        socket.send(stringfySocket(this.lists[key]));
      }
    } catch (error) {
      console.error(`SocketManager.list(${socket.id},${key}):`, error.message);
      process.exit(1);
    }
  }

  send(socket, key, msj){
    try {
      if (Object.hasOwnProperty.call(this.lists, key)) {
        this.lists[key].forEach(sock => {
          if (sock != socket) {
            sock.emit(key ,msj);
          }
        });
      }
    } catch (error) {
      console.error(`SocketManager.send(${socket.id},${key},${msj}):`, error.message);
      process.exit(1);
    }
  }

  all(socket, key, msj) {
    this.sockets.forEach(sock => {
      if (sock != socket) {
        sock.emit(key, msj);
      }
    });
  }
}

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
  },
  "list": (socket, msj) => {
    ioServer.list(socket, msj);
  },
  "join": (socket, msj) => {
    ioServer.join(socket, msj);
  },
  "exit": (socket, msj) => {
    ioServer.exit(socket, msj);
  },
  "send": (socket, key, msj) => {
    ioServer.send(socket, key, msj);
  },
  "all": (socket, key, msj) => {
    ioServer.all(socket, key, msj);
  },
  "0": (socket, msj) => {
    ioServer.send(socket, "0", msj);
  },
  "1": (socket, msj) => {
    ioServer.send(socket, "1", msj);
  },
  "2": (socket, msj) => {
    ioServer.send(socket, "2", msj);
  },
  "3": (socket, msj) => {
    ioServer.send(socket, "3", msj);
  },
  "4": (socket, msj) => {
    ioServer.send(socket, "4", msj);
  },
  "5": (socket, msj) => {
    ioServer.send(socket, "5", msj);
  },
  "6": (socket, msj) => {
    ioServer.send(socket, "6", msj);
  },
  "7": (socket, msj) => {
    ioServer.send(socket, "7", msj);
  },
  "8": (socket, msj) => {
    ioServer.send(socket, "8", msj);
  },
  "9": (socket, msj) => {
    ioServer.send(socket, "9", msj);
  }
}

exports.SocketManager = SocketManager