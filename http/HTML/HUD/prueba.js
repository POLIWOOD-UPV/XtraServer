        // Lista Pilotos
        var pilotos = ["ric","jaw","abe","est"]
        var i = 0

        var ranking = document.getElementById("contenedor")
        var filas = document.getElementsByClassName("fila")


        function creaFila(nom,pos,tiemp,pes){
        // Creamos la fila con sus partes
            let fila = document.createElement("div")
            fila.className = "fila"
            // Creamos la zona del numero
            let numero = document.createElement("div")
            numero.className = "numero"
            numero.textContent = pos
            // Creamos la zona del nombre, peso/tiempo
            let resto = document.createElement("div")
            resto.className = "resto"

            // Ponemos el nombre
            let nombre = document.createElement("div")
            nombre.className = "nombre"
            nombre.textContent = nom

            // Informativos
            let tiempo = crearTiempo(tiemp)
            let peso = crearPeso(pes)
            if (!tiempo_visible){
                tiempo.style.display = "none"
            }
            if (peso_visible){
                peso.style.display = "flex"
            }
            // Lo juntamos todo y devolvemos la fila
            resto.append(nombre,tiempo,peso)
            fila.append(numero,resto)
            return fila
        }

        // Funciones para crear los informativos del ranking
        // Tiempo
        function crearTiempo(tiemp){
            let tiempo = document.createElement("div")
            tiempo.className = "tiempo"

            // Si es el primero, le ponemos que es el lider
            if (i ==0){
                tiempo.textContent = "LEADER"
            }else{
                tiempo.textContent = tiemp
            }
            
            return tiempo
        }
        // Peso
        function crearPeso(pes){
            let peso = document.createElement("div")
            peso.className = "peso"

            peso.textContent = pes;
            return peso

        }

        // Funciones para modificar la informacion del ranking
        var boton_tiempo = document.getElementById("mostrar_tiempo_id");
        var boton_peso = document.getElementById("mostrar_peso_id");
        // Tiempo ( empieza activa)
        var tiempo_visible = true;
        var tiempos = document.getElementsByClassName("tiempo")

        function mostrarTiempo(){
            let estado;
            if (tiempo_visible){
                // Ocultar tiempos
                estado = "none";
                boton_tiempo.textContent = "Mostrar Tiempos"
                tiempo_visible = false;
            }else{
                // Mostrar tiempos
                estado = "flex";
                boton_tiempo.textContent = "Ocultar Tiempos"
                tiempo_visible = true;
            }
            for (var i = 0; i < tiempos.length;i++){
                tiempos[i].style.display = estado
            }

        }

        // Peso ( empieza desactivada)
        var peso_visible = false;
        var pesos = document.getElementsByClassName("peso")

        function mostrarPeso(){
            let estado;
            if (peso_visible){
                // Ocultar pesos
                estado = "none";
                boton_peso.textContent = "Mostrar Pesos"
                peso_visible = false;
            }else{
                // Mostrar pesos
                estado = "flex";
                boton_peso.textContent = "Ocultar Pesos"
                peso_visible = true;
            }
            for (var i = 0; i < pesos.length;i++){
                pesos[i].style.display = estado
            }
        }

        function cambiazoPesoTiempos(){
            if ((!tiempo_visible && !peso_visible) ||(tiempo_visible && peso_visible) ) {
                return
            }else{
                mostrarTiempo();
                mostrarPeso();
            }
        }
        // Poner y sacar aviones
        function sumaPiloto() {
            let piloto = pilotos[++i % 4];
            let nueva_fila = creaFila(piloto,i+1 , "+1 lap","1Kg");
            ranking.append(nueva_fila);
        }
        function quitaPiloto() {
            if (filas.length > 0) {
                filas[filas.length - 1].remove();
                --i;
            }
        }

        // Aparecer y desaparecer ranking
        var ranking_visible = true;
        var aparecer_desaparecer_rank = document.getElementById("aparecer_desaparecer_rank_id")
        function rankingMov() {
            if (ranking_visible) {
                // Ranking se pasa a oculto
                aparecer_desaparecer_rank.textContent = "Aparecer Ranking";
                ranking_visible = false;
                ranking.style.left = "-500px";
            } else {
                // Ranking se pasa a visible
                aparecer_desaparecer_rank.textContent = "Desaparecer Ranking";
                ranking_visible = true;
                ranking.style.left = "0px";

            }
        }


        // Live Timing ( Actualmente no lo vamos a usar, o al menos así)

        var prog1 = document.getElementById("prog1")
        var prog2 = document.getElementById("prog2")
        var prog3 = document.getElementById("prog3")

        function updateProgressBar(progressBar) {
        progressBar.value += 10;

        if (progressBar.value >= 100) {
            progressBar.value = 0;
        }
    }
        function updateProgress() {
        let prog_actual;

        if (prog1.value < 100) {
            prog_actual = prog1;
        } else if (prog2.value < 100) {
            prog_actual = prog2;
        } else {
            prog_actual = prog3;
        }

        prog_actual.value += 10
        if (prog_actual.id == "prog3" && prog_actual.value == 100){
            return
        }else {
            setTimeout(updateProgress, 100);
        }
         
        }

        updateProgress(); // Para que inicie el live timing nada mas cargar (es parte del live time, no se va a usar)