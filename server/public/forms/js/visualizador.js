// DOM - sin el const no lo coge bien
const tipoSelect = document.getElementById("tipo")
const entidadSelect = document.getElementById("selector")
const resultado = document.getElementById("resultado")
const form = document.getElementById("formulario")
const checkbox = document.getElementById("abrir")
const verTablaCheckbox = document.getElementById("verTabla")
const contenedorTabla = document.getElementById("tabla-tareas")
const staffeo = document.getElementById("staffeo")
const selectorDia = document.getElementById("selector_dia");
const botonVerHorario = document.getElementById("verHorarioStaff");
const resultadoHorario = document.getElementById("horarioStaffResultado");

// Arrays de datos
const dias_competicion = [
  "2025-07-07",
  "2025-07-08", 
  "2025-07-09",
  "2025-07-10", 
  "2025-07-11", 
  "2025-07-12"
];
let tareas_global = [];
let recursos_global = [];
let horas = [];
let id = ""
// Entidades
async function cargarOpciones(tipoEntidad, selectElement) {
    try {
      // Preparamos la query a Orion con limit alto para evitar recortes por defecto (20)
      const query = tipoEntidad
        ? `?type=${tipoEntidad}&options=keyValues&limit=1000`
        : "?options=keyValues&limit=1000";

      // Lo pedimos
      const res = await fetch(`/v2/entities${query}`);
      const data = await res.json();
      selectElement.innerHTML = "";

      // Lo que nos devuelva lo metemos en el dropdown
      data.forEach(entidad => {
        const option = document.createElement("option");
        option.value = entidad.id;

        // abel no mires esta guarrada
        // Sacar el VALUE del atributo correcto:
        const displayValue = 
          // Si existe `dorsal.value`, lo usamos junto con `name.value`
          entidad.dorsal?.value !== undefined
            ? `${entidad.dorsal.value} - ${entidad.name?.value ?? ''}`
          // Si no, pero existe `name.value`, lo usamos
            : entidad.name?.value !== undefined
              ? entidad.name.value
          // Si tampoco, pero existe `acr.value`, lo usamos
              : entidad.acr?.value !== undefined
                ? entidad.acr.value
          // Si tampoco, pero existe `tarea.value`, lo usamos
                : entidad.tarea?.value !== undefined
                  ? entidad.tarea.value
          // Si no hay ninguno de los anteriores, caemos al `id` limpio
                  : entidad.id.replace('urn:ngsi-ld:', '');

        // Limpiar el urn para el label por si acaso
        const labelClean = entidad.id.replace('urn:ngsi-ld:', '');

        // Poner el textcontent de la opción
        option.textContent = `${entidad.type} → ${labelClean} (${displayValue})`;
        selectElement.appendChild(option);
      });

    } catch (err) {
      console.error(`[ERROR] Cargando ${tipoEntidad || "todos"}:`, err);
      selectElement.innerHTML = `<option>Error al cargar</option>`;
    }
}

async function mostrarEntidad(id, destino) {
  // Llamada a la API
  const res  = await fetch(`/v2/entities/${encodeURIComponent(id)}`);
  const data = await res.json();

  // Ocultar/preparar contenedores
  resultado.style.display      = verTablaCheckbox.checked ? "none" : "block";
  contenedorTabla.style.display = verTablaCheckbox.checked ? "block" : "none";
  contenedorTabla.innerHTML     = "";

  if (verTablaCheckbox.checked) {
    // *** Generar tabla ***
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.style.width          = "100%";
    table.border               = "1";

    // Cabecera
    const header = document.createElement("tr");
    header.innerHTML = "<th>Propiedad</th><th>Valor</th>";
    table.appendChild(header);

    // Recorremos cada campo del objeto JSON
    Object.keys(data).forEach(key => {
      const row = document.createElement("tr");
      const cellKey = document.createElement("td");
      cellKey.textContent = key;
      const cellVal = document.createElement("td");

      // Si es atributo NGSI con .value, lo mostramos; si no, el propio valor
      if (data[key] && typeof data[key] === "object" && "value" in data[key]) {
        cellVal.textContent = data[key].value;
      } else {
        cellVal.textContent = data[key];
      }

      row.appendChild(cellKey);
      row.appendChild(cellVal);
      table.appendChild(row);
    });

    contenedorTabla.appendChild(table);

  } else {
    // *** Mostrar JSON raw ***
    destino.textContent = JSON.stringify(data, null, 2);
  }
}

// Tabla de horarios de tareas (general de todas las tareas)
async function generarTablaTareas() {
  contenedorTabla.innerHTML = ""; // limpiamos lo que hubiera antes

  // pedimos todas las tareas
  const res = await fetch("/v2/entities?type=Tarea&limit=1000");
  const tareas = await res.json();

  const tareas_por_dia = {}; // agrupamos las tareas por dia
  let horas_local = [];      // usamos un array local para las horas, para no tocar el global

  // recorremos todas las tareas
  tareas.forEach(tarea => {
    let binario = tarea.horario?.value || "000000";  // si no tiene horario, metemos todo a 0

    let completo_inicio = tarea.inicio?.value;
    let completo_final = tarea.final?.value;

    let hora_inicio = completo_inicio?.split("T")[1]?.substring(0,5); // sacamos la hora de inicio
    let hora_final  = completo_final?.split("T")[1]?.substring(0,5);  // sacamos la hora de fin

    // metemos la hora si no esta repetida
    if (hora_inicio && !horas_local.includes(hora_inicio)) horas_local.push(hora_inicio);
    if (hora_final && !horas_local.includes(hora_final))   horas_local.push(hora_final);

    // vemos en qué dias esta activa la tarea
    for (let i = 0; i < binario.length; i++) {
      if (binario[i] === "1") {
        let dia = dias_competicion[i];
        if (!tareas_por_dia[dia]) tareas_por_dia[dia] = []; // inicializamos si no existe
        tareas_por_dia[dia].push({ tarea, hora_inicio, hora_final }); // metemos la tarea
      }
    }
  });

  horas_local.sort(); // ordenamos las horas

  // creamos la tabla
  let tabla = document.createElement("table");
  tabla.style.borderCollapse = "collapse";
  tabla.style.width = "100%";
  tabla.border = "true";

  // cabecera de la tabla
  let cabecera = document.createElement("tr");
  cabecera.innerHTML = "<th>Hora</th>" + dias_competicion.map(d => `<th>${d}</th>`).join("");
  tabla.appendChild(cabecera);

  // fila por cada hora
  horas_local.forEach(hora => {
    let fila = document.createElement("tr");
    let celdaHora = document.createElement("td");
    celdaHora.textContent = hora;
    fila.appendChild(celdaHora);

    // columna por cada dia
    dias_competicion.forEach(dia => {
      let celda = document.createElement("td");

      // vemos las tareas que caen en esta hora y dia
      let tareas_en_hora = (tareas_por_dia[dia] || []).filter(t => {
        return hora >= t.hora_inicio && hora < t.hora_final;
      });

      // metemos las tareas o un guion si no hay
      celda.textContent = tareas_en_hora.map(t => t.tarea.tarea?.value).join(" / ") || "-";
      fila.appendChild(celda);
    });

    tabla.appendChild(fila); // añadimos la fila completa
  });

  contenedorTabla.appendChild(tabla); // mostramos la tabla
}


// Actualiza el selector y tabla segun el tipo
function actualizarLista(){
    const tipo = tipoSelect.value;
    cargarOpciones(tipo, entidadSelect);
    if (tipo === "Tarea") {
      generarTablaTareas(); // si son tareas, mostramos tabla de horarios
    } else {
      contenedorTabla.innerHTML = ""; // si no, limpiamos
    }
};

// EVENTOS

document.addEventListener("DOMContentLoaded", () => {  
  actualizarLista(); // primera carga

  // cogemos tareas y cuando acaben, procesamos
  fetch("/v2/entities?type=Tarea&limit=1000")
    .then(r => r.json())
    .then(tareas => {
      tareas_global = tareas;

      // sacar todos los dias y horas de las tareas
      const dias = new Set();   // para no repetir dias
      horas = new Set();        // para no repetir horas

      tareas.forEach(t => {
        let binario = t.horario?.value || "000000";  // binario de dias activos

        let ini = t.inicio?.value?.split("T")[1]?.slice(0,5); // hora de inicio
        let fin = t.final?.value?.split("T")[1]?.slice(0,5);  // hora de fin

        if (ini) horas.add(ini);  // si tiene hora, la metemos
        if (fin) horas.add(fin);

        binario.split("").forEach((b, i) => {
          if (b === "1") dias.add(dias_competicion[i]); // si esta activa ese dia
        });
      });

      // meter los dias en el selector del formulario
      selectorDia.innerHTML = "";  // limpiamos
      [...dias].sort().forEach(d => {
        let opt = document.createElement("option");
        opt.value = d;
        opt.textContent = d;
        selectorDia.appendChild(opt);
      });

      horas = [...horas].sort(); // convertimos a array y ordenamos
    });

  // cogemos recursos (no depende de tareas)
  fetch("/v2/entities?type=Recurso&limit=1000")
    .then(r => r.json())
    .then(recursos => {
      recursos_global = recursos;
    });
});


// Tipo de entidad
tipoSelect.addEventListener("change", () => {
  actualizarLista();
  const tipo = tipoSelect.value;
  // Si es staff, que se vea el selector de dia tal tal
  if (tipo === "Staff") {
    staffeo.style.display = "block";
  } else {
    staffeo.style.display = "none";
  }
});

// Seleccionar una entidad
// Seleccionar una entidad
entidadSelect.addEventListener("change", () => {
  const id = entidadSelect.value;   // ← declaramos la variable localmente

  // Si es Staff, mostramos el selector; en cualquier otro caso, lo ocultamos
  if (id.includes(":Staff:")) {
    staffeo.style.display = "block";
  } else {
    staffeo.style.display = "none";
  }
});


// Cuando se pulsa el botón "Ver entidad"
form.addEventListener("submit", e => {
  e.preventDefault(); // evitar recarga
  const id = entidadSelect.value;
  if (!id) return;

  if (checkbox.checked) {
    // Abrir en nueva pestaña
    window.open(`/v2/entities/${encodeURIComponent(id)}`, "_blank");
  } else {
    // Mostrar en el pre
    mostrarEntidad(id, resultado);
  }
});

// mostrar horario cuando se pulsa el boton
botonVerHorario.addEventListener("click", () => {
  let staffId = entidadSelect.value?.split(":").pop(); // sacar ID del staff
  let dia = selectorDia.value;                         // dia seleccionado
  if (!staffId || !dia) return;

  // ids de las tareas del staff
  let tareas_ids = recursos_global
    .filter(r => r.staff?.value === staffId) // cogemos las tareas donde este marcado nuestro staff
    .map(r => r.tarea?.value?.toString());   // lo pasamos a string para usarlo mas comodo


  // tareas que tiene ese dia
  let tareas_del_dia = tareas_global.filter(t => {

    // Sacamos el binario del horario
    let binario = t.horario?.value || "000000";
    let fechas = binario.split("")                                // Lo separamos en caracteres 0 0 1
      .map((b, i) => b === "1" ? dias_competicion[i] : null)  // Si es 1 sacamos la fecha, si no, null
      .filter(Boolean);                                       // Nos quedamos con lo no nulo (las fechas)


    let id = t.num?.value?.toString();      // Sacamos la ID de la tarea
    return tareas_ids.includes(id) && fechas.includes(dia); //La tarea es del staff y de ese dia?
  });

  // vaciar el resultado anterior
  resultado.innerHTML = "";

  // crear la tabla
  let tabla = document.createElement("table");
  let cabecera = document.createElement("tr");
  cabecera.innerHTML = `<th>${dia}</th>`;
  tabla.appendChild(cabecera);


  // Hora a hora vamos a ir metiendo las tareas
  horas.forEach(h => {
    let fila = document.createElement("tr");
    let celda = document.createElement("td");

    // ver que tareas estan activas en esa hora
    let tareas_en_hora = tareas_del_dia.filter(t => {
      let ini = t.inicio?.value.split("T")[1]?.slice(0,5);
      let fin = t.final?.value.split("T")[1]?.slice(0,5);
      return h >= ini && h < fin;
    });

    // meter en la celda
    celda.innerHTML = `<b>${h}</b> → ${tareas_en_hora.map(t => t.tarea?.value).join(" / ") || "-"}`;
    fila.appendChild(celda);
    tabla.appendChild(fila);
  });

  resultado.appendChild(tabla);
});