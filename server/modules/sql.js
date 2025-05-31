// use strict;
const fs = require("fs");
const mysql = require("mysql");

const tablas = JSON.parse(fs.readFileSync("./data/tablas.json"));
let connection;

const isoToSqlDatetime = (isoString) => {
    return isoString.replace("T", " ").replace("Z", "").split(".")[0];
};

const parseInsert = (table, object) => {
    const id = object.id; delete object.id;
    const type = object.type; delete object.type;
    const attr = Object.keys(object);

    const values = attr.map(key => {
        let val = object[key].value;
        if (typeof val === "string" && val.endsWith("Z") && val.includes("T")) {
            val = isoToSqlDatetime(val);
        }
        return JSON.stringify(val);
    });

    return `REPLACE INTO ${table.table} (${attr}) VALUES (${values.join(",")});`;
};

const parseUpdate = (table, object) => {
    const id = object.id; delete object.id;
    const type = object.type; delete object.type;
    const attr = Object.keys(object);
    const keys = tablas[type].keys;
    const ids = String(id).split(":").pop().split("-");

    const values = attr.map(key => {
        let val = object[key].value;
        if (typeof val === "string" && val.endsWith("Z") && val.includes("T")) {
            val = isoToSqlDatetime(val);
        }
        return `${key}=${JSON.stringify(val)}`;
    });

    const conditions = [];
    for (let i = 0; i < keys.length; i++) {
        const val = ids[i];
        if (val === undefined || val === null || val === "") {
            console.warn(`Clave faltante para ${keys[i]} en entidad ${id} (${type}), abortando UPDATE.`);
            return "";
        }
        if (tablas[type].idLen[i] === 0) {
            conditions.push(`${keys[i]}=${JSON.stringify(val)}`);
        } else {
            const num = parseInt(val);
            if (isNaN(num)) {
                console.warn(`Valor no numérico para ${keys[i]} en entidad ${id} (${type}): '${val}'`);
                return "";
            }
            conditions.push(`${keys[i]}=${num}`);
        }
    }

    return `UPDATE ${table.table} SET ${values.join(", ")} WHERE ${conditions.join(" AND ")};`;
};

const parseDelete = (table, object) => {
    const id = object.id;
    const type = object.type;
    const keys = tablas[type].keys;
    const ids = String(id).split(":").pop().split("-");

    const conditions = [];
    for (let i = 0; i < keys.length; i++) {
        const val = ids[i];
        if (val === undefined || val === null || val === "") {
            console.warn(`Clave faltante para ${keys[i]} en entidad ${id} (${type}), abortando DELETE.`);
            return "";
        }
        if (tablas[type].idLen[i] === 0) {
            conditions.push(`${keys[i]}=${JSON.stringify(val)}`);
        } else {
            const num = parseInt(val);
            if (isNaN(num)) {
                console.warn(`Valor no numérico para ${keys[i]} en entidad ${id} (${type}): '${val}'`);
                return "";
            }
            conditions.push(`${keys[i]}=${num}`);
        }
    }

    return `DELETE FROM ${table.table} WHERE ${conditions.join(" AND ")};`;
};

const CallBack = (error, results, fields) => {
    if (error) console.error(`SQL.CallBack(): ${error}`);
};

exports.syncronize = (action, entity) => {
    try {
        const type = entity.type;
        if (!(type in tablas)) {
            console.error(`SQL.syncronize(${type}): type not implemented`);
            return;
        }

        let prompt = "";
        switch (action) {
            case "entityCreate":
                prompt = parseInsert(tablas[type], entity);
                break;
            case "entityDelete":
                prompt = parseDelete(tablas[type], entity);
                break;
            case "entityChange":
            case "entityUpdate":
                prompt = parseUpdate(tablas[type], entity);
                break;
            default:
                console.error(`SQL.syncronize(${action}): action not implemented`);
                return;
        }

        if (!prompt || prompt.trim() === "") return;

        fs.appendFileSync("./logs/mariadb.sql", prompt + "\n");

        connection = mysql.createConnection({
            host     : 'mariadb',
            user     : 'root',
            password : 'password',
            database : 'xtrachallenge25'
        });

        connection.query(prompt, CallBack);
        connection.end(); // cerrar conexión tras cada sync
    } catch (error) {
        console.error(`SQL.syncronize(${action}, ${entity.id}): ${error}`);
    }
};

exports.setup = (callback) => {
    try {
        while (!connection) {
            try {
                connection = mysql.createConnection({
                    host     : 'mariadb',
                    user     : 'root',
                    password : 'password'
                });
            } catch (error) {
                console.error(`SQL.while(): ${error}`);
            }
        }

        const db = fs.readFileSync("./data/init.sql");
        const prompts = String(db).replaceAll("\r\n", "").split(";");
        prompts.pop(); // quitar final vacío

        let index = 0;
        const loop = (error, results, fields) => {
            if (error) {
                console.error(`SQL.setup(${index}): ${error}`);
                throw error;
            }
            if (index < prompts.length - 1) {
                index++;
                connection.query(prompts[index] + ";", loop);
            } else {
                fs.writeFileSync("./logs/mariadb.sql", "USE `xtrachallenge25`;\n");
                console.log("SQL ready!");
                callback();
            }
        };

        connection.query(prompts[index] + ";", loop);
    } catch (error) {
        console.error(`SQL.setup(): ${error}`);
    }
};

process.on("SIGTERM", () => {
    if (connection) {
        connection.end(err => {
            if (err) console.error(`SQL.end(): ${err}`);
            else console.log("SQL CLOSING...");
        });
    }
});