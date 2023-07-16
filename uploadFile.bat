@echo off
@echo "use uploadFile <devicename> <file1> <file2>"

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

:next
echo upload file %2 to device %devicename%.

curl --form "fileupload=@%2;filename=/%2" http://%devicename%/ %curlopts%

if %ERRORLEVEL% EQU 0 (
  echo %2 uploaded.
) else (
  echo Upload failed, reason %errorlevel%
  exit /b %errorlevel%
)

if not [%3]==[] (
  shift /2
  goto :next
)

:end