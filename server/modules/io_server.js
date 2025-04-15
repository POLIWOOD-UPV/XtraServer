const {io_logger} = require("./log");
let socketsList = new Array();

const broadcast = (socket, msg) => {
  socketsList.forEach(sock => {
    if (sock != socket) {
      sock.send(msg);
    }
  });
};

exports.connect = (socket) => {
  try {
    socketsList.push(socket);
    io_logger.connection(socket.id,socketsList);
  } catch (error) {
    console.error(`io_server.connect(${socket.id}):`, error.message);
  }
} 

exports.disconnect = (socket) => {
  try {
    log_sockets.pop(socket);
    io_logger.disconnection(socket.id,socketsList);
  } catch {
    console.error(`io_server.disconnect(${socket.id}):`, error.message);
  }
}

exports.message = (socket, msg) => {
  try {
    io_logger.log(socket.id, "message", msg);
    broadcast(socket, msg);
  } catch {
    console.error(`io_server.message(${socket.id},${msg}):`, error.message);
  }
}

exports.notify = (msg) => {
  try {
    io_logger.log("<server>", "!", msg);
    socketsList.forEach(sock => {sock.send(`!${msg}`)});
  } catch {
    console.error(`io_server.notify(${socket.id},${msg}):`, error.message);
  }
}