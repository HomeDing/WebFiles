
echo off
SETLOCAL EnableDelayedExpansion
echo.
echo [1mDaily CI/CD for npm projects[0m
echo.
set exitcode=0

@REM echo Daily CI/CD for npm projects >daily.log
@REM help see https://ss64.com/nt/

echo Start: %DATE% - %TIME%
echo.

echo Node Version:
cmd /c "node -v"

echo NPM Version: 
cmd /c "npm -v"

echo. 

@REM echo Daily doctor...
@REM cmd /c "npm doctor  2>&1"
@REM IF ERRORLEVEL 1 (
@REM   echo [31mfailed: npm doctor issues.[30m
@REM   echo see "%CD%\daily.log"
@REM )
@REM https://nodejs.org/en/

echo Audit...
cmd /c "npm audit"
IF ERRORLEVEL 1 (
  echo [31mfailed: npm audit issues.[30m
  set exitcode=1
) else (
  echo ok.
)

echo.
echo Outdated...
cmd /c "npm outdated"
IF ERRORLEVEL 1 (
  echo [31mfailed: npm outdated issues.[30m
  set exitcode=2
) else (
  echo ok.
)

echo Exitcode=%exitcode%

if %exitcode% GTR 0 (
  goto error
) else (
  goto end
)


goto end

:error
echo.
@REM echo see "%CD%\daily.log"
echo try: npm update
echo try: npm audit fix
exit /B 1



@REM Exit /B 5

@REM https://stackoverflow.com/questions/20882628/query-npm-error-state-in-bat-file

echo ""
echo ** %errorlevel% **
IF ERRORLEVEL 1 ECHO error level is 1 or more
echo ** %errorlevel% **

@REM cmd /c "npm audit > install.log 2>&1"

echo ** %errorlevel% **

cmd /c "npm list 2>&1"
echo ** %errorlevel% **

@REM npm audit

@REM pause
echo ** %errorlevel% **

pause

@REM Exit 0
@REM Exit /B 5

:end
