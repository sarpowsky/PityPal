# Path: version.py

"""
Central version configuration for PityPal
Update this file when releasing a new version
"""

# Version information
VERSION = {
    'major': 2,
    'minor': 1,
    'patch': 0,
    'build': 0,
}

# String representation
VERSION_STRING = f"{VERSION['major']}.{VERSION['minor']}.{VERSION['patch']}"

# For display in UI (can include additional labels)
DISPLAY_VERSION = f"{VERSION_STRING}"

# For installer/package naming
PACKAGE_VERSION = VERSION_STRING