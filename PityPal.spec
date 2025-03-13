# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['C:\\Users\\Sarp Can\\Desktop\\ideas\\genshin-pity-tracker\\main.py'],
    pathex=[],
    binaries=[],
    datas=[('C:\\Users\\Sarp Can\\Desktop\\ideas\\genshin-pity-tracker\\web', 'web'), ('C:\\Users\\Sarp Can\\Desktop\\ideas\\genshin-pity-tracker\\backend\\services\\pity_predictor', 'backend\\services\\pity_predictor')],
    hiddenimports=['sklearn.ensemble', 'sklearn.tree', 'sklearn.preprocessing', 'pandas', 'matplotlib', 'numpy'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='PityPal',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['C:\\Users\\Sarp Can\\Desktop\\ideas\\genshin-pity-tracker\\icon.ico'],
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
