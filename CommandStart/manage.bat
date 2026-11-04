@echo off
title JRMSU Library Master Dev and Ops Controller
cls
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0manage.ps1" %*
if "%~1"=="" pause
