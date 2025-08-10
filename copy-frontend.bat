@echo off
  echo Copying frontend source files...

  xcopy /Y "C:\Users\chole\eclipse-workspace\ITDAPROJECT1\itda-mern\fron     
  tend\src\*" "frontend\src\" /E /I

  echo Creating necessary directories...
  mkdir frontend\src\components 2>nul
  mkdir frontend\src\contexts 2>nul
  mkdir frontend\src\pages 2>nul

  echo Frontend files copied successfully!
  pause