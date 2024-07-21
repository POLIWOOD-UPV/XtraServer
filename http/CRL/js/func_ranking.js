/////////////////////////////////////////////////////////////
// Funciones del base del control de ranking              //
/////////////////////////////////////////////////////////////

// Cogemos los botones
var boton_tiempo = document.getElementById("mostrar_tiempo_id");
var boton_peso = document.getElementById("mostrar_peso_id");
var boton_cambiazo = document.getElementById("cambiazoPesoTiempos")
let bot_despegues = document.querySelector("#ocultar_despegue_id")
let rondaSelect = document.getElementById("server_ronda_id");
// Botón para cargar datos de la ronda específica
document.getElementById("cargaRondasServerBot").addEventListener("click", cargarRondaServer);
// Flags
let peso_visible = false;
let tiempo_visible = true;
let despes_visibles = true;

const rondaEquipo = new RondaEquipo("rondaSelect", "equipoSelect");

// Coger los tiempos del input
function cogerTiempo_Peso(que) {
    switch (que) {
        case "min":
            // Coger Minutos
            minutos = document.getElementById("minutos_input_id").value;
            return validarNumero(minutos) ? parseInt(minutos) : 0;

        case "seg":
            // Coger segundos
            segundos = document.getElementById("segundos_input_id").value;
            return validarNumero(segundos) ? parseInt(segundos) : "00";

        case "mil":
            // Coger milis
            milis = document.getElementById("milisegundos_input_id").value;
            milis = String(milis * 0.001).split(".")
            milis = milis[1]
            console.log("milis " + milis)
            return validarNumero(milis) ? (milis.slice(0, 3)[0]) : "0";
        case "pes":
            // Coger el peso
            peso = document.getElementById("peso_input_id").value
            console.log(validarNumero(peso))
            return validarNumero(peso) ? parseFloat(peso) : 0;
    }
}
// Crea la fila de control        
function FilaControlResta(piloto,tiempo,pos){
    // Creamos la fila con sus partes
    let fila_borrar = document.createElement("div")
    fila_borrar.className = "fila_control_borrar"
    
    // Ponemos el nombre
    let nombre = document.createElement("div")
    nombre.textContent = piloto
    nombre.className = "nombre_control"
    fila_borrar.append(nombre)

    // Para borrar
    //Ponemos el boton de eliminar animado
    let botoncin = document.createElement("button")
    botoncin.id = pos+"c_AN" // Le ponemos el id con la posicion en la que esta para luego poder quitarlo al borrar el piloto

    botoncin.onclick = () => {
        s_quitaPiloto('animado',botoncin.id) // Le pasamos la ID ya que es lo que lleva en que pos estamos 
    };
    botoncin.textContent = "BORRAR_An"
    botoncin.className = "boton_control"
    fila_borrar.append(botoncin)

    //Ponemos el boton de eliminar seco
    let botoncin2 = document.createElement("button")
    botoncin2.id = pos+"c" // Le ponemos el id con la posicion en la que esta para luego poder quitarlo al borrar el piloto

    botoncin2.onclick = () => {
        s_quitaPiloto('seco',botoncin2.id); // Le pasamos la ID ya que es lo que lleva en que pos estamos 
    };
    botoncin2.textContent = "BORRAR"
    botoncin2.className = "boton_control"
    fila_borrar.append(botoncin2)


    // Ponemos el tiempo del piloto
    let tiempin = document.createElement("div")
    tiempin.className = "tiempo_control"
    tiempin.textContent = tiempo
    fila_borrar.append(tiempin)


    //Ponemos la fila en BORRAR al final y luego lo reordenamos todo y nos da igual ya que no se va a ver
    pilotos_control_resta.append(fila_borrar)

    // Lo reordenamo
    arreglar_pos_control(pos)
}

