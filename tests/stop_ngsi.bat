@echo off
setlocal
set loc=0

cd ..\docker\orion && set loc=1
IF %loc% EQU 1  ( goto stop )

echo Command executed in wrong directory (\tests)
goto :eof

:stop
docker-compose rm -fsv
cd ..\..\tests
echo Orion NGSI server Stopped