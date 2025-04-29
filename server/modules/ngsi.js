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

// https://github.com/telefonicaid/fiware-orion/blob/master/doc/manuals/orion-api.md
const actions = ["append", "appendStric", "delete", "replace", "update"];
const notifications = ["entityCreate", "entityDelete", "entityChange", "entityUpdate"];
const types = JSON.parse(fs.readFileSync("./data/tablas.json"));

// recibe la subscripcion
// req: Request, res: Response
// action: append | appendStric | delete | replace | update
exports.recv = async (req, res, action = "append") => {
    if (!notifications.includes(action)) {
        res.status(404);
        res.send("ActionType doesn't exist\nuse: "+notifications);
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
          };

        const proxy = http.request(options, (res) => {
            client_res.writeHead(res.statusCode, res.headers);
            res.pipe(client_res, {end: true}); // con esto basta
            /*
            // vamos guardando lo que nos manda orion
            let responseBody = "";
            res.on("data", chunk => {
              responseBody += chunk;
            });
        
            res.on("end", () => {
            //   console.log("[Orion] Body recibido:");
            //   console.log(responseBody); // esto es el JSON de datos que recibimos de ORION
              
              // Mandamos de vuelta lo que hemos recibido de orion
              client_res.writeHead(res.statusCode, res.headers);
              client_res.end(responseBody);
            });
            */
        });

        proxy.on("error", error => {
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
exports.subscribe = async () => {
    const subscription = {
        description: `Subscription for action`,
        type: "NGSI_2_SQL",
        subject: {
            entities:[
                {idPattern: ".*"} 
            ],
            condition: {
                alterationTypes: ["entityCreate", "entityDelete", "entityChange", "entityUpdate"]
            }
        },
        format: "keyValues",
        notification: {
            http: {
                url: HTTP+this.URL,
                accept: "application/json"
            }
        }
    };
    let res = await (fetch(subscriptions, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
    }));
    return res;
}

// crea una subscripcion para cada acción
exports.subscribeALL = async () => {
    const subs = [
        {
            description: `Subscription for action: Create`,
            type: "NGSI_2_SQL",
            subject: {entities:[{idPattern: ".*"}],condition:{alterationTypes:["entityCreate"]}},
            format: "keyValues",
            notification: { http:{url: HTTP+this.URL+"entityCreate", accept:"application/json"}}
        },
        {
            description: `Subscription for action: Delete`,
            type: "NGSI_2_SQL",
            subject: {entities:[{idPattern: ".*"}],condition:{alterationTypes:["entityDelete"]}},
            format: "keyValues",
            notification: { http:{url: HTTP+this.URL+"entityDelete", accept:"application/json"}}
        },
        {
            description: `Subscription for action: Change`,
            type: "NGSI_2_SQL",
            subject: {entities:[{idPattern: ".*"}],condition:{alterationTypes:["entityChange"]}},
            format: "keyValues",
            notification: { http:{url: HTTP+this.URL+"entityChange", accept:"application/json"}}
        },
        {
            description: `Subscription for action: Update`,
            type: "NGSI_2_SQL",
            subject: {entities:[{idPattern: ".*"}],condition:{alterationTypes:["entityUpdate"]}},
            format: "keyValues",
            notification: { http:{url: HTTP+this.URL+"entityUpdate", accept:"application/json"}}
        }
    ]
    subs.forEach(async sub => {
        let res = await (fetch(subscriptions, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sub)
        }));
        if (!res.ok) {
            console.error(`ngsi.subsctibeALL(${res.status}):`, await res.text(), sub);
        }
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
    let entities = academicos.concat(clubes);
    // console.log(JSON.stringify(entities));
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
            await this.subscribeALL();
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