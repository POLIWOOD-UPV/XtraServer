// hola
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  shaka.polyfill.installAll();

  if (!shaka.Player.isBrowserSupported()) {
    console.error("Este navegador no soporta Shaka Player.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const contentUrl = params.get('content');

  console.log(contentUrl)
  fetch(contentUrl)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(text => {
      console.log("📄 Contenido recibido de " + contentUrl + ":\n" + text);
    })
    .catch(err => {
      console.error("❌ Error al hacer fetch del manifiesto:", err);
    });

  if (!contentUrl) {
    console.error("No se ha especificado ninguna URL de contenido.");
    return;
  }

  // Registrar parser para HLS (.m3u8)
  shaka.media.ManifestParser.registerParserByMime(
    'application/vnd.apple.mpegurl',
    shaka.hls.HlsParser
  );
  shaka.media.ManifestParser.registerParserByExtension(
    'm3u8',
    shaka.hls.HlsParser
  );

  const video = document.getElementById('video');
  const player = new shaka.Player(video);

  player.addEventListener('error', onErrorEvent);

  player.configure({
    drm: {
      servers: {
        'com.widevine.alpha': 'https://cwip-shaka-proxy.appspot.com/no_auth'
      }
    }
  });

  player.load(contentUrl).then(() => {
    console.log('Video cargado correctamente:', contentUrl);
  }).catch(onError);
}

function onErrorEvent(event) {
  onError(event.detail);
}

function onError(error) {
  console.error('Error en Shaka Player:', error);
}
