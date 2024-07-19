////////////////////////////////////////////////////
// Funciones de poner y quitar pilotos             //
////////////////////////////////////////////////////

// Poner y sacar aviones (con animacion)
function sumaPiloto(piloto,pos,tiempo,peso,estado,despegue) {
    console.log("SumaPiloto")
    //Poner el avion en el ranking
    let nueva_fila = creaFila(piloto,pos, tiempo,peso,despegue);
    // Incrementamos la cantidad de aviones que hay
    ++controla_pilotos

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