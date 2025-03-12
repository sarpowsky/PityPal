; Path: installer_script.iss
#define MyAppName "PityPal"
#define MyAppVersion "1.0"
#define MyAppPublisher "sarpowsky"
#define MyAppURL "https://github.com/sarpowsky/PityPal"
#define MyAppExeName "PityPal.exe"

[Setup]
AppId={{7B52AC9A-9B9B-4E51-8CC1-F2B71DE97134}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputBaseFilename=PityPal_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
Name: "startmenu"; Description: "Create a Start Menu entry"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "dist\PityPal\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "icon.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\PityPal"; Filename: "{app}\PityPal.exe"; IconFilename: "{app}\icon.ico";  
Name: "{commondesktop}\PityPal"; Filename: "{app}\PityPal.exe"; IconFilename: "{app}\icon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent