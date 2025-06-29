"use strict";

import tables from "/tablas" with {type: "json"};

let form;
// document.querySelectorAll("input:not([type=submit]),select").forEach(input => {console.log(input.name,input.value)})
let content;
let template;

const setIDwarning = (warn) => {
    let id = document.querySelector("form input[name=id]");
    if (warn) {
        id.style.backgroundColor = "#ffffaa"
    } else {
        id.style.backgroundColor = "#ffffff"
    }
}

const createID = () => {
    const data = new FormData(form);// Cojer los datos del form
    const type = data.get("type");  // Identificamos el tipo
    let id_arr = []                 // Una array para os atributos clave
    const table = tables[type];
    // segun tablas.json sabemos la estructura de la id que queremos
    for (let i = 0; i < table.idLen.length; i++) {
        if (table.idLen[i] == 0) { // la longitud es 0 es un string
            id_arr.push(String(
                data.get(table.keys[i])
            ));
        } else { // si no, el resultado debe de ser un numero con los 0s especificados
            id_arr.push(Number(
                data.get(table.keys[i])
            ).toFixed(0).padStart(
                table.idLen[i],"0"
            ));
        }
    }// juntamos los atributos clave por guiones
    let id = id_arr.join("-");
    return `urn:ngsi-ld:${type}:${id}`; // rellenamos la ID final
}

const changeID = async (inp) => {
    let id;
    if ((typeof inp) == "string") {
        id = inp // damos de entrada una string que es la ID
    } else { // damos como entrada un evento, por tanto hay que crear la ID
        id = createID();
    }
    content = await getEntity(id); // buscamos la entidad
    if (content) {
        setIDwarning(true);
        form.method = "patch";  // si existe, habra que actualizarla (patch)
        updateForm();           // actualizamos los datos del forms
    } else {
        setIDwarning(false);
        form.method = "post";   // si no existe, hay que crearla (post)
        resetForm(id);          // reseteamos el forms por defecto
    }
}

// busca la entidad por ID, si no la encuentra, retorna null
const getEntity = async (id) => {
    let res;
    try {
        res = await fetch(`/v2/entities/${id}?options=keyValues`);
    } catch (error) {
        alert(error.message); // si falla, avisamos al usuarios
        return null;
    }
    if (res.ok) {   // si acierta, extraemos el contenido y lo devolvemos
        content = await res.json();
        return content;
    }
    return null;
}

const getTemplate = async (type) => {
    let res;
    try {
        res = await fetch(`/templates/${type.toLocaleLowerCase()}.json`);
    } catch (error) {
        alert(`Template Failed: ${error.message}`) // si algo sale mal, se notifica al usuario
        return null;
    }
    if (res.ok) {
        return await res.json(); // si sale bien, se guardan los datos
    } else {
        alert(`Template Failed: ${res.status}`) // si algo sale mal, se notifica al usuario
    }
    return null;
}

const getForm = async () => {
    const data = Object.fromEntries((new FormData(form)).entries());
    if (!template) {
        template = await getTemplate(data["type"]);
    } // comprobamos que tenemos la plantilla
    // cojemos los datos del form
    content = parseForm(data);
}

const parseForm = (obj) => {
    for (const key in template) {
        if (key == "id" || key == "type") {
            continue // ignoramos datos generales
        }
        switch (template[key].type) {
            case "Number":
                obj[key] = Number(obj[key]);
                break;
            case "Boolean":
                obj[key] = Boolean(obj[key]);
                break;
            default:
                break;
        }
    }
    return obj;
}

const uploadForm = async () => {
    // actualizamos el contenido con los datos del form
    try {
        // content = Object.fromEntries((new FormData(form)).entries());
        await getForm();
    } catch (error) {
        alert(error.message);
    }
    let res;
    try { // segun la creacion o mofidicacion se cambia la petición
        if (form.method == "post") { // accedemos al form para ver el metodo
            console.log("post", content);
            res = await fetch("/v2/entities?options=keyValues", {
                headers: {"Content-Type": "application/json"},
                method: "post",
                body: JSON.stringify(content)
            });
        } else {
            console.log("patch", content);
            let id = content.id;
            await delete content.id;
            await delete content.type;
            res = await fetch(`/v2/entities/${id}/attrs?options=keyValues`, {
                headers: {"Content-Type": "application/json"},
                method: "patch",
                body: JSON.stringify(content)
            });
        }
    } catch (error) {
        console.error(error.message, res); // si algo sale mal, se notifica al usuario
    }
    alert(`Sended: ${res.status}`); // avisamos de la recepción de los datos.
}

const updateForm = () => {
    // cojemos todos los imputs (escepto los de subida)
    let inputs = document.querySelectorAll("input:not([type=submit]),select");
    inputs.forEach(input => {
        input.value = content[input.name];
    }); // Actualizamos el valor de todos los inputs por los datos guardados
}

const resetForm = async (id = null) => {
    let data = new FormData(form);  // guardamos los datos
    const type = data.get("type");
    if (id) {
        data.set("id", id); // si ya tenemos una id, sobreescribimos los datos
    }   // si no tenemos el template, lo cojemos
    if (!template) {
        template = await getTemplate(type);
    }
    for (const key in template) {
        if (key == "id" || tables[type].keys.includes(key)) {
            continue // no modificamos los datos clave
        }
        if (typeof template[key] == "object") {// si los valores estan en {type, value}
            data.set(key, template[key].value); // seleccionamos unicamente el valor
        } else {
            data.set(key, template[key]); // si no, el atributo como tal
        }
    }
    content = Object.fromEntries(data.entries()); // actualizamos los datos
    updateForm();   // hacemos que se actualice en el forms
}

const startUp = () => {
    form = document.querySelector("form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await uploadForm();
        // alert("ended");
    });

    const urlQuery = new URLSearchParams(window.location.search);
    let id = urlQuery.get("id");
    if (id) {
        changeID(id);
    }
}

addEventListener("DOMContentLoaded", startUp);

export default {
    changeID
};