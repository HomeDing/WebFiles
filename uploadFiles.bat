@echo off
echo upload all files changed today...

if [%1]==[] (
  echo missing device name as parameter
  goto :end
)

set devicename=%1
set curlopts=--retry 3

REM curl --form "fileupload=@%fname;filename=/%fname" http://%devicename%/ %curlopts%
REM forfiles /D +%DATE% /C 'cmd uploadFile.bat  curl --form "fileupload=@%fname;filename=/%fname" http://%devicename%/ %curlopts%'

forfiles /M *.htm /D +%DATE% /C "cmd /c uploadFile.bat %devicename% @file"
forfiles /M *.js /D +%DATE% /C "cmd /c uploadFile.bat %devicename% @file"
forfiles /M *.css /D +%DATE% /C "cmd /c uploadFile.bat %devicename% @file"

:end