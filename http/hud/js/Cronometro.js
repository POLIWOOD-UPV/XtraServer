class Cronometro {
    crl(info){
        // [ronda, equipo, prueba, comando, tiempo]
        if (info[0] != this.ronda ||
            info[1] != this.equipo ||
            info[2] != this.prueba
            ){return;}

        switch (info[3]) {
            case "start":
                this.start(info[4]);
                break;
            case "pause":
                this.pause(info[4]);
                break;
            case "reset":
                this.set(0);
                break;
            case "set":
                this.set(info[4]);
                break;
            case "update":
                this.update(info[4]);
                break;
            default:
                break;
        }
    }
    // IMPORTANTE hacer BIND para conectar con el servidor!!!!!!!!!!!!!!!!!!!!!
    constructor(idMinutos, idSegundos, idMilisegundos) {
        this.socket = io(); // socket propio
        this.ronda;
        this.equipo;
        this.prueba;    // T_carga o T_vuelo

        this.stepper;   // SetInterval
        this.t_ini;     // Tiempo Inicial 
        this.t_trs;     // Tiempo Transcurrido

        this.html_min = document.getElementById(idMinutos);
        this.html_sec = document.getElementById(idSegundos);
        this.html_milsec = document.getElementById(idMilisegundos);

        // Ponemos los valores en el cronometro como strings, rellenando con 0s
        this.html_min.textContent = "00";
        this.html_sec.textContent = "00";
        this.html_milsec.textContent = "000";

        this.socket.send("New Cronometro!"); // Debug only
    }

    bind(ronda, equipo, prueba){
        this.ronda = ronda;
        this.equipo = equipo;
        this.prueba = prueba;
        this.socket.on("cronometro", (info) => {
            this.crl(info);
        });

        this.socket.send(`Cronometro: ${ronda}/${equipo}/${prueba}`); // Debug only
    }

    interface(){
        let total_milisec = this.t_trs;
        // Horas
        let horas = Math.floor(total_milisec / (1000 * 60 * 60))
        total_milisec %= (1000 * 60 * 60)
        // Minutos
        let minutos = Math.floor(total_milisec / (1000 * 60))
        // Milisegundos
        total_milisec %= (1000 * 60)
        let segundos = Math.floor(total_milisec / 1000)
        let milisegundos = total_milisec % 1000

        // Ponemos los valores en el cronometro como strings, rellenando con 0s
        this.html_min.textContent = String(minutos).padStart(2, "0");
        this.html_sec.textContent = String(segundos).padStart(2, "0");
        this.html_milsec.textContent = String(milisegundos).padStart(3, "0");
    }

    step(){
        let tiempo_actual = Date.now();
        this.t_trs = tiempo_actual - this.t_ini;
        this.interface();
    }

    start(tiempo_inicial){
        if (!this.stepper) {
            this.t_ini = tiempo_inicial;
            this.stepper = setInterval(() => {
                this.step();
            }, 10);
        }
    }

    pause(tiempo_trnascurrido){
        clearInterval(this.stepper);    // Detenemos los incrementos¡
        this.stepper = null;            // Volver a poner a null para que la otra lógica funcione
        console.log("Paused in -> ", this.t_trs);
        this.t_trs = tiempo_trnascurrido;
        this.interface();
    }

    set(value){
        clearInterval(this.stepper);    // Detenemos los incrementos¡
        this.stepper = null;            // Volver a poner a null para que la otra lógica funcione
        this.t_trs = value;
        this.interface();
    }

    update(value){
        return;
    }

    onUpdate(func){
        this.update = func;
    }
};
/*
export class Conometro {
    constructor(idMinutos, idSegundos, idMilisegundos) {
        this.idMinutos = idMinutos;
        this.idSegundos = idSegundos;
        this.idMilisegundos = idMilisegundos;
    }}
*/