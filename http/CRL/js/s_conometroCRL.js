////////////////////////////////////////////////////
// Funciones del socket del control del conometro  //
////////////////////////////////////////////////////

// Inicializamos el socket
const socket = io();

// utilizamos la variable de clase RondaEquipo.js

const c_start = (tiempo_inicial) => {
    let info = [
        rondaEquipo.ronda, 
        rondaEquipo.equipo, 
        "start", 
        tiempo_inicial
    ];
    socket.emit("all", "conometro", info);
}

const c_pause = (tiempo_trnascurrido) => {
    let info = [
        rondaEquipo.ronda, 
        rondaEquipo.equipo, 
        "pause",
        tiempo_trnascurrido
    ];
    socket.emit("all", "conometro", info);
}

const c_reset = () => {
    let info = [
        rondaEquipo.ronda, 
        rondaEquipo.equipo, 
        "reset"
    ];
    socket.emit("all", "conometro", info);
}

const c_set = (value) => {
    let info = [
        rondaEquipo.ronda, 
        rondaEquipo.equipo, 
        "set",
        value
    ];
    socket.emit("all", "conometro", info);
}

const c_update = (tiempo_trnascurrido) => {
    let info = [
        rondaEquipo.ronda, 
        rondaEquipo.equipo, 
        "update", 
        tiempo_trnascurrido
    ];
    socket.emit("all", "conometro", info);
}