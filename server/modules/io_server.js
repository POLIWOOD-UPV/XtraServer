const {io_logger} = require("./log");
let socketsList = new Array();

const broadcast = (socket, msg) => {
  socketsList.forEach(sock => {
    sock.send(msg);
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
  } catch (error) {
    console.error(`io_server.disconnect(${socket.id}):`, error.message);
  }
}

exports.message = (socket, msg) => {
  try {
    io_logger.log(socket.id, "message", msg);
    broadcast(socket, msg);
  } catch (error){
    console.error(`io_server.message(${socket.id},${msg}):`, error.message);
  }
}

exports.notify = (event, id) => {
  try {
    io_logger.log("<server>", "!"+event , id);
    socketsList.forEach(sock => {sock.send(`!${event} ${id}`)});
  } catch (error){
    console.error(`io_server.notify(${socket.id},${event},${id}):`, error.message);
  }
}