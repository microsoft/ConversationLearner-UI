if "%1"=="" goto usage

set lt_test=%1

:repeat
call npm run cypress -- run --record false --spec  "cypress\integration\Regression\%lt_test%"
if ERRORLEVEL 1 goto eoj
goto repeat

:usage
echo ERROR- Missing path and file name of spec file to run

:eoj
echo ERRORLEVEL = %ERRORLEVEL%