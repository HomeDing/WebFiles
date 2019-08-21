@echo off

if [%1]==[] (
  echo missing device name as parameter
  goto :end
)

set devname=%1

rem no ding.htm
rem no env.json
rem no config.json
call uploadFile.bat %devname% elements.json

call uploadFile.bat %devname% iotstyle.css

call uploadFile.bat %devname% index.htm
call uploadFile.bat %devname% setup.htm

call uploadFile.bat %devname% microsvg.js
call uploadFile.bat %devname% pieChart.svg
call uploadFile.bat %devname% pieChart.js
call uploadFile.bat %devname% lineChart.svg
call uploadFile.bat %devname% lineChart.js
call uploadFile.bat %devname% element.svg
call uploadFile.bat %devname% elementsvg.js

REM rem micro javascript
call uploadFile.bat %devname% micro.js 
call uploadFile.bat %devname% polyfill.js
call uploadFile.bat %devname% es6-promise.auto.js

rem not ding.htm
call uploadFile.bat %devname% ding-info.htm
call uploadFile.bat %devname% ding-log.htm
call uploadFile.bat %devname% ding-info-new.htm
call uploadFile.bat %devname% ding-templates.htm

REM rem micro IDE
call uploadFile.bat %devname% ding-ide.js
call uploadFile.bat %devname% ding-ide.htm

REM rem panel
call uploadFile.bat %devname% panel.js 
call uploadFile.bat %devname% panel.htm 

:end