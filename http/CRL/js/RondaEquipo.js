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
            option.value = element.Acr;
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

    set_onInput(callback = actualizarInfo){
        this.select_ronda.addEventListener("input", async (event) => {
            this.ronda = this.select_ronda.value;
            if (this.ronda != null && this.equipo != null) {
                await this.loadInfo();
                callback(this.info); // actualizar info
            }
        });

        this.select_equipo.addEventListener("input", async (event) => {
            this.equipo = this.select_equipo.value;
            if (this.ronda != null && this.equipo != null) {
                await this.loadInfo();
                callback(this.info); // actualizar info
            }
        });
    }

    setup(){
        this.get_dependencies();
        this.set_onInput();
    }

    async upload(object) {
        if (this.ronda == null || this.equipo == null){
            alert("No ha seleccionado la ronda o el equipo");
            return
        }

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

function actualizarInfo(info) {
    if (info == null) {
        return;
    }
    for (const key in info) {
        if (Object.hasOwnProperty.call(info, key)) {
            if (info[key] == "true") {
                let element = document.getElementById(key.toLowerCase()+"_t");
                if (element == null) {continue;}
                element.click();
                continue;
            }if (info[key] == "false") {
                let element = document.getElementById(key.toLowerCase()+"_f");
                if (element == null) {continue;}
                element.click();
                continue;
            }else{
                let element = document.getElementById(key.toLowerCase())
                if (element == null) {continue;}
                element.value = info[key];
            }
        }
    }
};