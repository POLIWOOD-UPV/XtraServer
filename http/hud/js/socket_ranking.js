// Iniciamos el socket
const socket = io();

// Funcion de test 
socket.on("message", (msj) => {
    console.log(msj)
});
// Dinamicas

socket.on("apaDina", () => {
    aparicionDinamica();
});

socket.on("desDina", () => {
    desaparicionDinamica();
});

socket.on("rankMov", () => {
    rankingMov();
});


//Pilotos
socket.on("vacPilo", () => {
    vaciarPilotos();
});

socket.on("sumPil", (info) => {
    // info = [piloto, pos, tiempo, peso, estado]
    sumaPiloto(info[0], info[1], info[2], info[3], info[4]);
});

socket.on("quiPil",(info)=>{
    //info = [estado,pos]
    quitaPiloto(info[0],info[1])
})

// Filas
socket.on("mosTmpo",()=>{
    mostrarTiempo();
});

socket.on("mosPeso",()=>{
    mostrarPeso();
});