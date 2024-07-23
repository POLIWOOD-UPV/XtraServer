const fs = require("fs");

exports.file = (req, res) => {
    var path = String(req.url).split(/[?#]/)[0];
    var query = new URLSearchParams(req.url);
    var code = 201;
    var msg = "";
    try {
        fs.writeFileSync("./http/" + path, "");
    } catch (error) {
        res.writeHead(404);
        res.write("Directory not Found");
        res.end();
        return;
    }
    try {
        req.on("data", (data) => {
            fs.appendFileSync("./http/" + path, data);
        })
        code = 201;
        msg = "File uploaded"
    } catch (error) {
        code = 202;
        msg = "Directory not Found"
    }
    req.on("end", () => {
        res.writeHead(code);
        res.write(msg);
        res.end();
    });
}

const upload = (req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on("end", () => {
        console.log("UPLOAD: ", body);

        const form = new URLSearchParams(body);
        const filename = form["File"];
        const data = form["Data"];
        var code = 201;
        var msg = "File Uploaded";
        
        try {
            fs.writeFileSync("./http/" + filename, data);
        } catch (error) {
            res.writeHead(404);
            res.write("Directory not Found \n" + String(error));
            res.end();
            return;
        }
        res.writeHead(code);
        res.write(msg);
        res.end();
    });
}

const guardar_vuelo = (req, res) => {
    var labels = JSON.parse(fs.readFileSync("./http/data/labels.json"));
    let body = "";
    req.on("data", (chunk) => {
        body += chunk;
    });
    req.on('end', () => {
        const form = new URLSearchParams(body);
        const client = new Object();
        const server = new Object();
        const object = new Object();
        for (const [key, value] of form) {
            client[key] = value;
        }
        const filename = `${client.Ronda}/${client.Equipo}.json`;

        try {
            let data = fs.readFileSync("./http/data/"+filename);
            let obj = JSON.parse(data);
            for (const key in obj) {
                server[key] = obj[key];
            }
        } catch (error) {
            labels.forEach(element => {
                server[element] = "";
            });
        }

        for (const key in server) {
            if (Object.hasOwnProperty.call(client, key)) {
                if (client[key] == null || client[key] == ""){
                    object[key] = (server[key] == "on")? "": server[key];
                } else { // Not checkbox
                    object[key] = client[key];
                }
            } else {
                object[key] = server[key];
            }
        }


        fs.writeFileSync("./http/data/"+filename, JSON.stringify(object, null, 2));
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`Form data saved to ${filename}`);
    });
}

const aux = (req, res) => {
    fs.writeFileSync("./http/post.txt", "");
    req.on("data", (data) => {
        fs.appendFileSync("./http/post.txt", data);
    })
    res.writeHead(201);
    res.end();
}

exports.commands = {
    "vuelo": guardar_vuelo,
    "upload": upload,
    "aux": aux,
};