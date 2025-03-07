const fs = require('fs');

// Función para obtener la fecha actual en formato dd/mm/aaaa
const formatFecha = (date = new Date()) => {
  const dia = date.getDate().toString().padStart(2, '0');
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const año = date.getFullYear();
  return `${dia}/${mes}/${año}`;
};

// Función para obtener la hora actual en formato hh:mm:ss
const formatHora = (date = new Date()) => {
  const hora = date.getHours().toString().padStart(2, '0');
  const minutos = date.getMinutes().toString().padStart(2, '0');
  const segundos = date.getSeconds().toString().padStart(2, '0');
  return `${hora}:${minutos}:${segundos}`;
};

// Función para obtener la temperatura de la CPU (simulado)
const readTemp = () => {
  const path = '/sys/class/thermal/thermal_zone0/temp';
  try {
    return Number(fs.readFileSync("/sys/class/thermal/thermal_zone0/temp"))
  } catch (error) {
    console.error("readTemp():", error.message);
    process.exit(1);
  }
};

// Función para obtener la memoria total de la Raspberry Pi en MB
const readMem = () => {
    const extraerValor = (linea) => {
        const partes = linea.split(/\s+/);
        return parseInt(partes[1], 10);
      };
    const path = '/proc/meminfo';
    try {
        texto = fs.readFileSync("/proc/meminfo");      

        res_to_string = String(texto)
        var res_split = res_to_string.split("\n");

        var linea0 = res_split[0].split(" ").reverse();
        let memTotal = linea0[1];

        return Number(memTotal);

      } catch (error) {
        console.error("readMem():", error.message);
        process.exit(1);
      }
};

exports.respondTemp = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("Temperatura de la CPU " + readTemp() + " ºC\n");
    res.end();
  } catch (error) {
    console.error("respondTemp():", error.message);
    process.exit(1);
  }
}

exports.respondMem = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("Memdoria Disponible " + (readMem()/1000).toFixed(0) + " MB\n");
    res.end();
  } catch (error) {
    console.error("respondMem():", error.message);
    process.exit(1);
  }
}

exports.respondFecha = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("Fecha actual " + formatFecha() + "\n");
    res.end();
  } catch (error) {
    console.error("respondFecha():", error.message);
    process.exit(1);
  }
}

exports.respondHora = (res) => {
  try {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("Hora actual " + formatHora() + "\n");
    res.end();
  } catch (error) {
    console.error("respondHora():", error.message);
    process.exit(1);
  }
}