# XtraServer

Este código es para una Raspberry que funcione como un servidor para una Interfaz de video

## Como ejecutar

`node server.js`

# Repositorio

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
1. $ `git pull`
2. Generar cambios
3. $ `git add <archivo>`
4. $ `git commit -m "<mensaje relevante*>"`
5. Notificar el cambio
6. $ `git push origin main`
- **_*_** mensaje relevante: explica lo que has hecho en una frase (no olvides las comillas " o ')

### Control de cambios
- $ `git status --short`
- $ `git log --oneline --all --graph`