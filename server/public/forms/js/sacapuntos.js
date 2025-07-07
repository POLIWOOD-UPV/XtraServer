// DOM
let rondaSel = document.querySelector("#ronda");
let equipoSel = document.querySelector("#equipo");
let resultado = document.getElementById("resultado");

const socket = io();

// Arrays de datos
let fichas = [] 
let vuelos = []
let equipos = []
let rondas = []
let cronos = []

function decide(val, a, b){
    return val === true ? b :
           val === false ? a : "unknown";
}

function mostrarDatos(){
    // Cogemos la ronda y equipo a buscar
    let ronda = parseInt(document.querySelector("#ronda").value);
    let equipo = parseInt(document.querySelector("#equipo").value);
    
    // que la ficha coincida en ronda y equipo
    let ficha = fichas.find(f => f.ronda === ronda && f.equipo === equipo);
    // que el vuelo coincida en ronda y equipo
    let vuelo = vuelos.find(v => v.ronda === ronda && v.equipo === equipo);
    // que equipo estamos analizando
    let dorsal = equipoSel.value;
    let texto = equipoSel.options[equipoSel.selectedIndex].text;
    let nombre = texto.split(" - ")[1];

    if (!ficha && !vuelo) {
    resultado.innerHTML = `<h2>No hay registros de ${nombre} en la Ronda ${ronda}</h2>`;
    return;
    }

    // Metemos como innerHTML el resultado
    resultado.innerHTML = `
    <h2>Resultados de ${dorsal} - ${nombre} en Ronda ${ronda}</h2>
    <p><strong>Requested Payload:</strong> ${ficha?.carga ?? "?"} ml</p>
    <p><strong>Unloaded Payload:</strong> ${vuelo?.carga ?? "?"} ml</p>
    <p><strong>Time Circuit:</strong> ${getTiempo("Circuito", ronda, equipo)} </p>
    <p><strong>Time Glide:</strong> ${getTiempo("Planeo", ronda, equipo)} </p>
    <p><strong>Time Load:</strong> ? seconds (to be implemented)</p>
    <p><strong>Altitude:</strong> ${vuelo?.altura ?? "?"} m</p>
    <p><strong>Pilot:</strong> ${decide(ficha?.piloto, "external pilot", "team pilot")}</p>
    <p><strong>Legal Flight:</strong> ${decide(vuelo?.nulo, "legal", "not legal")}</p>
    <p><strong>Good Landing:</strong> ${decide(vuelo?.aterrizaje, "crash landing", "good landing")}</p>
    <p><strong>Replacement Parts:</strong> ${decide(ficha?.repuestos, "replacements not used", "replacements used")}</p>
    <p><strong>Takeoff Distance:</strong> ${["60m", "40m", "20m", "15m"][ficha?.despegue ?? 0]}</p>
    `;


};

async function cargarDatos(){
    // el promise all lo que hace es que espera muchas promesas a la vez
    [fichas, vuelos, equipos, rondas, cronos] = await Promise.all([
        fetch("/v2/entities/?type=Ficha&options=keyValues").then(res => res.json()),
        fetch("/v2/entities/?type=Vuelo&options=keyValues").then(res => res.json()),
        fetch("/v2/entities/?type=Equipo&options=keyValues").then(res => res.json()),
        fetch("/v2/entities/?type=Ronda&options=keyValues").then(res => res.json()),
        fetch("/v2/entities/?type=Crono&options=keyValues").then(res => res.json()),
    ]);

    // Creamos las rondas
    rondas.forEach(r => {
        let opt = document.createElement("option");
        opt.value = r.num;
        opt.innerText = `Ronda ${r.num}`;
        rondaSel.appendChild(opt);
    });

    // Creamos los equipos
    equipos.forEach(e => {
        let opt = document.createElement("option");
        opt.value = e.dorsal;
        opt.innerText = `${e.dorsal} - ${e.name}`;
        equipoSel.appendChild(opt);
    });

    // Hacemos quse se actualice automaticamente cuando selecciones uno
    rondaSel.onchange = mostrarDatos;
    equipoSel.onchange = mostrarDatos;
};

// cada vez que llegue una actualizacion, recargamos los datos
socket.on("message", async (msg) => {
    console.log("socket:", msg);
    if (msg.includes("Ficha") || msg.includes("Vuelo")) {
        await cargarDatos();     // recargamos todos los datos
        mostrarDatos();          // refrescamos la vista activa
    }
});

// Buscar cronos por ronda y equipo
const getTiempo = (tipo) => {
    let crono = cronos.find(c => c.ronda === ronda && c.equipo === equipo && c.tipo === tipo);
    return crono ? ((crono.stop - crono.start) / 1000).toFixed(2) + " s" : "?";
};

window.addEventListener("DOMContentLoaded", cargarDatos);