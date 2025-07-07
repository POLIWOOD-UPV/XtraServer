"use strict"

import "/socket.io/socket.io.js";
import tables from "/tablas" with {type: "json"};
import template from "/templates/crono.json" with {type: "json"};

class Cronometro {
    empty() {
        if (this.stepper) {
            clearInterval(this.stepper);
            this.stepper = null;
        }
        this.value = null;
        this.html_min.textContent = "--";
        this.html_sec.textContent = "--";
        this.html_milsec.textContent = "---";
    }
    create(ronda, equipo, tipo) {
        this.id = this.createID(ronda, equipo, tipo);
        this.entity = {
            id: this.id,
            type: "Crono",
            ronda,
            equipo,
            tipo,
            start: 0,
            stop: 0,
        };
        console.log(`Crono created: ${this.id}`);
    }
    // IMPORTANTE hacer BIND para conectar con el servidor!!!!!!!!!!!!!!!!!!!!!
    constructor(idMinutos, idSegundos, idMilisegundos) {
        this.socket = io(); // socket propio
        this.entity = template;
        this.table = tables["Crono"];
        this.id;
        // "AUXI" / "CARG" / "MISN" / "CIRC" / "PLAN" / "DESC"

        this.stepper;   // SetInterval
        this.value;     // Tiempo Transcurrido

        this.html_min = document.getElementById(idMinutos);
        this.html_sec = document.getElementById(idSegundos);
        this.html_milsec = document.getElementById(idMilisegundos);

        // Ponemos los valores en el cronometro como strings, rellenando con guiones
        this.html_min.textContent = "--";
        this.html_sec.textContent = "--";
        this.html_milsec.textContent = "---";

        this.socket.send("New Cronometro!"); // Debug only
    }

    createID(ronda, equipo, tipo) {
        let data = {ronda, equipo, tipo};
        let id_arr = [];
        // segun tablas.json sabemos la estructura de la id que queremos
        for (let i = 0; i < this.table.idLen.length; i++) {
            if (this.table.idLen[i] == 0) { // la longitud es 0 es un string
                id_arr.push(String(
                    data[this.table.keys[i]]
                ));
            } else { // si no, el resultado debe de ser un numero con los 0s especificados
                id_arr.push(Number(
                    data[this.table.keys[i]]
                ).toFixed(0).padStart(
                    this.table.idLen[i],"0"
                ));
            }
        }// juntamos los atributos clave por guiones
        let id = id_arr.join("-");
        return `urn:ngsi-ld:Crono:${id}`; // rellenamos la ID final
    }

    unbind() {
        this.socket.off("message", this.listener);
    }

    bind(ronda, equipo, tipo) {
        this.unbind();
        this.create(ronda, equipo, tipo);
        this.socket.on("message", this.listener);
        this.listener(`!${this.id}`); // update the entity;
    }

    check(msg){
        if (!String(msg).startsWith("!")) {return false;}
        const data = msg.split(" ");
        if (data[1] != this.id) {return false;}
        switch (data[0]) {
            case `!entityCreate`:
                return true;
            case `!entityDelete`:
                this.empty();
                return false;
            case `!entityUpdate`:
                return true;
            case `!entityChange`:
                return true;
            default:
                return false
        }
    }

    async listener(msg) {
        if (!this.check(msg)) {return;}
        let res;
        while (true) {
            try {
                res = await fetch(`/v2/entities/${this.id}?options=keyValues`);
                break;
            } catch (error) {
                console.log(error.message); // si falla, avisamos al usuarios
            }
        } // Una vez recibido el mensaje...
        if (!res.ok) {
            this.empty(); // No existe la entidad
            return;
        } else {
            this.entity = await res.json();
        }
        if (this.entity.stop > 0) {
            this.value = this.entity.stop - this.entity.start;
        } else {
            if (this.entity.start > 0) {
                this.stepper = setInterval(this.step, 10);
                let tiempo_actual = Date.now();
                this.value = tiempo_actual - this.entity.start;
            } else {
                this.value = 0;
            }
        }
        this.interface()
    }

    step(){
        let tiempo_actual = Date.now();
        this.value = tiempo_actual - this.entity.start;
        this.interface();
    }

    interface(){
        let total_milisec = this.value;
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

    async #send() {
        while (true) {
            let res;
            try { // si la entidad existe... se modifica.
                if (this.value) {
                    res = await fetch(`/v2/entities/${this.id}/attrs?options=keyValues`, {
                        headers: {"Content-Type": "application/json"},
                        method: "PATCH",
                        body: JSON.stringify({
                            start: this.entity.start,
                            stop: this.entity.stop
                        })
                    }); // si no existe... se crea.
                } else {
                    res = await fetch("/v2/entities?options=keyValues", {
                        headers: {"Content-Type": "application/json"},
                        method: "POST",
                        body: JSON.stringify(this.entity)
                    });
                } // una vez enviado, se para.
                break;
            } catch (error) {
                console.error(error.message, res); // si algo sale mal, se notifica al usuario
            }
        }
    }

    start() {
        if (!this.stepper) {
            this.entity.start = Date.now();
            this.entity.stop = 0;
            this.stepper = setInterval(() => {
                this.step();
            }, 10);
            this.#send();
        }
    }

    stop() {
        if (this.stepper) {
            this.entity.stop = Date.now();
            clearInterval(this.stepper);
            this.stepper = null;
            // Intentarlo hasta que se suba
            this.#send();
        }
    }

    async reset() {
        if (this.stepper) {
            clearInterval(this.stepper);
            this.stepper = null;
        }
        create(this.entity.ronda, this.entity.equipo, this.entity.tipo);
        this.#send();
    }

    set(value){
        if (this.stepper) {
            clearInterval(this.stepper);    // Detenemos los incrementos¡
            this.stepper = null;            // Volver a poner a null para que la otra lógica funcione
        }
        this.value = value;
        this.entity.start = Date.now();
        this.entity.stop = this.entity.start + value;
        this.interface();
        this.#send();
    }

    add(value) {
        if (this.stepper) {
            this.entity.start -= value;
        } else {
            this.entity.stop += value;
        }
        this.interface();
        this.#send();
    }

    button() {
        if (this.stepper) {
            this.stop();
        } else {
            this.start();
        }
    }
};

export default Cronometro;