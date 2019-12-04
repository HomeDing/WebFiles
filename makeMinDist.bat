@echo off
echo.
echo makeMinDist.bat [icon]
echo create minDist forlder for minimal device Web UI implementation.

set iconname=%1
if [%1]==[] (
  echo using default Icon
  set iconname=default
)

rem ===== fresh mindist folder =====
echo creating fresh folder...
rd mindist /Q /S
md mindist

call npm run build:css-min
move iotstyle.min.css mindist\iotstyle.css

call npm run min-micro
move micro.min.js mindist\micro.js

call npm run min-index
move min-index.min.htm mindist\index.htm

call npm run min-setup
move setup.min.htm mindist\setup.htm

copy manifest.json mindist
copy browserconfig.xml mindist

copy min-env.json mindist\env.json
copy min-config.json mindist\config.json


REM ===== copy icons for min device ===== 
copy favicon180.png mindist

md mindist\i
copy i\start.svg mindist\i
copy i\stop.svg mindist\i
copy i\default.svg mindist\i\default.svg

dir mindist /w

rem https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/storage/spiffs.html

REM C:\Users\Matthias\AppData\Local\Arduino15\packages\esp8266\tools\mkspiffs\2.5.0-3-20ed2b9\mkspiffs.exe -c mindist -b 4096 -p 256 -s 0x10000 minspiffs.bin

REM C:\Users\Matthias\AppData\Local\Arduino15\packages\esp8266\tools\mkspiffs\2.5.0-3-20ed2b9\mkspiffs.exe -i minspiffs.bin


rem https://diyprojects.io/esp-easy-flash-firmware-esptool-py-esp8266/#.XJ5v9ndFyUk

echo done.