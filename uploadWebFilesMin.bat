@echo off
echo.
echo *** HomeDing upload utility using the curl tool. ***
echo *** please download the original from http://curl.haxx.se/download.html ***

set devname=minding
set curlopts=-0 --retry 3

@echo on
curl -T iotstyle.min.css "http://%devname%/iotstyle.css" %curlopts%
curl -T micro.min.js "http://%devname%/micro.js" %curlopts%
curl -T ding.min.js "http://%devname%/ding.js" %curlopts%
curl -T microide.min.js "http://%devname%/microide.js" %curlopts%

REM curl -T index.htm "http://%devname%/index.htm" %curlopts%
REM curl -T spinner.gif "http://%devname%/spinner.gif" %curlopts%

rem icons
REM curl -T i\default.svg "http://%devname%/i/device.svg" %curlopts%
REM curl -T micro.js "http://%devname%/micro.js" %curlopts%
REM curl -T ding.js "http://%devname%/ding.js" %curlopts%
