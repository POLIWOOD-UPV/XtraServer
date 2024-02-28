////////////////////////////////////////////////////
// Funciones de animaciones dinamicas y su estado //
////////////////////////////////////////////////////

// Aparecer y desaparecer ranking
var ranking_visible = true;
var aparecer_desaparecer_rank = document.getElementById("aparecer_desaparecer_rank_id")

var filas_visible = true;


// Mover el ranking en o fuera de pantalla
function rankingMov() {
    console.log("rankingMov")
    if (ranking_visible) { // Es visible
        // Ranking se pasa a oculto
        aparecer_desaparecer_rank.textContent = "Aparecer Ranking";
        ranking_visible = false;
        ranking.style.left = "-500px"//"300px";
    } else { // No es visible
        ranking.style.left = "0px";
        aparecer_desaparecer_rank.textContent = "Desaparecer Ranking";
        ranking_visible = true;
        if (!filas_visible){
            filasMov()
        }
        
        }
    updateRankingStatus()
}

// Mover filas en o fuera de pantalla

function filasMov(){
    // Saca o pone las filas depende del estado actual
    let cant_filas =  filas.length;

    if (filas_visible){
        // Hacer filas No Visibles
        // Se repite el codigo en un intervalo hasta que se usa clearInterval
        let indice = 1;
        let intervalId = setInterval(() => {

            // Comprobmos si hemos quitado todas ya
            if (indice < cant_filas+1) {
                // Lo posicionamos a la izquierda (se aplica la transicion)
                filas[filas.length-indice].style.left = "-500px"//"300px";
                indice++
            } else {
                // Una vez hemos quitado todas, movemos el contenedor entero y paramos lo otro
                clearInterval(intervalId);
                rankingMov();
            }
        }, 150); // Que espere 150ms antes de quitar el siguiente 
        filas_visible = false;

    } else{
        // Hacer filas visibles
        // Se repite el codigo en un intervalo hasta que se usa clearInterval
        let indice2 = 0;
        if (!ranking_visible){
            rankingMov();
        }
        let intervalId = setInterval(() => {
            // Comprobmos si hemos quitado todas ya
            if (indice2 < cant_filas) {
                // Lo posicionamos a la izquierda (se aplica la transicion)
                filas[indice2].style.left = "0px";
                indice2++
            } else {
                // Una vez hemos quitado todas, movemos el contenedor entero y paramos lo otro
                clearInterval(intervalId);
            }
        }, 150); // Que espere 150ms antes de quitar el siguiente 

        filas_visible = true;
    }
}

// Funciones aparecer/desaparecer dinamicas   
// Desaparición con dinamica 
function desaparicionDinamica() {
    if (!ranking_visible) {
        // Ya escondido, no se ve
        return;
    } else {
        filas_visible = true;
        filasMov()
    }

}
// Aparicion con dinamica 
function aparicionDinamica() {
    if (ranking_visible) {
        // Ya se ve
        return;
    } else {
        filas_visible = false;
        ranking_visible = false;
        rankingMov()
    }

}

// Esta funcion solo la tenemos que llamar cuando se mueve el ranking entero ya que es cuando esta ocurriendo una transicion
function updateRankingStatus(){
    let status = document.getElementById("status_anim_ranking");
    if (!filas_visible){
        // Si las filas estan movidas, sera dinamico siempre
        status.textContent = "Dinamica";
        status.style.color = "red";
    }else if (!ranking_visible && filas_visible){
        // Si el ranking esta movido pero con las filas en su lugar, es estatico
        status.textContent = "Estatica";
        status.style.color = "red";
    }else{
        // Si ambas son visbles, es que estamos en el punto de partida
        status.textContent = "-";
        status.style.color = "black"
    }

}