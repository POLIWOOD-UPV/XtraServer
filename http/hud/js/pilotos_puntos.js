////////////////////////////////////////////////////
// Funciones de poner y quitar pilotos             //
////////////////////////////////////////////////////

// Poner y sacar aviones (con animacion)
function sumaPiloto(piloto,pos,puntos,estado,) {
    console.log("SumaPiloto")
    //Poner el avion en el ranking
    let nueva_fila = creaFila(piloto,pos, puntos);
    // Incrementamos la cantidad de aviones que hay
    ++controla_pilotos
    console.log("Introduciendo piloto " + piloto + " en "+pos+" con puntos: "+puntos)

    // Metemos en el ranking
    meter_en_ranking(nueva_fila)

    // Fisicamente hacerlo aparecer
    switch (estado){
        case "animado":
            nueva_fila.style.left = "-500px"
            setTimeout(() => {
                nueva_fila.style.left = "0px"
            }, 50);
            break;
        case "seco":
            nueva_fila.style.left = "0px"
            break;
        }
}