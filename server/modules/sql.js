// use strict;
const fs = require("fs");
const mysql = require("mysql");

const tablas = JSON.parse(fs.readFileSync("./data/tablas.json"));

let connection;

const parseInsert = (table, object) => {
    const id = object.id; delete object.id;
    const type = object.type; delete object.type;
    const attr = Object.keys(object);
    let values = Array();
    attr.forEach(key => {
        values.push(object[key].value);
    });
    let prompt = `REPLACE INTO ${table.table} (${attr}) VALUES (${JSON.stringify(values).slice(1,-1)});`;
    return prompt;
};

const parseUpdate = (table, object) => {
    const id = object.id; delete object.id;
    const type = object.type; delete object.type;
    const attr = Object.keys(object);
    const keys = tablas[type].keys;
    const ids = String(id).split(":")[0].split("-");
    let conditions = Array();
    let values = Array();
    attr.forEach(key => {
        values.push(`${key}=${JSON.stringify(object[key].value)}`);
    });
    for (let i = 0; i < keys.length; i++) {
        if (tablas[type].idLen[i] == 0) {
            conditions.push(`${keys[i]}=${JSON.stringify(ids[i])}`);
        } else {
            conditions.push(`${keys[i]}=${parseInt(ids[i])}`);
        }
    }
    let prompt = `UPDATE ${table.table} SET ${values} WHERE ${conditions.join(" AND ")};`;
    return prompt;
};

const parseDelete = (table, object) => {
    const id = object.id;
    const type = object.type;
    const keys = tablas[type].keys;
    const ids = String(id).split(":")[3].split("-");
    let conditions = Array();
    for (let i = 0; i < keys.length; i++) {
        if (tablas[type].idLen[i] == 0) {
            conditions.push(`${keys[i]}=${JSON.stringify(ids[i])}`);
        } else {
            conditions.push(`${keys[i]}=${parseInt(ids[i])}`);
        }
    }
    let prompt = `DELETE FROM ${table.table} WHERE ${conditions.join(" AND ")};`;
    return prompt;
};

const CallBack = (error, results, fields) => {
    if (error) {
        console.error(`SQL.CallBack(): ${error}`);
        // throw error;
    }
};

exports.syncronize = (action, entity) => {
    try {
        const type = entity.type;
        if (type in tablas) {
            let prompt;
            switch (action) {
                case "entityCreate":
                    prompt = parseInsert(tablas[type], entity);
                    break;
                case "entityDelete":
                    prompt = parseDelete(tablas[type], entity);
                    break;
                case "entityChange":
                    prompt = parseUpdate(tablas[type], entity);
                    break;
                case "entityUpdate":
                    prompt = parseUpdate(tablas[type], entity);
                    break;
                default:
                    console.error(`SQL.syncronize(${action}): action not implemented`);
                    return;
            }
            try {
                fs.appendFileSync("./logs/mariadb.sql", prompt+"\n");
                connection = mysql.createConnection({
                    host     : 'mariadb',
                    user     : 'root',
                    password : 'password',
                    database : 'xtrachallenge25'
                });
                return query = connection.query(prompt, CallBack);
            } catch (error) {
                console.error(`SQL.syncronize(): ${query}\n${error}`);
            }
        } else {
            console.error(`SQL.syncronize(${type}): type not implemented`);
        }
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
                    password : 'password',
                    // database : 'xtrachallenge25'
                });
            } catch (error) {
                console.error(`SQL.while(): ${error}`);
            }
        }
        let query;
        let db = fs.readFileSync("./data/init.sql");
        let prompts = String(db).replaceAll("\r\n","").split(";");
        prompts.pop();
        let index = 0;
        let maxindex = prompts.length - 1;

        let loop = (error, results, fields) => {
            if (error) {
                console.error(`SQL.setup(${index}): ${error}`);
                throw error;
            } else {
                if (index < maxindex) {
                    index++;
                    query = connection.query(prompts[index]+";", loop);
                } else {
                    fs.writeFileSync("./logs/mariadb.sql", "USE `xtrachallenge25`;\n")
                    console.log("SQL ready!");
                    callback();
                }
            }
        }
        query = connection.query(prompts[index]+";", loop); // "CREATE DATABASE IF NOT EXISTS `xtrachallenge25`;"
    } catch (error) {
        console.error(`SQL.setup(): ${error}`);
    }
};

process.on("SIGTERM", () => {
    connection.end(() => {
        if (error) {
            console.error(`SQL.end(): ${error}`);
        } else {
            console.log("SQL CLOSING...")
        }
    });
});