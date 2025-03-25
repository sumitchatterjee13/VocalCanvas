@echo off
echo.
echo ===================================================
echo        Installing VocalCanvas Application
echo ===================================================
echo.

echo Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo Error installing dependencies. Please check your npm installation.
    goto :error
)

echo.
echo Installation completed successfully!
echo Run run.bat to start the application.
goto :end

:error
echo.
echo An error occurred during installation.
pause
exit /b 1

:end
echo.
pause 