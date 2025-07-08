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
const sql = require("./sql.js")

const app = express()

// ## PROXY ## => localhost = [xtraserver, orion, mariadb, mongodb]
// ENVIAR xtraserver -> Orion  por el proxy
app.all("/v2/*", (req, res) => {
  ngsi.proxy(req, res)
}); // Esto no debe tener el middleware del bodyparser

// ## SQL ## => mariadb
// ENVIAR xtraserver -> MySQL prompt
app.get("/sql/[:prompt]", (req, res) => {
  sql.prompt(req, res)
}); // Esto no debe tener el middleware del bodyparser

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

// NGSI

// RECIBIR Orion -> xtraserver
// Recibe las notificaciones subscripcion de NGSI classificadas por accion
app.post(ngsi.URL+":action", (req, res) => {
  ngsi.recv(req, res, req.params.action);
});

// APLICACION
// Servir ficheros estaticos
app.use(express.static(__dirname));

// para acceder al sistema de tablas
app.get("/tablas/?", (req, res) => {
  http_logger.log(req);
  try {
    const urlPath = path.normalize("./data/tablas.json"); // para trabajar los archivos
    const fullPath = path.join(__dirname, "..", urlPath);
    res.sendFile(fullPath);
  } catch (err) {
    console.error("Error en middleware:", err);
    res.status(500).send("Internal Server Error");
  }
});

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