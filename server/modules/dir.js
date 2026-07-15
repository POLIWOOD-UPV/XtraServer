const fs = require('fs')
const path = require("path")
const URL = require("url")

const DIR = "public";
exports.DIR = DIR;

exports.listDir = (url) => {
  url = url.replace(/\\/g, "/");

  const dir = fs.readdirSync(path.join(DIR, url));

  return dir
    .filter(element =>
      !element.startsWith(".") &&
      element !== "css" &&
      element !== "js"
    )
    .map(element => ({
      name: element,
      isDirectory: element.search("\\.") === -1
    }));
};

exports.http_listdir = (res, url, basePath = "/browse") => {
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  try {
    url = url.replace(/\\/g, '/');
    const files = exports.listDir(url);
    const parts = url.split("/");
    let parent = parts.slice(0, -2).join("/") || "/";

    // Aseguramos que el padre empiece y termine con "/"
    if (!parent.startsWith("/")) {
      parent = "/" + parent;
    }
    if (!parent.endsWith("/")) {
      parent = parent + "/";
    }

    // Iniciamos el archivo
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write('<html><head><title>Menu</title><style>a{font-size: 1cm;}</style></head><body style="flex-direction:column;display:flex;">');

    // Solo mostrar padre si no estamos en /
    if (url !== "/") {
      res.write("<a href='" + base + "/'>Volver al inicio </a>");
      res.write("<a href='" + base + parent + "'>.. (" + parent + ")</a>");
    }

    // Aseguramos que acabe en /
    const urlFixed = url.endsWith("/") ? url : url + "/";

    files.forEach(file => {

      let text = file.name;
      let encodedElement;

      if (file.isDirectory) {
        text += "/";
        encodedElement = encodeURIComponent(file.name) + "/";
      } else {
        encodedElement = encodeURIComponent(file.name);
      }

      const elementUrl = base + urlFixed + encodedElement;

      res.write(`<a href="${elementUrl}">${text}</a>`);

    });
    
    
    res.end('</body></html>');
    
  } catch (error) {
    console.error("http_listdir():", error.message);
    process.exit(1);
  }
}

/*
  application/json 
  application/xml   
  application/zip
  application/pdf
  image/gif   
  image/jpeg
  image/png 
  image/svg+xml
  text/css    
  text/csv    
  text/html    
  text/javascript   
  text/plain    
  text/xml
  video/mpeg
  video/mp4
  video/webm
*/

const content_types = {
  "mpeg": "video/mpeg",
  "mp4":  "video/mp4",
  "webm": "video/webm",
  "gif":  "image/gif",
  "jpg":  "image/jpeg",
  "jepg": "image/jpeg",
  "png":  "image/png",
  "ico":  "image/x-icon",
  "svg":  "image/svg+xml",
  "pdf":  "application/pdf",
  "zip":  "application/zip",
  "json": "application/json",
  "csv":  "text/csv",
  "txt":  "text/plain",
  "xml":  "text/xml",
  "html": "text/html",
  "css":  "text/css",
  "js":   "text/javascript",
  "sdp":  "text/plain",
  "bat":  "text/plain"
}

exports.http_file = (res, url) => {
  var parse = URL.parse(url);
  var url = parse.pathname;
  try {
    var end = String(url).slice(String(url).search(/\w*$/));
    if (end == "") {
      res.writeHead(501, {"Content-Type": "text/plain"});
      res.write("Error 501: comand not implemented");
      res.end();
      return;
    }
    try {
      var data = fs.readFileSync("./" + DIR + url);
    } catch (error) {
      console.error(`readFileSync(./${DIR}${url})`, error.message);
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("Error 404: File Not Found");
      res.end();
      return;
    }
    var c_type = content_types[end];
    if (c_type == null) {
      // TODO: DOWLOAD FILE #################################################################
      return;
    }
    res.writeHead(200, {"Content-Type": c_type});
    res.write(data);
    res.end();
  } catch (error) {
    console.error(`http_file(${url}):`, error.message);
    process.exit(1);
  }
}