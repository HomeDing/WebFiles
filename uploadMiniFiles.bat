@echo off
echo.
echo *** HomeDing upload utility uploading all dist files to device. ***
echo *** This utility is using the curl tool. Download the original from http://curl.haxx.se/download.html ***
echo.
echo *** create the distribution files using `npm run build` and `npm run pack`
echo *** start the upload using `uploadMiniFiles.bat (devicename)`
echo.

if [%1]==[] (
  echo missing device name as parameter
  goto :end
)

set devicename=%1
set curlopts=--retry 3

rem upload all files from dist
FOR %%F IN ("dist-mini/*.*") DO (
  echo Uploading file %%F...
  curl --form "fileupload=@dist-mini/%%F;filename=/%%~nxF" http://%devicename%/ %curlopts%
)

:end
