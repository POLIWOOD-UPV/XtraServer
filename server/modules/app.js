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

const app = express()

const MEDIAMTX_API_HOST = process.env.MEDIAMTX_API_HOST || "mediamtx";
const MEDIAMTX_API_PORT = Number(process.env.MEDIAMTX_API_PORT || 9997);

app.get(ngsi.URL+"montar/?*", (req, res) => {
  ngsi.montar();
  res.status(201);
  res.send("Check if worked");
});

app.get("/save/:name", save.save);
app.get("/load/:name", save.load);

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

// PROXY API MediaMTX
// Evita problemas de CORS y centraliza las llamadas del front.
app.all("/api/mediamtx/*", (req, res) => {
  const proxyPath = req.originalUrl.replace(/^\/api\/mediamtx/, "") || "/";
  const hasBody = req.body && Object.keys(req.body).length > 0;
  const body = hasBody ? JSON.stringify(req.body) : "";

  const options = {
    hostname: MEDIAMTX_API_HOST,
    port: MEDIAMTX_API_PORT,
    path: proxyPath,
    method: req.method,
    headers: {
      Accept: req.headers.accept || "application/json",
      "Content-Type": req.headers["content-type"] || "application/json",
      ...(body ? { "Content-Length": Buffer.byteLength(body) } : {})
    }
  };

  const proxyReq = http.request(options, proxyRes => {
    let data = "";

    proxyRes.on("data", chunk => {
      data += chunk;
    });

    proxyRes.on("end", () => {
      res.status(proxyRes.statusCode || 502);

      if (proxyRes.headers["content-type"]) {
        res.set("Content-Type", proxyRes.headers["content-type"]);
      }

      if (!data) {
        res.end();
        return;
      }

      res.send(data);
    });
  });

  proxyReq.on("error", error => {
    console.error("Error proxy MediaMTX:", error.message);
    res.status(500).json({ error: error.message });
  });

  if (body) proxyReq.write(body);
  proxyReq.end();
});

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

app.get("/api/puntos", async (req, res) => {
  try {
    const response = await fetch("https://public.xc26.didev.es/json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching puntos:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// APLICACION
// Servir ficheros estaticos
app.use(express.static(path.join(__dirname, "../public")));

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

// Index home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/index.html"));
});


// Ruta general -> listdir
// app.use((req, res) => {
//   http_logger.log(req);
//   try {
//     const urlPath = path.normalize(req.path); // para trabajar los archivos
//     const fullPath = path.join(__dirname, '..', dir.DIR, urlPath);
//     // Es algo de public?
//     if (!fullPath.startsWith(path.join(__dirname, '..', dir.DIR))) {
//       return res.status(403).send(`Fuera de la carpeta ${dir.DIR}!`);
//     }
    
//     // Existe?
//     if (fs.existsSync(fullPath)) {
//       // Directorio -> listdirs
//       if (fs.statSync(fullPath).isDirectory()) {
//         dir.http_listdir(res, urlPath);
//       // Archivo -> Servir
//       } else {
//         res.sendFile(fullPath);
//       }
//     // No existe
//     } else {
//       res.status(404).send("404 Not Found");
//     }
//   } catch (err) {
//     console.error("Error en middleware:", err);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.get("/browse", (req, res) => {
  handleBrowse(req, res, "/");
});
app.get("/browse/*", (req, res) => {
  const subPath = "/"+req.params[0];
  handleBrowse(req, res, subPath);
});

function handleBrowse(req, res, subPath) {
  http_logger.log(req);
  try {
    const publicRoot = path.join(__dirname, '..', dir.DIR);
    const urlPath = path.normalize(subPath);
    const fullPath = path.join(publicRoot, urlPath);
    if (!fullPath.startsWith(publicRoot)) {
      return res.status(403).send("Ruta fuera de public");
    }
    if (!fs.existsSync(fullPath)) {
        return res.status(404).send("404 Not Found");
    }
    if (fs.statSync(fullPath).isDirectory()) {
      dir.http_listdir(res, urlPath, "/browse");
      return;
    }
    res.sendFile(fullPath);
  } catch (err) {
    console.error("Error en browse:", err);
    res.status(500).send("Internal Server Error");
  }
}

app.post("/xtra2", async (req, res) => {
  http_logger.log(req);
  const data = req.body || {};
  let entidad;

  // Permite enviar la entidad NGSI ya construida desde cliente.
  if (data.id && data.type) {
    entidad = { ...data };
    if (!entidad.fix && entidad.fixGPS) {
      entidad.fix = entidad.fixGPS;
      delete entidad.fixGPS;
    }
  } else if (data.clase === "PosVueloXtra2") {
    entidad = {
      id: "urn:ngsi-ld:PosVuelo:001",
      type: "PosVuelo",
      ronda: { type: "Number", value: Number(data.ronda ?? 0) },
      dorsal: { type: "Number", value: Number(data.dorsal ?? 0) },
      lat: { type: "Float", value: Number(data.lat ?? 0.0) },
      lon: { type: "Float", value: Number(data.lon ?? 0.0) },


      /* Aceleraac
      
      ax -> Aceleración en el eje X (adelante-atrás)m/s**2
      ay -> Aceleración en el eje Y (izquierda-derecha)m/s**2
      az -> Aceleración en el eje Z (arriba-abajo) m/s**2

      Hasta -8 a 8, ya no es 4
      */
      ax : { type: "Float", value: Number(data.ax ?? 0.0) },
      ay : { type: "Float", value: Number(data.ay ?? 0.0) },
      az : { type: "Float", value: Number(data.az ?? 0.0) },
      altura: { type: "Float", value: Number(data.altura ?? 0.0) },

      // fix es que hay señal GPS o no, no la precisión, así que lo guardamos como string para evitar confusiones. Si no hay fix, se guarda "No fix", si hay fix se guarda "Fix" o el valor que venga.
      /* 
      No fix -> No hay señal
      Fix 2D -> Señal GPS 2D (lat, lon)
      Fix 3D -> Señal GPS 3D (lat, lon, alt) MEJOR
      */
      fix: { type: "String", value: String(data.fix ?? data.fixGPS ?? "No fix") }

      // Posbile: Temperatura del aire dentro de la caja

    };
  } else if (data.clase === "PuntosXtra2") {
    entidad = {
      id: "urn:ngsi-ld:PuntosXtra2:001",
      type: "PuntosXtra2",
      ronda: { type: "Number", value: Number(data.ronda ?? 0) },
      dorsal: { type: "Number", value: Number(data.dorsal ?? 0) },
      puntos: { type: "Number", value: Number(data.puntos ?? 0) }
    };
  } else {
    return res.status(400).json({
      error: "Formato no reconocido",
      clase: data.clase,
      clasesValidas: ["PosVueloXtra2", "PuntosXtra2"],
      requerido: "Enviar id+type (entidad NGSI) o clase válida"
    });
  }

  try {
    const ngsiRes = await ngsi.update("update", [entidad]);
    const details = await ngsiRes.text();

    if (!ngsiRes.ok) {
      return res.status(ngsiRes.status).json({
        error: "Error actualizando entidad Xtra2",
        details
      });
    }

    return res.status(200).json({
      ok: true,
      updated: entidad.type,
      details: details || "OK"
    });
  } catch (error) {
    console.error("/xtra2:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/html/upload.html"));
});

module.exports = app