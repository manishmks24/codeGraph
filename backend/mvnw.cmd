@echo off
setlocal
set "DIR=%~dp0"
"%DIR%tools\apache-maven-3.9.9\bin\mvn.cmd" %*
