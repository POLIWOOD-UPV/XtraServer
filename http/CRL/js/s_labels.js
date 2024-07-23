const socket = io();

var dorsal_equipo_info = document.getElementById("equipo_elegido_info");
dorsal_equipo_info.addEventListener("change", () => {
    socket.emit("all", "dorsal_info", dorsal_equipo_info.value);
});


var dorsal_equipo_vuelo = document.getElementById("equipo_elegido_vuelo-carga");
dorsal_equipo_vuelo.addEventListener("change", () => {
    socket.emit("all", "dorsal_info", dorsal_equipo_vuelo.value);
});