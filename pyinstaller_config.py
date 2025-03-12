# Path: pyinstaller_config.py
import PyInstaller.__main__
import os
import sys
import shutil
from pathlib import Path

# Define application information
APP_NAME = "GenshinWishTracker"
APP_VERSION = "1.0.0"

# Define paths
MAIN_PY = "main.py" 
FRONTEND_DIR = "web"
ICON_PATH = "assets/icon.ico"
MODEL_DIR = "backend/services/pity_predictor"

# Create build directories if they don't exist
if not os.path.exists("dist"):
    os.makedirs("dist")

# PyInstaller arguments
args = [
    MAIN_PY,
    '--name=%s' % APP_NAME,
    '--onedir',
    '--windowed',
    '--icon=%s' % ICON_PATH,
    '--add-data=%s;%s' % (FRONTEND_DIR, FRONTEND_DIR),
    '--add-data=%s;%s' % (MODEL_DIR, MODEL_DIR),
    '--hidden-import=sklearn.ensemble',
    '--hidden-import=sklearn.tree',
    '--hidden-import=sklearn.preprocessing',
    '--hidden-import=pandas',
    '--hidden-import=matplotlib',
    '--hidden-import=numpy',
    '--exclude-module=tkinter',
    '--clean',
    '--noconfirm',
]

# Run PyInstaller
PyInstaller.__main__.run(args)

# Copy additional files needed
shutil.copy("requirements.txt", "dist/%s" % APP_NAME)

print(f"Build completed successfully! Output in dist/{APP_NAME}/")