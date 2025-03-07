@echo off
setlocal
set loc=0

cd ..\docker\orion && set loc=1
IF %loc% EQU 1  ( goto start )

echo Command executed in wrong directory (\tests)
goto :eof

:start
echo.
echo Starting Orion NGSI server on localhost:1026
echo.
docker-compose up
cd ..\..\tests