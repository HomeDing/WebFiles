rem @echo off
echo.
echo copying all required files into the dist folder...

rem build all files
call npm run build

rd dist /Q /S
md dist

copy es6-promise*.js dist
copy polyfill.js dist

copy ding.js dist
copy elementsvg.js dist
copy micro.js dist
copy microsvg.js dist
copy panel.js dist
copy pieChart.js dist

rem npm run css-min
rem npm run min-upload
rem npm run min-micro
rem npm run min-ding
rem npm run min-ide

rem copy ding-ide.min.js dist
rem copy ding.min.js dist
rem copy micro.min.js dist

copy elements.json dist

copy *.svg dist
copy favicon*.png dist

copy index.htm dist
copy setup.htm dist
copy iotstyle.css dist

copy ding-*.htm dist
copy ding-ide.js dist

copy panel.* dist

copy browserconfig.xml dist
copy manifest.json dist

md dist\i
copy i\*.svg dist\i

rem // when using IDE:

md dist\ft
copy ft\*.svg dist\ft

echo done.