# XtraServer

Este código es para usar en la red local montada en el evento **XtraChallenge**. Consta de varios servidores montados en **Docker**, el principal de estos (`/server`) siendo un servicio web montado con **node.js** ampliado con un servicio de **IoSockets**.
Contenedores:
- XtraServer (node.js)
- Orion (NGSI fiware)
- MongoDB (fiware)
- MariaDB (SQL server)

Hay varias areas de trabajo:
- Backend (NodeJS): en la carpeta `./server` y `./server/modules`.
- Frontend (HTML, CSS, JS): en la carpeta `./server/public`.
- Data (JSON, SQL): en la carpeta `./server/data`.
- Docker: en la carpeta `./docker`.
- Test (Postman): en la carpeta `./test`.

## Como ejecutar

### Installar
Windows: `install.bat`
Linux: `source install.sh`

### Para ejecutar varias veces (o en produccion)
- Arrancar: `docker-compose up`
- Parar: `docker-compose down`

### Desinstalar (Supongo) #Gonvita
Windows: `remove.bat`
Linux: `source remove.sh`

# Uso del Repositorio

## Configuración de git en la máquina

### Configuración git-hub / VScode
- $ `git config --global user.name "<nombre>"`
    #### Guarda tu nombre en la configuración global de Git (archivo ~/.gitconfig). Se usa para firmar commits.
- $ `git config --global user.email "<correo>"`
    #### Guarda tu email global; también se incluye en los commits.
- $ `it config --global core.editor "code --wait"`
    #### Configura el editor por defecto que Git abre (ej. para editar mensajes de commit). code --wait hace que VS Code espere hasta cerrar la ventana.
- $ `git config --global diff.tool vscode`
    #### Define la herramienta por defecto para comparar cambios (diff). Aquí la etiqueta es vscode.
- $ `git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'`
    #### Indica el comando exacto que Git llamará para abrir la comparación en VS Code. $LOCAL y $REMOTE son archivos temporales con las versiones a comparar.
- $ `git config --global merge.tool vscode`
    #### Define la herramienta usada para resolver merges (conflictos).
- $ `git config --global mergetool.vscode.cmd 'code --wait --merge $REMOTE $LOCAL $BASE $MERGED'`
    #### Comando que Git usa para abrir el merge tool en VS Code. Variables:
        - $REMOTE: versión remota
        - $LOCAL: tu versión
        - $BASE: ancestro común
        - $MERGED: archivo destino donde se guarda el resultado
### Verificacion / Edicion de configuración
- Listado de configuración: $ `git config --global --list`
    #### Lista todas las entradas de configuración global actuales (lo que viste en la terminal).
- Desconfigurar Sección: $ `git config --global --unset <ITEM>`
- Editar configuración: $ `git config --global --edit`

## Uso de git hub

### Acceso al repositorio

- $ `git clone https://github.com/POLIWOOD-git/XtraServer.git <carpeta>`


### Actualización de código
1. Generar cambios
2. $ `git add <archivo>`
3. $ `git commit -m "<mensaje relevante*>"`
4. $ `git pull` º
5. Notificar el cambio
6. $ `git push origin main`
- **_*_** mensaje relevante: explica lo que has hecho en una frase (no olvides las comillas " o ')
- **_º_** al hacer un pull, puedes causar un merge. Si esto ocurre y no sabes como resolverlo, no toques nada y avisa al responsable

### Control de cambios
- $ `git status --short`
- $ `git log --oneline --all --graph`