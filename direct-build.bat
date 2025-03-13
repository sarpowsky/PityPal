@echo off
setlocal enabledelayedexpansion

REM Store absolute paths
set "PROJECT_DIR=%CD%"
echo Project directory: %PROJECT_DIR%

REM Ensure main.py exists
if not exist "%PROJECT_DIR%\main.py" (
    echo ERROR: main.py not found in %PROJECT_DIR%
    exit /b 1
)

REM Build frontend if needed
if not exist "%PROJECT_DIR%\web\index.html" (
    echo Building frontend...
    cd frontend
    call npm run build
    cd "%PROJECT_DIR%"
    
    REM Copy frontend files to web directory
    if not exist "web" mkdir web
    if exist "frontend\web" (
        xcopy /E /I /Y "frontend\web\*" "web\"
    ) else (
        echo ERROR: No web files built!
        exit /b 1
    )
)

REM Verify web directory contents
echo Web directory:
dir "%PROJECT_DIR%\web"

REM Run PyInstaller command directly
echo Building application...
pyinstaller --noconfirm --clean ^
  --name=PityPal ^
  --onedir ^
  --windowed ^
  --noconsole ^
  --icon="%PROJECT_DIR%\icon.ico" ^
  --add-data="%PROJECT_DIR%\web;web" ^
  --add-data="%PROJECT_DIR%\backend\services\pity_predictor;backend\services\pity_predictor" ^
  --hidden-import=sklearn.ensemble ^
  --hidden-import=sklearn.tree ^
  --hidden-import=sklearn.preprocessing ^
  --hidden-import=pandas ^
  --hidden-import=matplotlib ^
  --hidden-import=numpy ^
  "%PROJECT_DIR%\main.py"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PyInstaller failed
    exit /b 1
)

REM Copy icon.ico to dist folder
copy "%PROJECT_DIR%\icon.ico" "%PROJECT_DIR%\dist\PityPal\"

echo Build completed successfully!
echo Application is in %PROJECT_DIR%\dist\PityPal