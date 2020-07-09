@echo off
echo.
echo makeMinDist.bat [icon]
echo create minDist forlder for minimal device Web UI implementation.

rem ===== fresh mindist folder =====
echo creating fresh folder...
rd mindist /Q /S
md mindist

set path=%path%;node_modules\.bin

rem ===== create minified versions
call node-sass iotstyle.scss mindist/iotstyle.css --output-style compressed

call html-minifier --collapse-whitespace --remove-tag-whitespace --remove-comments --minify-css true --minify-js true --quote-character ' microide.htm -o mindist/microide.htm
call uglifyjs microide.js -c -o mindist/microide.js -m

call html-minifier --collapse-whitespace --remove-tag-whitespace --remove-comments --minify-css true --minify-js true --quote-character ' ding.htm -o mindist/ding.htm
call uglifyjs micro.js -c -o mindist/micro.js -m

copy browserconfig.xml mindist
copy manifest.json mindist
copy spinner.gif mindist

REM ===== copy icons for min device ===== 
copy favicon48.png mindist
copy favicon192.png mindist
copy favicon270.png mindist
copy favicon512.png mindist
copy favicon.svg mindist

md mindist\i
copy i\start.svg mindist\i
copy i\stop.svg mindist\i
copy i\plus.svg mindist\i
copy i\minus.svg mindist\i
copy i\default.svg mindist\i\default.svg
copy i\ide.svg mindist\i


dir mindist /b /s

rem https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/storage/spiffs.html

REM C:\Users\Matthias\AppData\Local\Arduino15\packages\esp8266\tools\mkspiffs\2.5.0-3-20ed2b9\mkspiffs.exe -c mindist -b 4096 -p 256 -s 0x10000 minspiffs.bin

REM C:\Users\Matthias\AppData\Local\Arduino15\packages\esp8266\tools\mkspiffs\2.5.0-3-20ed2b9\mkspiffs.exe -i minspiffs.bin


rem https://diyprojects.io/esp-easy-flash-firmware-esptool-py-esp8266/#.XJ5v9ndFyUk

echo done.