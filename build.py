# Path: build.py
import os
import sys
import subprocess
import shutil
from pathlib import Path
from version import VERSION_STRING

def main():
    """Build the PityPal application using PyInstaller."""
    # Define application information
    APP_NAME = "PityPal"
    APP_VERSION = VERSION_STRING
    
    print(f"Building {APP_NAME} v{APP_VERSION}...")
    
    # Check if web directory exists (frontend build)
    if not os.path.exists("web"):
        print("Error: 'web' directory not found!")
        print("Run the frontend build first:")
        print("  cd frontend && npm run build")
        return 1
    
    # Run PyInstaller with the spec file
    print("Running PyInstaller with PityPal.spec...")
    # Use the current Python interpreter to run PyInstaller
    python_exe = sys.executable
    cmd = [python_exe, "-m", "PyInstaller", "PityPal.spec", "--clean", "--noconfirm"]
    
    print(f"Running command: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error: PyInstaller failed with code {e.returncode}")
        return e.returncode
    
    # Copy additional files
    print("Copying additional files to dist folder...")
    try:
        dist_dir = os.path.join("dist", APP_NAME)
        # Copy license and requirements
        for file in ["requirements.txt", "LICENSE"]:
            if os.path.exists(file):
                shutil.copy(file, dist_dir)
                print(f"Copied {file}")
    except Exception as e:
        print(f"Warning: Failed to copy additional files: {e}")
    
    print(f"\nBuild completed successfully!")
    print(f"Output is in: dist/{APP_NAME}/")
    return 0

if __name__ == "__main__":
    sys.exit(main())