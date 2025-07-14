@echo off
REM Start the server
start cmd /k "cd server && npm install && npm start"
REM Start the client
start cmd /k "cd client && npm install && npm start" 