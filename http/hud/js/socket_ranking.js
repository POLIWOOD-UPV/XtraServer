// Iniciamos el socket
const socket = io();

socket.on("ranking",(info) =>{
    console.log("En el socket ranking, info recibida:")
    console.log(info)
    comando = info.shift()
    switch (comando){
        case "message":
            msj = info[0]
            console.log(msj)
            break;
        case "apaDina":
            aparicionDinamica();
            break;
        case "desDina":
            desaparicionDinamica();
            break;
        case "rankMov":
            rankingMov();
            break;
        case "vacPilo":
            vaciarPilotos();
            break;
        case "sumPil":
            // info = [piloto, pos, tiempo, peso, estado,despegue]
            sumaPiloto(info[0], info[1], info[2], info[3], info[4],info[5]);
            break;
        case "quiPil":
            //info = [estado,pos]
            quitaPiloto(info[0],info[1])
            break;
        case "mosTem":
            mostrarTiempo();
            break;
        case "mosPeso":
            mostrarPeso();
            break;
        case "logVis":
            logos_visibles = info[0]
            ocultarLogos();
            break;
        case "desVis":
            despegues_visibles = info[0]
            ocultarDespegue()
            break;
        case "camRon":
            cambiarRonda(info[0]);
            break;
        case "mosDor":
            dorsal_visible = info[0]
            mostrarDorsal();
            break;
        default:
            console.log("En el default de Ranking")
    };
});


