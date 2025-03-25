@echo off
echo.
echo ===================================================
echo      Starting VocalCanvas Application
echo ===================================================
echo.
echo Starting development server...
echo.
echo The application will open in your default browser shortly.
echo To stop the server, press Ctrl+C in this window.
echo.

call npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo Error starting development server.
    goto :error
)

goto :end

:error
echo.
echo An error occurred during startup.
pause
exit /b 1

:end 