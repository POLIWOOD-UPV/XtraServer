const http = require("http");
const fs = require("fs");
const ngsi = require("./ngsi.js");

exports.save = async (req, res) => {
    const name = req.params.name;
    const tablas = JSON.parse(fs.readFileSync("./data/tablas.json"));
    let response;
    try {
        await fs.mkdir(`./data/save/${name}`);
        for (const type in tablas) {
            response = fetch(`http://orion:1026/v2/entities/?type=${type}`);
            if (!response.ok) {
                let err = await response.text();
                console.error(`save.save():`, err);
                res.write(`${err}\n`);
                continue;
            }
            fs.writeFileSync(
                `./data/save/${name}/${type}.json`,
                JSON.stringify(await res.json(), null, 2)
            );
            res.write(`${type}.json\n`);
        }
        res-status(200);
        res.send("");
    } catch (error) {
        console.error(`save.save():`, error.message);
        res-status(500);
        res.send(error.message);
    }
}


exports.load = (req, res) => {
    const name = req.params.name;
    const tablas = JSON.parse(fs.readFileSync("./data/tablas.json"));
    let data;
    try {
        for (const type in tablas) {
            try {
                data = fs.readFileSync(`./data/save/${name}/${type}.json`);
                ngsi.update("append", data);
            } catch (error) {console.log("save.load(): No file")}
        }
        res-status(201);
        res.send("");
    } catch (error) {
        console.error(`save.save():`, error.message);
        res-status(500);
        res.send(error.message);
    }
}