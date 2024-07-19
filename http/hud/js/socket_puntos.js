const socket = io()
socket.on("puntos",(info) =>{
    console.log("En el socket puntos, info recibida:")
    console.log(info)
    comando = info.shift()
    switch (comando){
        case "message":
            msj = info[0]
            console.log(msj)
            break;
        // Dinamicas
        case "apaDina":
            aparicionDinamica();
            break;
        case "desDina":
            desaparicionDinamica();
            break;
        case "rankMov":
            rankingMov();
            break;
        // Pilotos
        case "vacPilo":
            vaciarPilotos();
            break;
        case "sumPil":
            // info = [piloto, pos, puntos,estado]
            sumaPiloto(info[0], info[1], info[2],info[3]);
            break;
        case "quiPil":
            //info = [estado,pos]
            quitaPiloto(info[0],info[1])
            break;
        // Informativos
        case "mosPes":
            mostrarPuntos();
            break;
        case "logVis":
            logos_visibles = info[0]
            ocultarLogos();
            break;
        case "mosDor":
            dorsal_visible = info[0]
            mostrarDorsal();
            break;
            default:
                console.log("En el default de Puntos")
    };
});
