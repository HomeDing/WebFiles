@echo off
echo.
echo *** HomeDing Update of WebFiles tool. ***
echo *** This utility copies the dist files to the documentation project. ***
echo.
echo *** create the distribution files using `npm run build` and `npm run pack`
echo.

echo Updating public released files on homeding.github.io

if [%1]==[] (
  echo missing version parameter
  echo use updateWebFiles.bat v04
  goto :end
)

set version=%1
set tar=C:\Users\Matthias\OneDrive\Dokumente\homeding

robocopy dist %tar%\%version% /S /PURGE /XO /FFT 

robocopy dist-mini %tar%\%version%m /S /PURGE /XO /FFT

:end
exit 0