// Ordena las filas de control 
function ordenar_control() {
    var tiempos_ord_cont = [];
    // Obtener los tiempos de todas las filas
    Array.from(filas_control).forEach(fila => {
        let tiempo = fila.querySelector(".tiempo_control").textContent;
        let tiempoEnSegundos = convertirTiempoAMilisegundos(tiempo);
        tiempos_ord_cont.push(tiempoEnSegundos);
    });
    // Ordenar los tiempos
    let tiemposOrdenados = [...tiempos_ord_cont].sort((a, b) => a - b);
    // Los tiempos salen bien ordenados

    // Reordenar las filas en base a los tiempos ordenados
    Array.from(filas_control).forEach((fila, index) => {
        let tiempoFila = convertirTiempoAMilisegundos(fila.querySelector(".tiempo_control").textContent);
        let nuevaPosicion = tiemposOrdenados.indexOf(tiempoFila) + 1; // Agregar 1 ya que las posiciones comienzan desde 1
        console.log("Posicion que va al order: "+nuevaPosicion)
        // ESTA LINEA ES UNA BENDICION LA AMO
        fila.style.order = nuevaPosicion; // Establecer el orden con CSS CSS 
    });
    
}

// convertir tiempo a milisegundos
function convertirTiempoAMilisegundos(tiempo) {
    if (tiempo === '-:-:-') {
        return Number.MAX_SAFE_INTEGER; // Un valor muy alto para asegurar que se posicionen al final
    }
    let partes = tiempo.split(':');
    let minutos = Number(partes[0]) * 60;
    let segundos = Number(partes[1]);
    let milisegundos = Number(partes[2]);
    return minutos + segundos + milisegundos;
}
// convertir tiempo a milisegundos
function convertirMilisegundosATiempo(tiempo) {
    let minutos = Math.floor(tiempo / 60000);
    let segundos = Math.floor((tiempo % 60000) / 1000);
    let milisegundos = tiempo % 1000;
    return [minutos, segundos, milisegundos];
}

//Sacar la nueva posicion  - PERO AHORA DESDE CONTROL LOOOL
function sacar_pos_avion(tiempo) {
    let tiempo_avion = convertirTiempoAMilisegundos(tiempo);

    let tiempos = [];
    filas_array = Array.from(filas_control);

    // Cogemos todos los tiempos de los aviones
    filas_array.forEach(fila => {
        let tiempo = fila.querySelector('.tiempo_control').textContent;
        let tiempoEnSegundos = convertirTiempoAMilisegundos(tiempo);
        tiempos.push(tiempoEnSegundos);
    });

    // Metemos al final el nuestro y creamos una copia ordenada
    tiempos.push(tiempo_avion);
    let tiempos2 = [...tiempos].sort((a, b) => a - b);

    // Buscamos el indice y +1 ya que es un array y las pos empiezan en 1 no 0
    let nueva_posicion = tiempos2.lastIndexOf(tiempo_avion) + 1;

    return nueva_posicion;
}

function negar_piloto(piloto=cogerPiloto()){
    let estado = "animado"
    if (pilotos.includes(piloto)){ // Hay que reemplazarlo
        remplazar_piloto(piloto,estado,true)
    }else{
        pilotos.push(piloto)
        // Coger el tiempo del avion
        minutos = "-"
        segundos = "-"
        miliseg = "-"
        tiempo = minutos + ":" + segundos + ":" + miliseg
        console.log("TIEMPO "+tiempo)
        // Coger el peso
        peso = "-"
        // Encontrar en que posicion va a estar AHORA A TRAVES DE CONTROL!!!!!
        pos = sacar_pos_avion(tiempo) // Es un numero
        FilaControlResta(piloto,tiempo,pos) // Lo llamo antes para que cree la fila con id 1, o sino se la saltaba

        // Coger el despegue
        let despegue_input = "Pendiente"

        info = ["sumPil",piloto, pos, tiempo, peso, estado,despegue_input]
        socket.emit("all", "ranking",info )
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await rondaEquipo.get_dependencies();

    // Función para cargar datos y actualizar campos
    async function cargarDatos() {
        rondaEquipo.ronda = rondaEquipo.select_ronda.value;
        rondaEquipo.equipo = rondaEquipo.select_equipo.value;

        if (rondaEquipo.ronda && rondaEquipo.equipo) {
            await rondaEquipo.loadInfo();
            if (rondaEquipo.info) {
                console.log("Datos del equipo:", rondaEquipo.info);

                // Actualizar inputs con los datos obtenidos
                tiempos_server(rondaEquipo)       // Tiempos          
                document.getElementById("peso_input_id").value = rondaEquipo.info.Peso/1000  // Peso

                // Ponemos los datos en el input de despegue
                despegues_server(rondaEquipo)

                // Ponemos el nombre 
                nombre_server(rondaEquipo)

                // Ponemos la ronda

                ronda_server(rondaEquipo)
            } else {
                console.log("No se encontraron datos para la ronda y equipo seleccionados.");
            }
        } else {
            console.log("Ronda o equipo no seleccionados. No se puede cargar la información.");
        }
    }

    // Boton para cargar datos
    document.getElementById("cargaDatosBot").addEventListener("click", cargarDatos);
});


