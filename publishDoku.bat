@echo off
echo.
echo *** HomeDing Update of API documentation files. ***
echo *** This utility copies some files to the HomeDing WebFiles to share API data and visualization. ***
echo.

set tar=%USERPROFILE%\Projects\homeding-docu

copy elements.json %tar%
copy element.svg %tar%
copy elementsvg.js %tar%
copy microsvg.js %tar%

copy icons.svg %tar%
copy css\*.scss %tar%\css
copy iotstyle.css %tar%
copy docstyle.css %USERPROFILE%\Projects\blog\src\docstyle.css

:end