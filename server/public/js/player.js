/** Codigo para el player */

// Estado global
let endpoint = "";
let estadoPlayer = "";
let pc = null;
let ultimoEndpointReproducido = "";
let desbloqueoAudioRegistrado = false;

// Elementos del DOM
let contenedor = document.getElementById("contenedor");
let video = document.getElementById("video");

// Sockets
const socket = typeof io === "function" ? io() : null;


// Animaciones
function cogerAnimaciones() {
    fetch("/v2/entities?type=Animaciones")
        .then(res => {
            if (!res.ok) throw new Error("No se pudo obtener la entidad de Animaciones");
            return res.json();
        })
        .then(json => {
            estadoPlayer = String(json?.[0]?.player?.value || "").toLowerCase();

            switch (estadoPlayer) {
                case "visible":
                    mostrarPlayer();
                    break;
                case "oculto":
                    esconderPlayer();
                    break;
                default:
                    console.warn("Valor desconocido para player:", estadoPlayer);
            }
        })
        .catch(err => {
            console.error("Error al recibir animacion:", err);
        });
}

function esconderPlayer() {
    console.log("Escondiendo player...");
    if (!contenedor) return;
    contenedor.style.right = "-100%";
}

function mostrarPlayer() {
    console.log("Mostrando player...");
    if (!contenedor) return;
    contenedor.style.right = "0px";
}


// Stream / Endpoint
function cogerEndpoint() {
    return fetch("/v2/entities?type=Player")
        .then(res => {
            if (!res.ok) throw new Error("No se pudo obtener la entidad de Player");
            return res.json();
        })
        .then(json => {
            console.log("Entidad de Player recibida:", json);

            endpoint = String(json?.[0]?.endpoint?.value || "").trim();
            console.log("Endpoint del stream:", endpoint);

            return endpoint;
        })
        .catch(err => {
            console.error("Error al recibir endpoint de stream:", err);
            return "";
        });
}



function stopPlay() {
    if (pc) {
        pc.close();
        pc = null;
    }

    if (video) {
        video.pause();
        video.srcObject = null;
        video.removeAttribute("src");
        video.muted = true;
        video.load();
    }

    ultimoEndpointReproducido = "";
}

/**
 * Espera a que el proceso de ICE Gathering se complete en la conexión WebRTC.
 * @param {RTCPeerConnection} peerConnection 
 * @returns 
 */
function esperarIceCompleto(peerConnection) {
    if (!peerConnection || peerConnection.iceGatheringState === "complete") {
        return Promise.resolve();
    }

    return new Promise(resolve => {
        let comprobarIce = () => {
            if (peerConnection.iceGatheringState !== "complete") return;
            peerConnection.removeEventListener("icegatheringstatechange", comprobarIce);
            resolve();
        };

        peerConnection.addEventListener("icegatheringstatechange", comprobarIce);
    });
}


async function reproducirStream() {
    let endpointActual = await cogerEndpoint();
    let endpointNormalizado = String(endpointActual || "").trim();

    if (!endpointNormalizado) {
        console.log("No hay endpoint configurado para el player");
        stopPlay();
        return;
    }

    if (endpointNormalizado === ultimoEndpointReproducido && pc) {
        console.log("El endpoint ya se esta reproduciendo:", endpointNormalizado);
        return;
    }

    let server = window.location.hostname;
    await playWebRTC(server,endpointNormalizado);
}

// REPRODUCCIÓN WHEP
/**
 * Conecta con el servidor mediante WHEP y empieza a recibir el stream.
 * @param {string} server - Host o IP del servidor MediaMTX.
 * @param {string} streamName - Nombre del stream a reproducir.
 */
async function playWebRTC(server, streamName) {    
    try {
        pc = new RTCPeerConnection();
        
        // Renderizar el stream cuando lleguen pistas remotas.
        pc.ontrack = (event) => {
            console.log('Track recibido:', event.track.kind);
            video.srcObject = event.streams[0];
        };
        
        // Vigilar cambios de estado de ICE.
        pc.oniceconnectionstatechange = () => {
            console.log('ICE state:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'disconnected' || 
                pc.iceConnectionState === 'failed' ||
                pc.iceConnectionState === 'closed') {
            }
        };

        // Solicitar recepción de audio y vídeo.
        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });

        // Crear la oferta SDP local.
        let offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await esperarIceCompleto(pc);

        // Enviar la oferta al endpoint WHEP.
        let url = `http://${server}:8889/${streamName}/whep`;
        console.log('WHEP URL:', url);
        

        // Intercambiar SDP con el servidor.
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/sdp'
            },
            body: pc.localDescription?.sdp || offer.sdp
        });

        // Validar la respuesta del servidor.
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let answerSDP = await response.text();
        await pc.setRemoteDescription(new RTCSessionDescription({
            type: 'answer',
            sdp: answerSDP
        }));

        console.log('WebRTC iniciado correctamente');
        
    } catch (error) {
        console.error('Error en WebRTC:', error);
        alert('Error al iniciar WebRTC: ' + error.message);
        stopPlay();
    }
}


// Sockets de eventos
if (socket) {
    socket.on("message", msg => {
        if (typeof msg !== "string") return;
        console.log("Mensaje recibido por socket:", msg);

        if (msg.includes("urn:ngsi-ld:Animaciones:")) {
            cogerAnimaciones();
        }

        if (msg.includes("urn:ngsi-ld:Player:")) {
            reproducirStream();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Player cargado, obteniendo animaciones...");
    cogerAnimaciones();
    reproducirStream();
});
