const fs = require("fs");

class Logger {
    folder = "./logs/"
    // name: string, structure: array[string], cmd: boolean
    constructor(name , structure, cmd) {
        this.name = name;
        this.filename = name + ".csv";
        this.structure = new Array(["Time"]).concat(structure);
        this.cmd = cmd;

        this.file = this.folder+this.filename;
        let header = Array(this.structure).join(";")+"\n";
        header = header.replaceAll(",", ";");

        fs.writeFileSync(this.file, header);
    }
    // args: Array := structure
    _log = (args) => {
        try {
            args = new Array([(new Date()).toLocaleTimeString()]).concat(args);
            let line = args.join(";")+"\n";
            fs.appendFileSync(this.file, line);
        } catch (error) {
            console.error(`${this.name}.log(${args}):`, error.message);
        }
    }

    // args: Array := structure
    log = (...args) => {
        this._log(args);
        this.console(args);
    }

    console = (args) => {
        try {
            if (this.cmd) {
                console.log(`[${(new Date()).toLocaleTimeString()}]`,this.to_string(),...args);
            }
        } catch (error) {
            console.error(`${this.name}.console(${args}):`, error.message);
        }
    }

    to_string = () => {
        return `<Logger>(${this.name})`
    }
}

exports.Logger = Logger;

// #####################################################################################

exports.http_logger = new class extends Logger{
    log = (request) => {
        this._log([
            request.method, 
            request.url,
            JSON.stringify(request.headers)
        ]);
        this.console([
            request.headers.host,
            request.method, 
            request.url
        ]);
    }
}(
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

exports.io_logger = new class extends Logger {
    log = (id, event, msg) => {
        let args = [
            id,
            event,
            msg
        ];
        this._log(args);
        this.console(args);
    }
    connection = (id, socketlist) => {
        let args = [id,"connection",stringfySocket(socketlist)]
        this._log(args);
        this.console(args);
    }
    disconnection = (id, socketlist) => {
        let args = [id,"disconnection",stringfySocket(socketlist)]
        this._log(args);
        this.console(args);
    }
}(
    "IO_server",
    ["Socket","Event","Data"],
    false
);

// #####################################################################################

const stringfyEntities = (entities) => {
    try {
        var aux = []
        entities.forEach(entity => {
            aux.push(entity.id)
        });
        return `[${aux.join(", ")}]`
    } catch (error) {
        console.error("stringfyEntities():", error.message);
        process.exit(1);
    }
}

exports.ngsi_logger = new class extends Logger {
    log = (id, action, entities) => {
        this._log([
            id, action,
            JSON.stringify(entities)
        ]);
        this.console([
            `${String(action).slice(6).toUpperCase()} =>`,
            stringfyEntities(entities)
        ]);
    }
}(
    "NGSI",
    ["ID","Action","Data"],
    true
);

// #####################################################################################
