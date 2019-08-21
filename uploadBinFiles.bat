@echo off
echo.
echo *** HomeDing upload utility using the curl tool. ***
echo *** please download the original from http://curl.haxx.se/download.html ***
echo.

if [%1]==[] (
  echo missing device name as parameter
  goto :end
)

set devicename=%1
set curlopts=--retry 3

rem icons and bin
echo Uploading file spinner.gif...
curl --form "fileupload=@spinner.gif;filename=/spinner.gif" http://%devicename%/ %curlopts%

rem element icons
FOR %%F IN ("i\*.svg") DO (
  echo Uploading file %%F...
  curl --form "fileupload=@%%F;filename=/i/%%~nxF" http://%devicename%/ %curlopts%
)

rem file-type icons
FOR %%F IN ("ft\*.svg") DO (
  echo Uploading file %%F...
  curl --form "fileupload=@%%F;filename=/ft/%%~nxF" http://%devicename%/ %curlopts%
)

rem FavIcons
REM FOR %%F IN ("favicon*.*") DO (
REM   echo Uploading file %%F...
REM   curl --form "fileupload=@%%F;filename=/%%~nxF" http://%devicename%/ %curlopts%
REM )

echo Uploading file browserconfig.xml...
REM curl --form "fileupload=@browserconfig.xml;filename=/browserconfig.xml" http://%devicename%/ %curlopts%

echo Uploading file manifest.json...
REM curl --form "fileupload=@manifest.json;filename=/manifest.json" http://%devicename%/ %curlopts%

echo done.

:end