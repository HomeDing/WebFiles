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
set rcflags=/XO /FFT /NJH /NS /NC /NFL /NDL /NJS

REM Update the published UI files for download
REM ===========================================

set tar=%USERPROFILE%\Projects\homeding-docu
echo updating files in %tar%  ...


robocopy dist %tar%\%version% /S /PURGE %rcflags%
echo copied: Full WebUI

robocopy dist-mini %tar%\%version%m /S /PURGE %rcflags%
echo copied: Minimal WebUI

echo.
echo *** Updating data folders in examples


REM Update the HomeDing Project data folders
REM ========================================
echo.

set tar=%USERPROFILE%\Documents\Arduino\libraries\HomeDing
echo updating files in %tar%  ...

robocopy dist %tar%\examples\standard\data /S /PURGE %rcflags% /XF list.txt
echo copied: standard example

robocopy dist-mini %tar%\examples\minimal\data /S /PURGE %rcflags% /XF list.txt
echo copied: minimal example

copy upload.h %tar%\src 
echo copied: upload.h


REM Update the Blog 
REM ========================================
echo.

set tar=%USERPROFILE%\Projects\blog\src
echo updating files in %tar% ...

robocopy sfc %tar%\sfc /S /PURGE %rcflags% /XD node_modules
echo copied SFC to Blog


REM ========================================

echo done.

:end