function despegues_server(rondaEquipo){
    // Actualizar el select de tipo de despegue
    let despegueSelect = document.getElementById("tipos_despegue_id");

    // Mapeamos los valores de despegue validos
    let despegueOptionValue;
    switch (rondaEquipo.info.D_despegue) {
        case "true":despegueOptionValue = "Corto";break; // 15m
        case "false":despegueOptionValue = "Correcto";break; // 60m
    }
    if (despegueOptionValue) {
        // Poner la opción en el select
        for (let option of despegueSelect.options) {
            if (option.value === despegueOptionValue) {option.selected = true;break;}
        }
    } else {
        console.log("No hay una opción de despegue.");
    }
}

function tiempos_server(rondaEquipo){
    tiempo_en_milis = rondaEquipo.info.P_tiempo
    tiempo = convertirMilisegundosATiempo(tiempo_en_milis)
    document.getElementById("minutos_input_id").value = tiempo[0]
    document.getElementById("segundos_input_id").value = tiempo[1];
    document.getElementById("milisegundos_input_id").value = tiempo[2];
}


function nombre_server(rondaEquipo){
    let nombre = rondaEquipo.equipo
    let nombreSelect = document.getElementById("nombres_equipos_constructor_id");

    // Poner la opción en el select
    for (let option of nombreSelect.options) {
        if (option.value === nombre) {
            option.selected = true;
            break;
        }
    }
}
function ronda_server(rondaEquipo) {
    rondaSelect = document.querySelector("#numero_ronda_id");
    num_ronda = rondaEquipo.ronda.split("ronda")[1]
    // Poner la opción en el select
    for (let option of rondaSelect.options) {
        if (option.value === num_ronda) {
            option.selected = true;
            break;
        }
    }
}

async function cargarEquipoRonda(equipo, ronda) {
    try {
        // Intenta coger el archivo
        const response = await fetch(`http://127.0.0.1:7000/data/${ronda}/${equipo}.json`);
        
        if (!response.ok) { // Error
            throw new Error('Network response was not ok');
        }
        return await response.json(); // Ha salido bien, hay archivo
    } catch (error) {
        // Error, no encuentra el archivo
        console.log(`Archivo ${equipo}.json no encontrado: `, error);
        return null;
    }
}

async function cargarRondaServer() {
    const ronda = document.querySelector("#numero_ronda_id").value;
    // Primero vaciamos los pilotos
    s_vaciarPilotos();

    // Ponemos la ronda que se quiere
    s_ponerRonda(true);
    // Cargamos los datos
    await rondaEquipo.get_dependencies();

    // Cogemos la ronda que vamos a cargar
    serverRonda = "ronda" + document.querySelector("#server_ronda_id").value
    rondaEquipo.ronda = serverRonda;
    // Vamos equipo a equipo
    for (let equipo of equipos) {
        rondaEquipo.equipo = equipo;

        if (rondaEquipo.ronda && rondaEquipo.equipo) {
            let datosEquipo = await cargarEquipoRonda(equipo, rondaEquipo.ronda); // Comprobamos si hay archivo
            if (!datosEquipo) {
                negar_piloto(rondaEquipo.equipo); // Si no hay archivo, lo mandamos negado
                continue; // Pasamos al siguiente equipo
            }

            rondaEquipo.info = datosEquipo;

            console.log("Datos del equipo:", rondaEquipo.info);

            // Actualizar inputs con los datos obtenidos
            tiempos_server(rondaEquipo); // Tiempos
            document.getElementById("peso_input_id").value = rondaEquipo.info.P_peso / 1000; // Peso

            // Ponemos los datos en el input de despegue
            despegues_server(rondaEquipo);

            // Ponemos el nombre
            nombre_server(rondaEquipo);

            // Ponemos la ronda
            ronda_server(rondaEquipo);

            // Sumar el piloto al sistema
            s_sumaPiloto("animado");
        } else {
            console.log("Ronda o equipo no seleccionados. No se puede cargar la información.");
        }
    }
}
