////////////////////////////////////////////////////
// Funciones del socket del control del conometro  //
////////////////////////////////////////////////////

// Inicializamos el socket
const socket = io();

// utilizamos la variable de clase RondaEquipo.js

const c_start = (tiempo_inicial) => {
    let prueba = document.getElementById("prueba").value;
    let info = [
        rondaEquipo.ronda, 
        rondaEquipo.equipo, 
        prueba,
        "start", 
        tiempo_inicial
    ];
    socket.emit("all", "cronometro", info);
}

const c_pause = (tiempo_trnascurrido) => {
    let prueba = document.getElementById("prueba").value;
    let info = [
        rondaEquipo.ronda, 
        rondaEquipo.equipo,
        prueba, 
        "pause",
        tiempo_trnascurrido
    ];
    socket.emit("all", "cronometro", info);
}

const c_reset = () => {
    let prueba = document.getElementById("prueba").value;
    let info = [
        rondaEquipo.ronda, 
        rondaEquipo.equipo,
        prueba, 
        "reset"
    ];
    socket.emit("all", "cronometro", info);
}

const c_set = (value) => {
    let prueba = document.getElementById("prueba").value;
    let info = [
        rondaEquipo.ronda, 
        rondaEquipo.equipo, 
        prueba,
        "set",
        value
    ];
    socket.emit("all", "cronometro", info);
}

const c_update = (tiempo_trnascurrido) => {
    let prueba = document.getElementById("prueba").value;
    let info = [
        rondaEquipo.ronda, 
        rondaEquipo.equipo, 
        prueba,
        "update", 
        tiempo_trnascurrido
    ];
    socket.emit("all", "cronometro", info);
}