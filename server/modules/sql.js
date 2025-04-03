// use strict;
const fs = require("fs");
const mysql = require("mysql");

const tablas = JSON.parse(fs.readFileSync("../data/tablas.json"));

let connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'mariabb',
    password : 'password',
    database : 'example'
});

const parseInsert = (table, objects) => {
    let objects = Array<Object> objects;
    let keys = Object.keys(objects[0]);
    let prompt = `INSERT INTO ${table} (${keys}) VALUES `;
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
}

const parseUpdate = (table, objects) => {
    let objects = Array<Object> objects;
    let keys = Object.keys(objects[0]);
    let prompt = `INSERT INTO ${table} (${keys}) VALUES `;
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
}

const parseDelete = (table, objects) => {
    let objects = Array<Object> objects;
    let keys = Object.keys(objects[0]);
    let prompt = `INSERT INTO ${table} (${keys}) VALUES `;
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
}

const CallBack = (error, results, fields) => {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
}

exports.create = () => {

}
exports.append = (type, datalist) => {
    let query = connection.query(parseInsert(tablas[type], datalist), CallBack);
}
exports.change = () => {

}
exports.delete = () => {

}