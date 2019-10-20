@echo off

if [%1]==[] (
  echo missing device name as parameter
  goto :end
)

set devicename=%1

rem eleall files from dist
FOR %%F IN ("dist\*.*") DO (
  echo Uploading file %%F...
  curl --form "fileupload=@%%F;filename=/%%~nxF" http://%devicename%/ %curlopts%
)

:end