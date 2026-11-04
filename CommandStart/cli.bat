@echo off
title JRMSU Library Terminal Governance CLI
cls
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0cli.ps1" %*
if "%~1"=="" pause
