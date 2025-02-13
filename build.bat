@echo off
echo Installing Python dependencies...
pip install -r requirements.txt
pip install cx_Freeze bs4 webview pandas numpy requests

echo Building frontend...
cd frontend
call npm run build
cd ..

echo Creating executable...
python setup.py build

echo Build complete! Check the build directory for executable.
echo Press any key to close...
pause > nul