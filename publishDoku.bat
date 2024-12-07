@echo off
echo.
echo *** HomeDing Update of API documentation files. ***
echo *** This utility copies some files to the HomeDing Doku to share API data and visualisation. ***
echo.

set tar=%USERPROFILE%\Projects\homeding-docu

copy elements.json %tar%
copy element.svg %tar%
copy elementsvg.js %tar%
copy microsvg.js %tar%

copy icons.svg %tar%
copy iotstyle.css %tar%
copy css\*.scss %tar%\css

:end