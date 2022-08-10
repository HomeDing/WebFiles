@echo off
echo.
echo [1mHomeDing upload utility uploading all dist files to device.[0m
echo.

if [%1]==[] (
  echo *** This utility is using the curl tool. Download the original from http://curl.haxx.se/download.html ***
  echo.
  echo *** create the distribution files using [1mnpm run build[0m and [1mnpm run pack[0m
  echo *** start the upload using [1muploadDistFiles.bat ^(devicename^)[0m
  echo.
  echo [31mmissing device name as parameter[30m
  goto :end
)

set devicename=%1
set curlopts=--retry 3

if [%2]==[/c] (
  echo clean existing files...
  @REM curl http://%devicename%/api/cleanweb
)

echo upload all files from ./dist/...
FOR %%F IN (dist/*.*) DO (
  echo [37m  %%F[30m
  curl --form "fileupload=@dist/%%F;filename=/%%~nxF" http://%devicename%/ %curlopts%
)

echo upload all files from ./dist/i/...
FOR %%F IN ("dist/i/*.svg") DO (
  echo [37m  %%F[30m
  curl --form "fileupload=@dist/i/%%F;filename=/i/%%~nxF" http://%devicename%/ %curlopts%
)
echo done.

:end
