@echo off
echo Checking for processes on port 3000...

FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :3000 ^| findstr LISTENING') DO (
    echo Found process with PID: %%P on port 3000. Killing...
    taskkill /F /PID %%P
    echo Process killed.
)

echo No process found on port 3000 or it has been killed.
echo.
echo Navigating to react-frontend directory...
cd react-frontend

echo Starting React development server...
npm start

pause
