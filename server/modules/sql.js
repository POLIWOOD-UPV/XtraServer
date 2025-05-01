// use strict;
const fs = require("fs");
const mysql = require("mysql");

const tablas = JSON.parse(fs.readFileSync("./data/tablas.json"));

let connection;

const parseInsert = (table, objects) => {
    let keys = Object.keys(objects[0]);
    keys.shift(); // id
    keys.shift(); // type
    let prompt = `INSERT INTO ${table.table} (${keys}) VALUES `;
    let values = [];
    let strings = [];
    objects.forEach((object) => {
        keys.forEach(key => {
            values += [object[key]];
        });
        strings += ["("+String(values)+")"];
        values = [];
    });
    return prompt + strings + ";";
};

const parseUpdate = (table, objects) => {
    let keys = Object.keys(objects[0]);
    let prompt = `INSERT INTO ${table.table} (${keys}) VALUES `;
    let values = [];
    let strings = [];
    objects.forEach((object) => {
        keys.forEach(key => {
            values += [object[key]];
        });
        strings += ["("+String(values)+")"];
        values = [];
    });
    return prompt + strings + ";";
};

const parseDelete = (table, objects) => {
    let keys = Object.keys(objects[0]);
    let prompt = `INSERT INTO ${table.table} (${keys}) VALUES `;
    let values = [];
    let strings = [];
    objects.forEach((object) => {
        keys.forEach(key => {
            values += [object[key]];
        });
        strings += ["("+String(values)+")"];
        values = [];
    });
    return prompt + strings + ";";
};

const CallBack = (error, results, fields) => {
    if (error) {
        console.error(`SQL.CallBack(): ${error}`);
        throw error;
    } else {
        console.log('The solution is: ', results[0].solution);
    }
};

exports.syncronize = (action, entity) => {
    try {
        const type = entity.type;
        if (type in tablas) {
            let prompt;
            switch (action) {
                case "entityCreate":
                    prompt = parseInsert(tablas[type], [entity]);
                    break;
                case "entityDelete":
                    prompt = parseDelete(tablas[type], [entity]);
                    break;
                case "entityChange":
                    prompt = parseUpdate(tablas[type], [entity]);
                    break;
                case "entityUpdate":
                    prompt = parseUpdate(tablas[type], [entity]);
                    break;
                default:
                    console.error(`SQL.syncronize(${action}): action not implemented`);
                    return;
            }
            try {
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

exports.setup = () => {
    try {
        connection = mysql.createConnection({
            host     : 'mariadb',
            user     : 'root',
            password : 'password',
            // database : 'xtrachallenge25'
        });
        let query;
        let db = fs.readFileSync("./data/db.sql"); 
        let tables = fs.readFileSync("./data/test.sql"); // fs.readFileSync("./data/tablas.sql");

        query = connection.query(String(db), (error, results, fields) => {
            if (error) {
                console.error(`SQL.setup(callback): ${error}`);
                throw error;
            } else {
                console.log("SQL database created");
            }
        }); // "CREATE DATABASE IF NOT EXISTS `xtrachallenge25`;"

        query = connection.query(String(tables), (error, results, fields) => {
            if (error) {
                console.error(`SQL.setup(callback): ${error}`);
                throw error;
            } else {
                console.log("SQL ready!");
            }
        });

    } catch (error) {
        console.error(`SQL.setup(): ${error}`);
    }
};