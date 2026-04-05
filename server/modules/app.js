//  app.js
const express = require("express");
const bodyParser = require('body-parser');
const http = require("http");

// Archivos
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Modulos
const dir = require("./dir.js");
const { http_logger } = require("./log.js");
const ngsi = require("./ngsi.js")
const sql = require("./sql.js")
const save = require("./save.js")

const MEDIAMTX_HOST = process.env.MEDIAMTX_HOST || "mediamtx";
const MEDIAMTX_PORT = Number(process.env.MEDIAMTX_PORT || 9997);

const app = express()

app.get(ngsi.URL+"montar/?*", (req, res) => {
  ngsi.montar();
  res.status(201);
  res.send("Check if worked");
});

app.get("/save/:name", save.save);
app.get("/load/:name", save.load);

app.use("/api/mediamtx", bodyParser.json());

// ## PROXY ## => MediaMTX control API
app.all("/api/mediamtx/*", (req, res) => {
  const path = req.params[0];
  const queryIndex = req.originalUrl.indexOf("?");
  const query = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
  const body = req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : "";

  const options = {
    hostname: MEDIAMTX_HOST,
    port: MEDIAMTX_PORT,
    path: `/${path}${query}`,
    method: req.method,
    headers: {
      Accept: req.headers.accept || "application/json",
    },
  };

  if (body) {
    options.headers["Content-Type"] = req.headers["content-type"] || "application/json";
    options.headers["Content-Length"] = Buffer.byteLength(body);
  }

  const proxyReq = http.request(options, (proxyRes) => {
    res.status(proxyRes.statusCode || 500);

    Object.entries(proxyRes.headers).forEach(([headerName, headerValue]) => {
      if (headerValue !== undefined) {
        res.setHeader(headerName, headerValue);
      }
    });

    proxyRes.pipe(res);
  });

  proxyReq.on("error", (error) => {
    console.error("Error proxy MediaMTX:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    } else {
      res.end();
    }
  });

  if (body) {
    proxyReq.write(body);
  }

  proxyReq.end();
});

// ## PROXY ## => localhost = [xtraserver, orion, mariadb, mongodb]
// ENVIAR xtraserver -> Orion  por el proxy
app.all("/v2/*", (req, res) => {
  ngsi.proxy(req, res)
}); // Esto no debe tener el middleware del bodyparser

// ## SQL ## => mariadb
// ENVIAR xtraserver -> MySQL prompt
app.get("/sql/:prompt", (req, res) => {
  console.log(`SQL=>{${req.params.prompt}}`)
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