//
// http_server
//
const fs = require("fs");
const hash = require("./hash")

var control_hash = hash.hex(fs.readFileSync("../fast_com/control.json"));

const fast_get = (res) => {
  try {
    var data = fs.readFileSync("../fast_com/control.json");
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(data);
    res.end();
  } catch (error) {
    console.error("fast_get():", error.message);
    process.exit(1);
  }
}

const fast_post = (req, res) => {
  try {
    var body = ''
    req.on('data', function(data) {
      body += data;
    })
    req.on('end', function() {
      control_hash = hash.hex(body);
      fs.writeFileSync("../fast_com/control.json", body);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end('post received');
      console.log("New control: " + control_hash);
    })
  } catch (error) {
    console.error("fast_post():", error.message);
    process.exit(1);
  }
}

var fast_server = http.createServer((req, res) => {
  fs.appendFileSync("../logs/log.csv",req.method + ";" + req.url + "\n");
  if (req.method === "GET") {
    if (req.url != "/" + control_hash) {
      fast_get(res);
    } else {
      res.writeHead(204, {"Content-Type": 'text/html'});
      res.end("no new data");
    }
  } if (req.method === "POST") {
    fast_post(req, res);
  }
  res.writeHead(501, {"Content-Type": "text/plain"});
  res.write("Error 501: method not implemented");
  res.end();
});

const FAST_SERVER_PORT = 7010;

fast_server.listen(FAST_SERVER_PORT, function () {
  console.log("Servidor de control listo en el puerto:", FAST_SERVER_PORT);
});

exports.port = FAST_SERVER_PORT;