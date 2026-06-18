@echo off
REM ============================================================
REM  Peace-Eshiet Chocolate Store API - one-click launcher for Windows
REM  Just double-click this file. Requires Node.js to be installed.
REM ============================================================

title Peace-Eshiet Chocolate Store API

REM Run from the folder this script lives in, regardless of where it's launched.
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [!] Node.js was not found on this computer.
  echo.
  echo      Please install it first ^(it is free^):
  echo        https://nodejs.org/   ^(download the "LTS" version, click Next/Next/Finish^)
  echo.
  echo      Then double-click start.bat again.
  echo.
  pause
  exit /b 1
)

echo Starting the Peace-Eshiet Chocolate Store API...
echo (Leave this window open while you use the API. Close it or press Ctrl+C to stop.)
echo.

node server.js

echo.
echo The server has stopped.
pause
