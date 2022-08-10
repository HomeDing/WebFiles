@echo off
echo.
echo *** HomeDing Update of WebFiles tool. ***
echo *** This utility copies the dist files to the documentation project. ***
echo.
echo *** create the distribution files using `npm run build` and `npm run pack`
echo.

echo.
echo Updating public released files on homeding.github.io...

if [%1]==[] (
  echo missing version parameter
  echo use updateWebFiles.bat v04
  goto :end
)

set version=%1
set tar=C:\Users\Matthias\OneDrive\Dokumente\homeding
set rcflags=/XO /FFT /NJH /NS /NC /NFL /NDL /NJS

robocopy dist %tar%\%version% /S /PURGE %rcflags%
echo copied: Full WebUI

robocopy dist-mini %tar%\%version%m /S /PURGE %rcflags%
echo copied: Minimal WebUI

echo.
echo Updating data folders in examples

set tar=C:\Users\Matthias\Projects\Arduino\Sketches\Libraries\HomeDing

robocopy dist %tar%\examples\standard\data /S /PURGE %rcflags% 
echo copied: standard example

robocopy dist-mini %tar%\examples\minimal\data /S /PURGE %rcflags% 
echo copied: minimal example

copy upload.h %tar%\src 
echo copied: upload.h

echo done.

:end
