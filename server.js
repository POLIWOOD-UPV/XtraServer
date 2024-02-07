// Abel Vidal Ripoll - Toni Tormo Pla

// Node imports
const http = require("http");
const fs = require('fs');
const ip = require('ip');

// Local modules
const dir = require("./modules/dir");
const rasp = require("./modules/rasp");
const http_server = require("./modules/http_server");
const socket_events = require("./modules/socket_events");

// Responses
const http_control = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(fs.readFileSync("./http/html/ajustes.html"));
    res.end();
  } catch (error) {
    console.error("http_control():", error.message);
    process.exit(1);
  }
}

const http_hub = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(fs.readFileSync("./http/html/hub.html"));
    res.end();
  } catch (error) {
    console.error("http_hub():", error.message);
    process.exit(1);
  }
}

const http_ajustes = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(fs.readFileSync("./http/html/ajustes.html"));
    res.end();
  } catch (error) {
    console.error("http_ajustes():", error.message);
    process.exit(1);
  }
}

const http_log = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(fs.readFileSync("./http/log/table.html"));
    res.end();
  } catch (error) {
    console.error("http_log():", error.message);
    process.exit(1);
  }
}

const http_led = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write(fs.readFileSync("./http/html/led.html"));
    res.end();
  } catch (error) {
    console.error("http_led():", error.message);
    process.exit(1);
  }
}

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
  "control": (req, res) => {
    http_control(res);
  },
  "hub": (req, res) => {
    http_hub(res);
  },
  "log": (req, res) => {
    http_log(res);
  },
  "led": (req, res) => {
    http_led(res);
  },
  "ajustes": (req, res) => {
    http_ajustes(res);
  },
  "listdir": (req, res) => {
    dir.http_listdir(res);
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