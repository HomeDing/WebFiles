@echo off
echo.
echo *** HomeDing upload utility uploading all dist files to device. ***
echo *** This utility is using the curl tool. Download the original from http://curl.haxx.se/download.html ***
echo.

if [%1]==[] (
  echo missing device name as parameter
  goto :end
)

set devicename=%1

rem upload all files from dist
FOR %%F IN ("dist/*.*") DO (
  echo Uploading file %%F...
  curl --form "fileupload=dist/@%%F;filename=/%%~nxF" http://%devicename%/ %curlopts%
)

rem upload all element icons
FOR %%F IN ("dist/i/*.svg") DO (
  echo Uploading file %%F...
  curl --form "fileupload=dist/i/@%%F;filename=/i/%%~nxF" http://%devicename%/ %curlopts%
)

:end
