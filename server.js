// Abel Vidal Ripoll

// Local modules
const dir = require("./modules/dir");
const rasp = require("./modules/rasp");
const http_server = require("./modules/http_server");
const socket_events = require("./modules/socket_events");


// %%%%%%%%%%%%%%%% COMMANDS %%%%%%%%%%%%%%%%%%%

const commands = {
  "": (req, res) => {
      res.writeHead(200, {"Content-Type": "text/plain"});
      res.write("Welcome!\nplease introduce the file you want to see in the url.");
      res.end();
  },
  "hola": (req, res) => {
      res.writeHead(200, {"Content-Type": "text/plain"});
      res.write("¡Hola Mundo!");
      res.end();
  },
  "listdir": (req, res) => {
    dir.http_listdir(res, req.url);
  },
  "temperatura": (req, res) => {
    rasp.respondTemp(res);
  },
  "memoria": (req, res) => {
    rasp.respondMem(res);
  },
  "fecha": (req, res) => {
    rasp.respondFecha(res);
  },
  "hora": (req, res) => {
    rasp.respondHora(res);
  },
}

//
// Servidor HTTP.
//

const SERVER_PORT = 7000;

const server = http_server.IOserver(http_server.createServer(SERVER_PORT, commands, true),
  socket_events.connect,
  socket_events.disconnect,
  socket_events.events
);