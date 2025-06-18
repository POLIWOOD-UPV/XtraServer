docker run -it --rm ^
    --name xtraserver ^
    --mount type=bind,src="$(pwd)/server",dst=/home/app ^
    -p 80:80 ^
    avr24/xtraserver:v2.0 ^
    npm install