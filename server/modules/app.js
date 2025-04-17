//  app.js
const express = require("express");
const bodyParser = require('body-parser');

// Archivos
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Modulos
const dir = require("./dir");
const { http_logger } = require("./log");
const ngsi = require("./ngsi.js")

const app = express()

// Leer JSONS de los request (ngsi)
app.use(bodyParser.json());

// SUBIR ARCHIVOS
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, dir.DIR+'/uploads/');  // donde se guardan los archivos
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });
  const upload = multer({ storage: storage });
  
// Ruta upload
app.post('/upload', upload.single('file'), (req, res) => {
    http_logger.log(req);
    console.log(req.file);
    res.send("<p>Archivo subido correctamente</p><br><a href='/subir.html'>Subir otro archivo</a><br><a href='/'>Volver al inicio</a>");
  });



/*

NGSI
## PROXY ## => localhost = [xtraserver, orion, mariadb, mongodb]
all("xtraserver:80/v2/entities*") => "orion:1026/v2/entities*"
all("xtraserver:80/v2/subscriptions*") => "orion:1026/v2/subscriptions*"
all("xtraserver:80/op/update/?") => "orion:1026/op/update/?" R: he cambiado el ? por *
*/


// ENVIAR xtraserver -> Orion  por el proxy
app.all(["/v2/entities*", "/v2/subscriptions*", "/v2/op/update/*"], (req, res) => {
  ngsi.proxy(req, res)
});


// RECIBIR Orion -> xtraserver
// Recibe las notificaciones subscripcion de NGSI classificadas por accion
app.post(ngsi.URL+":action", (req, res) => {
  ngsi.recv(req, res, req.params.action)
});

// APLICACION
// Servir ficheros estaticos
app.use(express.static(__dirname));

// Ruta general -> listdir
app.use((req, res) => {
  http_logger.log(req);
  try {
    const urlPath = path.normalize(req.path); // para trabajar los archivos
    const fullPath = path.join(__dirname, '..', dir.DIR, urlPath);
    // Es algo de public?
    if (!fullPath.startsWith(path.join(__dirname, '..', dir.DIR))) {
      return res.status(403).send(`Fuera de la carpeta ${dir.DIR}!`);
    }
    
    // Existe?
    if (fs.existsSync(fullPath)) {
      // Directorio -> listdirs
      if (fs.statSync(fullPath).isDirectory()) {
        dir.http_listdir(res, urlPath);
      // Archivo -> Servir
      } else {
        res.sendFile(fullPath);
      }
    // No existe
    } else {
      res.status(404).send("404 Not Found");
    }
  } catch (err) {
    console.error("Error en middleware:", err);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = app