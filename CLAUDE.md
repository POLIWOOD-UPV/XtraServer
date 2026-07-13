# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

XtraServer sirve las **infografías/overlays** de la retransmisión de XtraChallenge (POLIWOOD-UPV):
páginas HTML con fondo transparente que se superponen al vídeo y se controlan en tiempo real a
través de un broker FIWARE Orion (NGSI v2) + Socket.IO. Comparte arquitectura con su proyecto
hermano AccServer (buena parte de esta guía viene de allí).

> **MariaDB / SQL no se usa** para los datos que trabajamos actualmente. Su fallo al arrancar
> `node server.js` fuera de Docker es irrelevante; no perder tiempo depurándolo. Lo importante
> para las infografías es **Orion**.

## Cómo se controlan las infografías (lo esencial de este repo)

Los overlays **no tienen botón local de toggle**: todo se controla desde
`server/public/html/control.html` mediante la entidad NGSI **`Animaciones`**
(`urn:ngsi-ld:Animaciones:001`), que tiene un atributo `Text` por infografía con valor
`"visible"` u `"oculto"`.

Cadena completa (patrón canónico: `public/js/anuncios.js`):

1. **Estado**: atributo en `Animaciones`, creado en `server/modules/ngsi.js` → `crear_animaciones()`.
   Atributos actuales: `anuncios`, `sponsors`, `infoteam`, `siguiente`, `clima`. Añadir
   infografía = añadir su atributo aquí (arranca `"visible"`).
2. **Overlay** (`public/js/<infografia>.js`): define `const ATTRIBUTE_NAME = "<attr>"`, hace
   `fetch("/v2/entities?type=Animaciones")`, lee `data[0][ATTRIBUTE_NAME].value`, y muestra/oculta
   el bloque togglando la clase `.hidden` (`main_block.classList.toggle("hidden", estado !== "visible")`).
   Escucha `socket.on("message", ...)` y si el mensaje incluye `urn:ngsi-ld:Animaciones:` vuelve a
   llamar a `cogerAnimaciones()`. Requiere `<script src="/socket.io/socket.io.js">` en el HTML.
3. **Control** (`control.html` + `control.js`): la visibilidad se togglea con botones
   `<button class="btnToggle" data-attr="<attr>">`; `control.js` recorre todos los `.btnToggle`,
   los pinta según estado (clase `activo`/`inactivo`) y hace `POST /v2/op/update`
   (`actionType:"update"`). Añadir un toggle = un `<button class="btnToggle" data-attr="…">` +
   su etiqueta en el objeto `ETIQUETAS`. El control tiene además secciones para el **texto del
   anuncio** (`Anuncio.texto`), el **equipo mostrado + payload** (`equipoMostrado`) y el
   **siguiente equipo** (`SiguienteEquipo`).
4. **Tiempo real**: Orion (subscrito a `entityUpdate`) notifica al xtraserver → `ngsi.recv` →
   `io_server.notify` reemite por Socket.IO a todos los clientes. Sin polling.

> Nota NGSI: `actionType:"update"` solo modifica atributos que ya existen en la entidad; para
> **crear** un atributo/entidad nuevo por primera vez usar `"append"` (crea o actualiza). Por eso
> el payload del control se envía con `append`.

### Overlays y sus datos

| Overlay (`public/html`) | JS/CSS | Atributo visibilidad | Fuente de datos |
|-------------------------|--------|----------------------|-----------------|
| `anuncios.html` | `anuncios.js` | `anuncios` | `Anuncio.texto` (banner superior) |
| `Sponsor.html` | `sponsor.js` | `sponsors` | logos en `img/Equipos/` (ticker inferior) |
| `infoteam.html` | `infoteam.js` | `infoteam` | `equipoMostrado.acr` → `Equipo` (+ `payload`/`payloadAcr`) |
| `siguiente.html` | `siguiente.js` | `siguiente` | `SiguienteEquipo.acr` → `Equipo` |
| `clima.html` | `clima.js` | `clima` | **Open-Meteo** directo desde el navegador (cicla campos) |
| `puntos.html` | `puntos.js` | — | `GET /api/puntos` (proxy a fuente externa) |

- El equipo que **vuela ahora** es `equipoMostrado`; el **siguiente** es `SiguienteEquipo`. Ambos
  guardan `acr` y el overlay resuelve el `Equipo` por `q=acr==<ACR>`. Los **logos** se cargan por
  acrónimo: `img/Equipos/<ACR>.png` (el campo `logo` de la entidad no siempre coincide con el archivo).
- **Payload** (InfoTeam): vive en `equipoMostrado.payload` (Number) + `payloadAcr` (Text). El overlay
  solo lo muestra si `payloadAcr` coincide con el equipo mostrado, para no arrastrar el payload al
  cambiar de equipo.
- **Puntos** depende de la fuente externa `public.xc26.didev.es`, que **puede estar apagada** fuera
  de competición. Si `GET /api/puntos` devuelve `500 {"error":"fetch failed"}`, el problema es la
  fuente (timeout de conexión), no el código: la tabla queda vacía pero el overlay carga.

### Estilo compartido (`public/css/theme.css`)

Los overlays comparten un tema con `@import "theme.css"` al inicio de cada CSS. `theme.css` define
en `:root` la paleta de marca (principales **cian `#65DEF1`** y **naranja `#FB8500`**; derivados
dorado `#ECB707` y azul `#4C6EAF`), los degradados (`--grad-marca` azul→naranja para paneles,
`--grad-barra` para la barra de sponsors) y detalles (`--texto`, `--acento`, `--borde-claro`,
`--divisor`, sombras, `--fuente`, `--transicion`). Cambiar la marca = editar `theme.css`.

**Textos visibles de las infografías en inglés** (competición internacional); el panel de control
va en español (uso interno del operador).

Verificar toggles end-to-end:
```bash
docker compose up -d && curl -s http://localhost:1026/version   # esperar Orion
curl -s "http://localhost:1026/v2/entities/urn:ngsi-ld:Animaciones:001?options=keyValues"
curl -X POST http://localhost/v2/op/update -H "Content-Type: application/json" \
  -d '{"actionType":"update","entities":[{"id":"urn:ngsi-ld:Animaciones:001","type":"Animaciones","sponsors":{"type":"Text","value":"oculto"}}]}'
docker compose down
```

`OLD_server_25/` es código antiguo: **no tocar ni consultar** salvo petición explícita.

## Running the stack

Everything runs via Docker Compose from the repo root:

```bash
docker compose up -d          # start all services
docker compose down           # stop
docker compose logs -f xtraserver  # follow app logs
```

The `server/` directory is bind-mounted into the `xtraserver` container at `/home/app`, so edits to JS files are live — restart only the container to pick them up:

```bash
docker compose restart xtraserver
```

There is no build step; the image `avr24/xtraserver:v2.0` is pre-built and pulled from Docker Hub.

## Services and ports

| Service | Port | Purpose |
|---------|------|---------|
| xtraserver | 80 | Main app (Express + Socket.IO) |
| orion | 1026 | FIWARE Orion NGSI v2 context broker |
| mongo | 27017 | MongoDB backing store for Orion |
| mariadb | 3306 | MariaDB competition database (`xtrachallenge26`) — no se usa actualmente |
| mediamtx | 8889/9997/… | MediaMTX streaming server (WebRTC/RTSP/RTMP + API) |

Inside Docker, services communicate by hostname (`orion`, `mariadb`, `mongo`). From the host, use `localhost` with the mapped ports.

## Architecture

### Data flow

```
Browser ──HTTP/WS──► XtraServer ──/v2/* proxy──► Orion (NGSI)
                          │                            │
                          │◄── /subscriptions/:action ─┘  (webhook)
                          │
                          └──── SQL sync ──────────► MariaDB
```

1. **Clients → Orion**: All NGSI v2 requests (`/v2/*`) are transparently proxied by XtraServer to Orion.
2. **Orion → XtraServer**: On startup, XtraServer registers subscriptions with Orion for `entityCreate`, `entityDelete`, and `entityUpdate`. Orion calls back to `POST /subscriptions/:action` on every change.
3. **XtraServer → MariaDB**: Each notification is translated into a `REPLACE INTO` / `UPDATE` / `DELETE` SQL statement and executed synchronously.
4. **Real-time push**: After processing a notification, XtraServer broadcasts the event ID over Socket.IO to all connected browsers (`!entityUpdate urn:ngsi-ld:...`).

### Startup sequence

`server.js` → `sql.setup()` (connect + run `data/init.sql`) → on success, `ngsi.start()`:
- Cleans all existing Orion subscriptions
- Calls `ngsi.restaurar_datos()` — reads every SQL table and re-populates Orion entities from the DB
- Registers new subscriptions for entityCreate / entityDelete / entityUpdate
- Appends initial entities (universidades, equipos, rondas, anuncio, equipoMostrado,
  siguienteEquipo, animaciones, y las entidades Xtra2 `PosVuelo`/`PuntosXtra2`)

### Module map (`server/modules/`)

| File | Responsibility |
|------|---------------|
| `app.js` | Express route definitions |
| `ngsi.js` | FIWARE Orion integration: subscribe, proxy, CRUD helpers, startup |
| `sql.js` | MariaDB connection, `syncronize()` per NGSI action, raw SQL prompt endpoint |
| `io_server.js` | Socket.IO connection/disconnect/message/notify |
| `log.js` | CSV-based Logger class; instances: `http_logger`, `io_logger`, `ngsi_logger`, `proxy_logger` |
| `save.js` | Snapshot NGSI state to `data/save/<name>/` and restore |
| `dir.js` | Static file serving and HTML directory listing for `public/` |

### NGSI entity types and DB mapping

`server/data/tablas.json` is the single source of truth that maps NGSI entity types to SQL tables. It is used by both `ngsi.js` (to build entity IDs and restore data) and `sql.js` (to build SQL statements).

Entity ID format: `urn:ngsi-ld:<Type>:<key1>-<key2>` where key widths come from `idLen` (0 = string, N = zero-padded number).

| NGSI Type | SQL Table | Primary keys |
|-----------|-----------|-------------|
| Universidad | universidades | acr |
| Equipo | equipos | dorsal (2-digit) |
| Ronda | rondas | num (1-digit) |
| Puntos | puntos | ronda, equipo |
| Crono | cronos | ronda, equipo, tipo |
| Ficha | fichas | ronda, equipo |
| Vuelo | vuelos | ronda, equipo |

Special NGSI types with **no SQL table** (handled only in Orion): `Anuncio`, `EquipoMostrado`,
`SiguienteEquipo`, `Animaciones` (and the Xtra2 telemetry types `PosVuelo`, `PuntosXtra2`).
`ngsi.recv()` skips SQL sync for any type not present in `tablas.json`.

### Static content

`server/public/` is the web root. Templates for NGSI entities live in `server/public/templates/` (one JSON file per lowercase type name, e.g. `equipo.json`). These are used by `ngsi.restaurar_datos()` to reconstruct entities from SQL rows.

Initial competition data (equipos, universidades, clubs) is in `server/data/equipos/` and `server/data/uni/`.

### Key HTTP endpoints

| Route | Description |
|-------|-------------|
| `GET /v2/*` | Proxy to Orion NGSI v2 API |
| `POST /subscriptions/:action` | Orion webhook receiver |
| `GET /sql/:prompt` | Raw SQL query (URL-encoded) → JSON |
| `GET /subscriptions/montar/*` | Re-run `ngsi.montar()` to reload initial entities |
| `GET /save/:name` / `GET /load/:name` | Snapshot/restore NGSI state |
| `POST /upload` | File upload (multer → `public/uploads/`) |
| `GET /tablas` | Serve `data/tablas.json` |
| `GET /api/puntos` | Proxy to external scoreboard JSON (`public.xc26.didev.es/json`); used by the `puntos` overlay |
| `POST /xtra2` | Ingest telemetry (`PosVuelo` / `PuntosXtra2`) |

> El overlay de **clima** ya **no** usa el proxy del servidor: llama a **Open-Meteo**
> (`api.open-meteo.com`) directamente desde el navegador.

### Logs

At runtime, CSV log files are written to `server/logs/` (created automatically): `http.csv`, `sockets.csv`, `NGSI.csv`, `proxy.csv`, `mariadb.sql`.
