@echo off
echo.
echo *** HomeDing Update of API documentation files. ***
echo *** This utility copies some files to the HomeDing WebFiles to share API data and visualization. ***

echo.
echo *** Copy to homeding-docu...
set tar=%USERPROFILE%\Projects\homeding-docu

copy elements.json %tar%
copy element.svg %tar%
copy elementsvg.js %tar%
copy microsvg.js %tar%

copy icons.svg %tar%
copy css\*.scss %tar%\css
copy iotstyle.css %tar%


echo.
echo *** Copy to blog...
set tar=%USERPROFILE%\Projects\blog\src
copy css\*.scss %tar%\css
copy docstyle.css %tar%

echo.
echo *** Copy to sfc...
set tar=sfc
copy *.css %tar%

:end