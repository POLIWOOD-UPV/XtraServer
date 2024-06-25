const http = require("http");
const ip = require('ip');
const fs = require("fs");
const {Server, Namespace, Socket} = require("socket.io");

const dir = require("./dir");

const doGET = (req, res, commands) => {
    for (const key in commands) {
        if (Object.hasOwnProperty.call(commands, key) && req.url == "/" + key) {
            try {
                commands[key](req, res);
            } catch (error) {
                console.error(`command(${key})`, error.message);
                process.exit(1);
            }
            return;
        }
    }
    if (req.url.search("\\.") == -1) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("Error 404: command not existent");
        res.end();
        return;
    } else {
        dir.http_file(res, req.url);
        return;
    }
}

const doPOST = (req, res) => {
    if (req.url == "form.html") {
        res.writeHead(200);

        fs.writeFileSync("./http/POST" + req.url, "");

        req.on("data", (data) => {
            console.log("POSTdata: "+ data)
            fs.appendFileSync("./http/POST" + req.url, data);
        })
        res.end();
    } else {
        res.writeHead(400);
        res.write('');
        res.end();
    }
}

exports.createServer = (port, commands) => {
    var server = http.createServer((req, res) => {
        fs.appendFileSync("./logs/http_server.csv", [
            req.method, 
            req.url,
            JSON.stringify(req.headers)
        ].join(";") + "\n");
        console.log(req.method + ": " + req.url);
        if (req.method === "GET") {
            doGET(req, res, commands);
        } else if (req.method === "POST") {
            doPOST(req, res);
        } else {
          res.writeHead(501, {"Content-Type": "text/plain"});
          res.write("Error 501: method not implemented");
          res.end();
          return;
        }
    });

    server.listen(port, function () {
        fs.writeFileSync("./logs/http_server.csv", "Method;URL;Header\n");
        console.log("Servidor disponible la siguiente dirección:");
        console.log(`http://${ip.address()}:${port}/`);
        console.log("Si no funciona o esta trabajando en local:");
        console.log(`http://127.0.0.1:${port}/`);
        console.log("Servidor en marcha...\n");
    });

    return server;
}

const broadcastIOserver = (server) => {
    // http://.../socket.io/socket.io.js

    fs.writeFileSync("./logs/IO_server.csv", "Socket;Event;Data\n");

    io = new Server(server);
    var broadcastSockets = new Array();

    io.on("connection", (socket) => {
        broadcastSockets.push(socket);
        fs.appendFileSync("./logs/IO_server.csv", [
            socket.id, 
            "connection",
            stringfySocket(broadcastSockets)
        ].join(";") + "\n");

        socket.on("message", (msj) => {
            fs.appendFileSync("./logs/IO_server.csv", [
                socket.id, 
                "message",
                msj
            ].join(";") + "\n");
            broadcastSockets.forEach(sock => {
                if (sock != socket) {
                    sock.send(msj);
                }
            });
        });

        socket.on("disconnect", () => {
            broadcastSockets.pop(socket);
            fs.appendFileSync("./logs/IO_server.csv", [
                socket.id, 
                "disconnect",
                stringfySocket(broadcastSockets)
            ].join(";") + "\n");
        });
    })

    io.on("ping", (cb) => {
        cb("pong");
    });

    console.log("new IO Server");
    return io;
}

exports.broadcastIOserver = broadcastIOserver;

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

exports.IOserver = (server, connection, disconnect, events) => {
    // http://.../socket.io/socket.io.js

    fs.writeFileSync("./logs/IO_server.csv", "Socket;Event;Data;extra\n");

    io = new Server(server);

    io.on("connection", (socket) => {
        IOlog("server", "connection", socket.id);
        connection(socket);
        /*
        socket.on("message", (msj) => {
            IOlog(socket.id, "message", msj);
            socketsList.forEach(sock => {
                if (sock != socket) {
                    sock.send(msj);
                }
            });
        });
        */
        socket.on("disconnect", () => {
            IOlog("server", "disconnect", socket.id);
            disconnect(socket);
        });

        for (const key in events) {
            if (Object.hasOwnProperty.call(events, key)) {
                socket.on(key, (...params) => {
                    var args = Array.from(params);
                    IOlog(socket.id, key, String(args));
                    events[key](socket, ...args);
                });
            }
        }
    })

    console.log("new IO Server");
    return io;
}