# XtraServer

Este código es para una Raspberry que funcione como un servidor para una Interfaz de video

## Como ejecutar

### Arrancar
Windows: `start.bat`
Linux: `source start.sh`
### Parar
Windows: `stop.bat`
Linux: `source stop.sh`

# Uso del Repositorio

## Configuración de git en la máquina

### Configuración git-hub / VScode
- $ `git config --global user.name "<nombre>"`
- $ `git config --global user.email "<correo>"`
- $ `it config --global core.editor "code --wait"`
- $ `git config --global diff.tool vscode`
- $ `git config --global difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'`
- $ `git config --global merge.tool vscode`
- $ `git config --global mergetool.vscode.cmd 'code --wait --merge $REMOTE $LOCAL $BASE $MERGED'`

### Verificacion / Edicion de configuración
- Listado de configuración: $ `git config --global --list`
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