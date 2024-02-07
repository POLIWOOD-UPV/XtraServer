const fs = require('fs');

exports.http_listdir =  (res) => {
  try {
    var dir = fs.readdirSync("./http");
    console.log("listdir:", dir)
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write(JSON.stringify(dir));
    res.end();
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
  "js":   "text/javascript"
}

exports.http_file = (res, url) => {
  try {
    var end = String(url).slice(String(url).search(/\w*$/));
    if (end == "") {
      res.writeHead(501, {"Content-Type": "text/plain"});
      res.write("Error 501: comand not implemented");
      res.end();
      return;
    }
    try {
      var data = fs.readFileSync("./http" + url);
    } catch (error) {
      console.error(`readFileSync(./http${url})`, error.message);
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("Error 404: File Not Found");
      res.end();
      return;
    }
    try {
      var c_type = content_types[end]
    } catch {
      res.writeHead(501, {"Content-Type": "text/plain"});
      res.write("Error 501: file-type not implemented");
      res.end();
      return;
    }
    res.writeHead(200, {"Content-Type": c_type});
    res.write(data);
    res.end();
  } catch (error) {
    console.error("http_file():", error.message);
    process.exit(1);
  }
}