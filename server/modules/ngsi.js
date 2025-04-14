// use strict;
const fs = require("fs");
const {ngsi_logger} = require("./log");

const HTTP = "http://xtraserver:80"
const NGSI = "http://orion:1026/v2/"
const entities = NGSI+"entities/"
const subscriptions = NGSI+"subscriptions/"
const update = NGSI+"op/update"
exports.URL = "/ngsi/"

// ACTIONTYPE: https://github.com/telefonicaid/fiware-orion/issues/1494#issuecomment-252624469
const actions = ["append", "appendStric", "delete", "replace", "update"]

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
        try {await this.subscribe();}
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