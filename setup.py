from cx_Freeze import setup, Executable
import sys
import os

build_exe_options = {
    "packages": ["bs4", "pandas", "numpy", "sqlite3", "requests"],
    "includes": ["webview"],
    "excludes": [],
    "include_files": [
        ("frontend/dist", "web"),
        "README.md",
        "requirements.txt"
    ]
}

base = None
if sys.platform == "win32":
    base = "Win32GUI"

setup(
    name="GenshinWishTracker",
    version="1.0",
    description="Genshin Impact Wish Tracker",
    options={"build_exe": build_exe_options},
    executables=[
        Executable(
            "main.py", 
            base=base,
            target_name="GenshinWishTracker.exe"
        )
    ]
)