@echo off
echo.
@REM *** HomeDing Update of WebFiles tool. ***
@REM 
@REM This utility copies the dist files to 
@REM - the documentation project for the .
@REM - the samples folders standard and minimal.
@REM 
@REM Create the distribution files using `npm run build` and `npm run pack`

echo *** Updating public released files on homeding.github.io...

if [%1]==[] (
  echo missing version parameter
  echo use updateWebFiles.bat v10
  goto :end
)

set version=%1
set tar=%USERPROFILE%\Projects\homeding-docu

set rcflags=/XO /FFT /NJH /NS /NC /NFL /NDL /NJS

robocopy dist %tar%\%version% /S /PURGE %rcflags%
echo copied: Full WebUI

robocopy dist-mini %tar%\%version%m /S /PURGE %rcflags%
echo copied: Minimal WebUI

echo.
echo *** Updating data folders in examples

set tar=%USERPROFILE%\Documents\Arduino\libraries\HomeDing

robocopy dist %tar%\examples\standard\data /S /PURGE %rcflags% /XF list.txt
echo copied: standard example

robocopy dist-mini %tar%\examples\minimal\data /S /PURGE %rcflags% /XF list.txt
echo copied: minimal example

copy upload.h %tar%\src 
echo copied: upload.h

echo done.

:end
