@echo off
echo.
echo *** HomeDing Update of WebFiles tool. ***
echo *** This utility copies the dist files to the documentation project. ***
echo.
echo *** create the distribution files using `npm run build` and `npm run pack`
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
echo Full WebUI copied.

robocopy dist-mini %tar%\%version%m /S /PURGE %rcflags%
echo Minimal WebUI copied.

echo Updating data folders in examples

set tar=C:\Users\Matthias\Projects\Arduino\Sketches\Libraries\HomeDing\examples
robocopy dist %tar%\standard\data /S /PURGE %rcflags% 
echo standard example copied.

robocopy dist-mini %tar%\minimal\data /S /PURGE %rcflags% 
echo minimal example copied.

echo done.

:end
@REM exit 0
