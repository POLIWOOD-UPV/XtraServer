class RondaEquipo {
    constructor(idRonda = "ronda", idEquipo = "equipo") {
        this.response;
        this.equipos;
        this.rondas;
        this.info;

        const urlQuery = new URLSearchParams(window.location.search);
        this.ronda = urlQuery.get("Ronda");
        this.equipo = urlQuery.get("Equipo");

        this.select_ronda = document.getElementById(idRonda);
        this.select_equipo = document.getElementById(idEquipo);

    }

    async get_dependencies() {
        this.response = (await fetch("/data/equipos.json"));
        this.equipos = await this.response.json();
        this.response = (await fetch("/data/rondas.json"));
        this.rondas = await this.response.json();

        this.rondas.forEach(element => {
            let option = document.createElement("option");
            option.innerText = element;
            option.value = element;
            this.select_ronda.appendChild(option);
        });

        this.equipos.forEach(element => {
            let option = document.createElement("option");
            option.innerText = element.Team;
            option.value = element.Team;
            this.select_equipo.appendChild(option);
        });
    }

    async loadInfo() {
        this.response = (await fetch(`/data/${this.ronda}/${this.equipo}.json`));
        try {
            this.info = await this.response.json();
            return;
        } catch { // No se ha completado correctamente
            return;
        }
    }

    set_onInput(callback){
        this.select_ronda.addEventListener("input", async () => {
            this.ronda = this.select_ronda.value;
            if (this.ronda != null && this.equipo != null) {
                await loadInfo();
                callback(this.info);
            }
        });

        this.select_equipo.addEventListener("input", async () => {
            this.equipo = this.select_equipo.value;
            if (this.ronda != null && this.equipo != null) {
                await loadInfo();
                callback(this.info);
            }
        });
    }

    async upload(object) {
        let msg = `Ronda=${this.ronda}&Equipo=${this.equipo}&`

        for (const key in object) {
            if (Object.hasOwnProperty.call(object, key)) {
                msg += key + "=" + object[key] + "&";              
            }
        }

        var response = await fetch("/vuelo", {
            method: "POST",
            body: msg.slice(0,-1)
        });
    }
}
