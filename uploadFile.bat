@echo off

if [%1]==[] (
  echo missing device name as parameter
  goto :end
)

if [%2]==[] (
  echo missing file name as parameter
  goto :end
)

set devicename=%1
set curlopts=--retry 3

curl --form "fileupload=@%2;filename=/%2" http://%devicename%/ %curlopts%

echo %2 uploaded.

:end