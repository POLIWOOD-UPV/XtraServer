// use strict;
const http = require("http");
const fs = require("fs");
const {ngsi_logger} = require("./log");

const DOCKER = "host.docker.internal"
const HTTP = "http://xtraserver:80"
const NGSI = "http://orion:1026/"
const entities = NGSI+"v2/entities/"
const subscriptions = NGSI+"v2/subscriptions/"
const update = NGSI+"v2/op/update"
exports.URL = "/subscriptions/"

// ACTIONTYPE: https://github.com/telefonicaid/fiware-orion/issues/1494#issuecomment-252624469
const actions = ["append", "appendStric", "delete", "replace", "update"];
const types = JSON.parse(fs.readFileSync("./data/tablas.json"));

// recibe la subscripcion
// req: Request, res: Response
// action: append | appendStric | delete | replace | update
exports.recv = async (req, res, action = "append") => {
    if (!actions.includes(action)) {
        res.status(404);
        res.send("ActionType doesn't exist\nuse: "+actions);
        return; // el tipo de accion no existe
    }
    try {
        res.setHeader("Content-type", "application/json");
        res.json({...req.query, peticion: "GET"});
        let id = req.body.subscriptionId;
        let entities = req.body.data;
        ngsi_logger.log(id, action, entities);
        res.status(202);
        // TODO 
        // fs.writeFileSync("./ngsi.json", JSON.stringify(req.body, null, 2));
        res.status(202);
    } catch (error) {
        console.error("ngsi.recv():", error.message);
    }
}

// ## PROXY ##
exports.proxy = async (client_req, client_res) => {
    console.log(`[${(new Date()).toLocaleTimeString()
    }] <proxy>(${client_req.headers.host
    }) => ${client_req.method}: ${client_req.url}`);
    try {
        let options = {
            hostname: "orion",
            port: 1026,
            path: client_req.url,
            method: client_req.method,
            headers: client_req.headers
        }
        const proxy = http.request(NGSI, options, (res) => {
            client_res.writeHead(res.statusCode, res.headers);
            //res.on('data',(chunk)=>{client_res.write(chunk);});
            //res.on('close',()=>{client_res.end();});
            //res.on('end',()=>{client_res.end();});
            res.pipe(client_res, {end: true});
        }).on("error", error => {
            console.error(`ngsi.proxy.req(${client_req.method},${client_req.url}):`, error.message);
            client_res.status(500).send("Proxy Error");
        });
        client_req.pipe(proxy, {end: true});
    } catch (error) {
        console.error(`ngsi.proxy(${client_req.method},${client_req.url}):`, error.name, error.message);
        client_req.status(500).send("Proxy Error");
        return;
    }
  }

// crea la subscripcion para todo tipo de eventos
// action: append | appendStric | delete | replace | update
exports.subscribe = async (action = "append") => {
    let res = await (fetch(subscriptions, {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            description: `Subscription for action: ${action}`,
            type: "NGSI_2_SQL",
            subject: { 
                actionType: action,
                entities:[
                    {idPattern: ".*"} 
                ]
            },
            format: "keyValues",
            notification: {
                http: {
                    url: HTTP+this.URL+action,
                    accept: "application/json"
                }
            }
        })
    }));
    return res;
}

// crea una subscripcion para cada acción
exports.subscribeALL = async () => {
    actions.forEach(async action => {
        await this.subscribe(action);
    });
}

// Para actualizar varias entidades a la vez
// action: append | appendStric | delete | replace | update
// entities: Array<NGSI_Object>
exports.update = async (action, entities) => {
    let res = await fetch(update, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                actionType: action,
                entities: entities
            })
        }
    );
    return res;
}

// crea las entidades de los equipos
exports.crear_equipos = async () => {
    let academicos = JSON.parse(fs.readFileSync(
        "./data/equipos/academicos.json"
    ));
    let clubes = JSON.parse(fs.readFileSync(
        "./data/equipos/clubes.json"
    ));
    let entities = academicos+clubes;
    console.log(JSON.stringify(entities));
    let res = await this.update("append", entities);
    return res;
}

// crea las entidades de los equipos
exports.crear_universidades = async () => {
    let universidades = JSON.parse(fs.readFileSync(
        "./data/uni/universidades.json"
    ));
    let clubes = JSON.parse(fs.readFileSync(
        "./data/uni/clubs.json"
    ));
    let res = await this.update("append", universidades+clubes);
    return res;
}

// espieza todo el sistema NGSI
exports.start = async () => {
    try {
        console.log("NGSI Starting...")
        try {
            await this.subscribe();
        }
        catch {
            console.log("NGSI NOT AVAILABLE");
            return;
        }
        console.log("NGSI Ready!")
        await this.crear_equipos();
    } catch (error) {
        console.error("ngsi.start():", error.message);
        process.exit(1);
    }
}