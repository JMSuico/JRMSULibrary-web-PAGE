@echo off
title JRMSU Library System Runner
cls
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" %*
if "%~1"=="" pause
