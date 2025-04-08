const fs = require("fs");

class Logger {
    folder = "./logs/"
    // name: string, structure: array[string], cmd: boolean
    constructor(name , structure, cmd) {
        this.name = name;
        this.filename = name + ".csv";
        this.structure = structure;
        this.cmd = cmd;

        this.file = this.folder+this.filename;
        let header = Array(structure).join(";")+"\n";

        fs.writeFileSync(this.file, header);
    }
    // args: Array := structure
    _log = (args) => {
        let line = args.join(";")+"\n";
        fs.appendFileSync(this.file, line);
        if (this.cmd) {
            console.log(this.to_string(),...args);
        }
    }

    // args: Array := structure
    log = (...args) => {
        this._log(args);
    }

    to_string = () => {
        return `[Logger](${this.name})`
    }
}

exports.Logger = Logger;

// #####################################################################################

class HTTPlogger extends Logger {
    log = (request) => {
        let args = [
            request.method, 
            request.url,
            JSON.stringify(request.headers)
        ];
        let line = args.join(";")+"\n";
        fs.appendFileSync(this.file, line);
        if (this.cmd) {
            console.log(
                this.to_string(),
                request.headers.host,
                request.method, 
                request.url
            );
        }
    }
}
exports.http_logger = new HTTPlogger(
    "http_server",
    ["Method","URL","Header"],
    true
);

// #####################################################################################

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

class IOlogger extends Logger {
    log = (id, event, msg) => {
        this._log([id,event,msg]);
    }
    connection = (id, socketlist) => {
        this._log([id,"connection",stringfySocket(socketlist)]);
    }
    disconnection = (id, socketlist) => {
        this._log([id,"disconnection",stringfySocket(socketlist)]);
    }
}
exports.io_logger = new IOlogger(
    "IO_server",
    ["Socket","Event","Data"],
    false
);

// #####################################################################################
