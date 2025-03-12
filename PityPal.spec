# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['main.py'],
    pathex=['D:python311.dll'],
    binaries=[],
    datas=[('web', 'web'), ('backend\\services\\pity_predictor', 'backend\\services\\pity_predictor'), ('icon.ico', '.')],
    hiddenimports=['sklearn.ensemble', 'sklearn.tree', 'sklearn.preprocessing', 'pandas', 'matplotlib', 'numpy'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=True,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [('v', None, 'OPTION')],
    exclude_binaries=True,
    name='PityPal',
    debug=True,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['icon.ico'],
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='PityPal',
)
