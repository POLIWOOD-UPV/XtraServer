/*
Servidor basado en mi proyecto final de Intera mezclado con el de Xtra2 del anyo pasado
*/
// Web
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Modulos
const dir = require('./modules/dir');
const socket_events = require("./modules/socket_events");

// Archivos
const path = require("path");
const fs = require("fs");
const multer  = require('multer');

// Inicializar servidor y app
const PORT = 80;
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  socket_events.connect(socket);
  console.log("Conexion desde:", socket.conn.id);

  socket.on("disconnect", () => socket_events.disconnect(socket));

  socket.on("message", (msj) => {
    console.log(`Mensaje ${msj} de ${socket.conn.id}`)
    socket_events.events["message"](socket, msj);
  });
});


// Subir archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, dir.DIR+'/uploads/');  // donde se guardan los archivos
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// APLICACIÓN
// Mandar archivos estáticos a los clientes
app.use(express.static(__dirname));

// Ruta para subir archivos
app.post('/upload', upload.single('file'), (req, res) => {
  // req.file contiene la información del archivo subido
  console.log(req.file);
  res.send("<p>Archivo subido correctamente</p><br><a href='/subir.html'>Subir otro archivo </a><br><a href='/'>Volver al inicio </a>");
});

// Servir directorios y archivos
app.use((req, res) => {
  try {
    const urlPath = path.normalize(req.path); // para trabajar los archivos
    const fullPath = path.join(__dirname, dir.DIR, urlPath); // para hacer comprobaciones

    // ¿Nos está pidiendo algo de http/?
    if (!fullPath.startsWith(path.join(__dirname, dir.DIR))) {
      return res.status(403).send("Fuera de la carpeta http!");
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

// Servidor HTTP
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
