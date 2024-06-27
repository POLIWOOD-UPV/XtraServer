const fs = require("fs");

exports.file = (req, res) => {
    var path = String(req.url).split(/[?#]/)[0];
    var query = new URLSearchParams(req.url);
    if (path == "/form.txt") {
        res.writeHead(200);

        fs.writeFileSync("./http/" + path, "");

        req.on("data", (data) => {
            console.log("POSTdata: "+ data)
            fs.appendFileSync("./http/" + path, data);
        })
        res.end();
    } else {
        res.writeHead(400);
        res.write('');
        res.end();
    }
}

exports.commands = {};