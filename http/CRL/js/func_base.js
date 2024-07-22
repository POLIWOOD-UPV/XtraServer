/////////////////////////////////////////////////////////////
// Funciones del base del control                          //
/////////////////////////////////////////////////////////////

// Elementos HTML
var pilotos_control_resta = document.getElementById("pilotos_mas_borrar") // Bloque de las filas control borrar
var filas_control = document.getElementsByClassName("fila_control_borrar") // Filas del bloque control borrar
var botones_control = document.getElementsByClassName("boton_control")
var aparecer_desaparecer_rank = document.getElementById("aparecer_desaparecer_rank_id")

// Botones comunes
let bot_logos = document.querySelector("#ocultar_logos_id")
let bot_dorsales = document.querySelector("#mostrar_dorsal_id")

// Listas
let pilotos = ["WOOD"]
let equipos = ["RUHE", "UVIGA", "G3", "MATSI", "LUFTS", "ECLFT", "SAET2", "DIANA", "TRENC", "NTHPO", "SAET1", "UCAIR", "XALOC", "EAFT1", "EAFT2"];

// Flags
let ranking_visible = true;
let filas_visible = true;
let logos_visibles = true;
let dorsal_visible = false;

// Coge al piloto y lo mete en el sistema
function cogerPiloto() {
    // console.log("cogerPiloto")
    // Cogemos el  del avion actual a través del drop down
    let piloto_input = document.getElementById("nombres_equipos_constructor_id")
    piloto = piloto_input.value
    return piloto
}

// Función para validar si el valor es un número (entero o decimal, positivo o negativo)
function validarNumero(valor) {
    return /^-?\d+(\.\d+)?$/.test(valor);
}

function remplazar_piloto(piloto,estado){
    // console.log("remplazar_piloto")
    // Primero borramos la entrada existente ya
    // Necesitamos saber en que posicion esta
    let i = 0;
    for (let fila_piloto of filas_control) {
        // Cogemos el nombre y lo comparamos
        let nombre = fila_piloto.querySelector(".nombre_control").textContent;
        if (nombre === piloto) { // Coinciden los nombres
            pos = fila_piloto.querySelector(".boton_control[id*='c']").id.split("c")[0]; // Obtenemos el id del boton y sacamos la pos
            break
        }else{ // No coinciden
            i++
        }
    }
    // Quitamos el piloto y de la lista tambien
    console.log("Reemplazar piloto "+piloto+" en "+pos)
    s_quitaPiloto(estado,pos+"c")
    pilotos = pilotos.filter(item => item !== piloto); // StackOverflow, devuevlve pilotos sin piloto
    
    setTimeout(()=>{
        // Volvemos a introducirlo con los puntos nuevos
        s_sumaPiloto(estado)
    },500) // Retraso, podemos variarlo

}

// Arregla las posiciones de abajo de las filas de control
function arreglar_pos_control(pos) {
    // Ordenamos las filas de control
        ordenar_control()
        if (pos < (filas_control.length)) { // Si la posicion se cuela entre y otras 
            // Ordenamos las filas de control
            //ordenar_control()
    
            // Guardamos los números de las IDs que vamos a poner
            let numeros = [];
            for (let i = filas_control.length - 1; i >= pos; i--){ // Cogemos al revés para que no haya conflictos de IDs
                numeros.push(i); // La posición como tal
            }
            // Sumamos y reasignamos
            for (let i = 0; i < numeros.length; i++) { // Empezamos en 0 porque vamos a trabajar con indices en listas
                // Cogemos el id con el que vamos a trabajar
                let boton_id = numeros[i];
                
                // Cogemos los botones antiguos
                let boton_seco = document.getElementById(String(boton_id + "c")); // Cogemos el botón seco antiguo
                let boton_anim = document.getElementById(String(boton_id + "c_AN")); // Cogemos el botón animado antiguo
    
                // Actualizamos el ID
                boton_seco.id = String((boton_id + 1) + "c");
                boton_anim.id = String((boton_id + 1) + "c_AN");
    
                // Actualizamos el onclick
                boton_seco.onclick = () => {
                    s_quitaPiloto('seco',boton_seco.id); // Le pasamos la ID ya que es lo que lleva en que pos estamos 
                };
    
                boton_anim.onclick = () => {
                    s_quitaPiloto('seco',boton_anim.id); // Le pasamos la ID ya que es lo que lleva en que pos estamos 
                };
    
            }    
        }
}