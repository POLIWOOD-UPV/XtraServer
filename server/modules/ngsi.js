// use strict;
const http = require("http");
const fs = require("fs");
const {ngsi_logger, proxy_logger} = require("./log");
const {notify} = require("./io_server");
const {syncronize} = require("./sql");

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
exports.recv = async (req, res, action = "entityUpdate") => {
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
        entities.forEach((entity) => {
            notify(action, entity.id);
            if (entity.type == "Anuncio" || 
                entity.type === "EquipoMostrado" || 
                entity.type === "Animaciones") 
                { return } // Para que no salte error ya que no hay SQL para anuncios
            syncronize(action, entity);
        });
        // TODO 
        // fs.writeFileSync("./ngsi.json", JSON.stringify(req.body, null, 2));
    } catch (error) {
        console.error("ngsi.recv():", error.message);
    }
}

// ## PROXY ##
exports.proxy = async (client_req, client_res) => {
    proxy_logger.log(client_req);
    /*
    console.log(`[${(new Date()).toLocaleTimeString()
    }] <proxy>(${client_req.headers.host
    }) => ${client_req.method}: ${client_req.url}`);
    */
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

// crea una subscripcion para cada acción
exports.cleanSubsctiptions = async () => {
    let res;
    try {
        res = await fetch(subscriptions, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        if (!res.ok) {
            console.error(`ngsi.cleanSubsctiptions(${res.status}):`, await res.text());
            return;
        }
        let subs = await res.json();
        this.update("delete", subs.map((obj) => {obj.id}));
    } catch (error) {
        console.error(`ngsi.cleanSubsctiptions():`, error);
    }
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

// crea las entidades de las universidades
exports.crear_universidades = async () => {
    let universidades = JSON.parse(fs.readFileSync(
        "./data/uni/universidades.json"
    ));
    let clubes = JSON.parse(fs.readFileSync(
        "./data/uni/clubs.json"
    ));
    let entities = universidades.concat(clubes);
    let res = await this.update("append", entities);
    return res;
}

// crea las entidades de las universidades
exports.crear_ceros = async () => {
    let entities = [
        {
            "id": "urn:ngsi-ld:Equipo:00",
            "type": "Equipo",
            "dorsal": {
                "type": "Number",
                "value": 0
            },
            "name": {
                "type": "Text",
                "value": "POLIWOOD"
            },
            "acr": {
                "type": "Text",
                "value": "WOOD"
            },
            "acad": {
                "type": "Boolean",
                "value": false
            },
            "uni": {
                "type": "Text",
                "value": "UPV"
            },
            "miembros": {
                "type": "Number",
                "value": 8
            },
            "lider": {
                "type": "Text",
                "value": "Abel Vidal Ripoll"
            },
            "piloto": {
                "type": "Text",
                "value": "Ricardo Roman Martinez"
            },
            "foto": {
                "type": "Text",
                "value": "WOOD.jpg"
            },
            "logo": {
                "type": "Text",
                "value": "WOOD.png"
            }
        },
        {
            "id": "urn:ngsi-ld:Ronda:0",
            "type": "Ronda",
            "num": {
              "type": "Number",
              "value": 0
            },
            "pres": {
              "type": "Float",
              "value": 0.0
            },
            "velv": {
              "type": "Float",
              "value": 0.0
            },
            "actv": {
              "type": "Bit",
              "value": 0
            },
            "time": {
                "type": "DateTime",
                "value": "2025-01-01T00:00:00"
            }
        }
    ]; // DATETIME => ISO8601
    let res = await this.update("append", entities);
    return res;
}    

// crear la entidad de los anuncios
exports.crear_anuncio = async ()=> {
    let anuncio = {
        id: "urn:ngsi-ld:Anuncio:001",
        type: "Anuncio",                 
        texto: { type: "Text", value: "XC2025" },
    };
    return await this.update("append", [anuncio]);
}

// crear entidad de los recursos (staff, recursos, tareas)
exports.crear_staff = async () => {
    // Coger los datos del staff
    let staff = JSON.parse(fs.readFileSync("./data/jurado/staff.json"))
    let res = await this.update("append", staff)
    return res;

}

exports.crear_tareas = async () => {
    let tareas = JSON.parse(fs.readFileSync("./data/jurado/tareas.json"))
    let res = await this.update("append",tareas)
    return res
}

exports.crear_recursos = async () => {
    const recursos = JSON.parse(fs.readFileSync("./data/jurado/recursos.json"));
    const res = await exports.update("append", recursos);
    return res;
};

// crear las entidades de la imagen mosta
exports.crear_equipoMostrado = async () => {
    let equipoMostrado = {
        id:"urn:ngsi-ld:equipoMostrado:001",
        type: "EquipoMostrado",
        acr: {type: "Text", value: "SPONSORS"}
    };
    return await this.update("append", [equipoMostrado]);
};

// crear la entidad de control de animaciones

// crear la entidad de las animaciones
exports.crear_animaciones = async () => {
    let animaciones = {
        id: "urn:ngsi-ld:Animaciones:001",
        type: "Animaciones",
        rankings:  { type:"Text", value:"visible" },
        anuncios:  { type:"Text", value:"visible" },
        equipos:   { type:"Text", value:"visible" },
        cronos:    { type:"Text", value:"visible" },
        datos:     { type:"Text", value:"visible" },
        dot:       { type:"Text", value:"visible" },
        pos:       { type:"Text", value:"visible" },
        nombre:       { type:"Text", value:"visible" },
        tiempos:   { type:"Text", value:"visible" },
        logos:     { type:"Text", value:"visible" },
        dorsales:  { type:"Text", value:"oculto" },
        pesos:     { type:"Text", value:"oculto" }
    };
    return await this.update("append", [animaciones]);
};


// espieza todo el sistema NGSI
exports.start = async () => {
    try {
        console.log("NGSI Starting...")
        try {
            await this.cleanSubsctiptions();
            await this.subscribeALL();
        }
        catch {
            console.log("NGSI NOT AVAILABLE");
            return;
        }
        console.log("NGSI Ready!");
        let res = await fetch(HTTP+"/");
        res = await this.crear_universidades();
        console.log("Universidades Creadas:", res.status);
        res = await this.crear_equipos();
        console.log("Equipos Creados:", res.status);
        res = await this.crear_ceros();
        console.log("Ronda y Equipo 0 Creados:", res.status);
        
        
        
        // Staff y tareas
        res = await this.crear_staff();
        console.log("Staff montados:", res.status);
        res = await this.crear_tareas();
        console.log("Tareas montados:", res.status);
        res = await this.crear_recursos();
        console.log("Recursos montados:", res.status);
        
        
        // Contenido mostado en pantalla
        res = await this.crear_anuncio();
        console.log("Anuncio montados:", res.status);

        res = await this.crear_equipoMostrado();
        console.log("Equipos mostrados montados:", res.status)
        
        // Animaciones
        res = await this.crear_animaciones();
        console.log("Animaciones montados:", res.status)
    } catch (error) {
        console.error("ngsi.start():", error.message);
        process.exit(1);
    }
}