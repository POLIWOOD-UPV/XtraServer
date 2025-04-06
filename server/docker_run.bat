docker run -it --rm --name xtraserver ^
--mount type=bind,src="%cd%",dst=/home/app,readonly=false ^
-p 80:80 avr24/xtraserver:v2.0 ^
node server.js