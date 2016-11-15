; installerInnoSetup.iss
;
; Sweet Home 3D, Copyright (c) 2007-2016 Emmanuel PUYBARET / eTeks <info@eteks.com>
;
; SweetHome3D-5.3-windows.exe setup program creator
; This script requires Inno setup available at http://www.jrsoftware.org/isinfo.php
; and a build directory stored in current directory containing :
;   a SweetHome3D.exe file built with launch4j
; + a jre... subdirectory containing a dump of Windows JRE without the files mentioned 
;   in the JRE README.TXT file (JRE bin/javaw.exe command excepted)     
; + a lib subdirectory containing SweetHome3D.jar and Windows Java 3D DLLs and JARs for Java 3D
; + file COPYING.TXT

[Setup]
AppName=Sweet Home 3D
AppVersion=5.3
AppCopyright=Copyright (c) 2007-2016 eTeks
AppVerName=Sweet Home 3D version 5.3
AppPublisher=eTeks
AppPublisherURL=http://www.eteks.com
AppSupportURL=http://sweethome3d.sourceforge.net
AppUpdatesURL=http://sweethome3d.sourceforge.net
DefaultDirName={pf}\Sweet Home 3D
DefaultGroupName=eTeks Sweet Home 3D
LicenseFile=..\..\COPYING.TXT
OutputDir=.
OutputBaseFilename=..\SweetHome3D-5.3-windows
Compression=lzma2/ultra64
SolidCompression=yes
ChangesAssociations=yes
VersionInfoVersion=5.3.0.0
VersionInfoTextVersion=5.3
VersionInfoDescription=Sweet Home 3D Setup
VersionInfoCopyright=Copyright (c) 2007-2016 eTeks
VersionInfoCompany=eTeks
; Install in 64 bit mode if possible
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "portuguese"; MessagesFile: "compiler:Languages\Portuguese.isl"
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"
Name: "italian"; MessagesFile: "compiler:Languages\Italian.isl"
Name: "german"; MessagesFile: "compiler:Languages\German.isl"
Name: "czech"; MessagesFile: "compiler:Languages\Czech.isl"
Name: "polish"; MessagesFile: "compiler:Languages\Polish.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "hungarian"; MessagesFile: "compiler:Languages\Hungarian.isl"
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"
Name: "greek"; MessagesFile: "compiler:Languages\Greek.isl"
Name: "japanese"; Messagesfile: "compiler:Languages\Japanese.isl"
Name: "swedish"; MessagesFile: "Swedish.isl"
Name: "chinesesimp"; Messagesfile: "ChineseSimp.isl"
Name: "bulgarian"; Messagesfile: "Bulgarian.isl"

[Tasks]
Name: desktopicon; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[InstallDelete]
; Remove old jres
Type: filesandordirs; Name: "{app}\jre6"
Type: filesandordirs; Name: "{app}\jre1.8.0_51"
Type: filesandordirs; Name: "{app}\jre1.8.0_60"
Type: filesandordirs; Name: "{app}\jre1.8.0_66"
; Remove Java3D 1.5.2 
Type: files; Name: "{app}\lib\j3d*.dll"
Type: files; Name: "{app}\lib\j3d*.jar"
Type: files; Name: "{app}\lib\vecmath.jar"

[Files]
Source: "build\*.TXT"; DestDir: "{app}"; Flags: ignoreversion 
Source: "build\lib\*.jar"; DestDir: "{app}\lib"; Flags: ignoreversion
Source: "build\lib\java3d-1.6\*.jar"; DestDir: "{app}\lib\java3d-1.6"; Flags: ignoreversion
Source: "build\lib\*.pack.gz"; DestDir: "{app}\lib"; Flags: ignoreversion
; Install JRE and DLLs for not 64 bit
Source: "build\SweetHome3D-x86.exe"; DestDir: "{app}"; DestName: "SweetHome3D.exe"; Flags: ignoreversion; Check: not Is64BitInstallMode
Source: "build\lib\x86\*.dll"; DestDir: "{app}\lib"; Flags: ignoreversion; Check: not Is64BitInstallMode
Source: "build\lib\java3d-1.6\x86\*.dll"; DestDir: "{app}\lib\java3d-1.6"; Flags: ignoreversion; Check: not Is64BitInstallMode
Source: "build\jre8\x86\*"; DestDir: "{app}\jre8"; Flags: ignoreversion recursesubdirs createallsubdirs; Check: not Is64BitInstallMode
; Install JRE and DLLs for 64 bit
Source: "build\SweetHome3D-x64.exe"; DestDir: "{app}"; DestName: "SweetHome3D.exe"; Flags: ignoreversion; Check: Is64BitInstallMode
Source: "build\lib\x64\*.dll"; DestDir: "{app}\lib"; Flags: ignoreversion; Check: Is64BitInstallMode
Source: "build\lib\java3d-1.6\x64\*.dll"; DestDir: "{app}\lib\java3d-1.6"; Flags: ignoreversion; Check: Is64BitInstallMode
Source: "build\jre8\x64\*"; DestDir: "{app}\jre8"; Flags: ignoreversion recursesubdirs createallsubdirs; Check: Is64BitInstallMode

[Icons]
Name: "{group}\Sweet Home 3D"; Filename: "{app}\SweetHome3D.exe"; Comment: "{cm:SweetHome3DComment}"
Name: "{group}\{cm:UninstallProgram,Sweet Home 3D}"; Filename: "{uninstallexe}"
Name: "{userdesktop}\Sweet Home 3D"; Filename: "{app}\SweetHome3D.exe"; Tasks: desktopicon; Comment: "{cm:SweetHome3DComment}"

[Run]
; Unpack largest jars
Filename: "{app}\jre8\bin\unpack200.exe"; Parameters:"-r -q ""{app}\jre8\lib\rt.pack.gz"" ""{app}\jre8\lib\rt.jar"""; Flags: runhidden; StatusMsg: "{cm:UnpackingMessage,rt.jar}";
Filename: "{app}\jre8\bin\unpack200.exe"; Parameters:"-r -q ""{app}\lib\SweetHome3D.pack.gz"" ""{app}\lib\SweetHome3D.jar"""; StatusMsg: "{cm:UnpackingMessage,SweetHome3D.jar}"; Flags: runhidden
; Propose user to launch Sweet Home 3D at installation end
Filename: "{app}\SweetHome3D.exe"; Description: "{cm:LaunchProgram,Sweet Home 3D}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; Delete unpacked jars
Type: files; Name: "{app}\jre8\lib\rt.jar"
Type: files; Name: "{app}\lib\SweetHome3D.jar"
; Delete files created by Launch4j
Type: filesandordirs; Name: "{app}\jre8\launch4j-tmp"

[CustomMessages]
SweetHome3DComment=Arrange the furniture of your house
french.SweetHome3DComment=Am�nagez les meubles de votre logement
portuguese.SweetHome3DComment=Organiza as mobilias da sua casa
brazilianportuguese.SweetHome3DComment=Organiza as mobilias da sua casa
czech.SweetHome3DComment=Sestavte si design interieru vaseho domu
polish.SweetHome3DComment=Zaprojektuj wnetrze swojego domu
hungarian.SweetHome3DComment=Keszitse el lakasanak belso kialakitasat!
chinesesimp.SweetHome3DComment=����������ܰС��
UnpackingMessage=Unpacking %1...
french.UnpackingMessage=D�compression du fichier %1...

[Registry]
Root: HKCR; Subkey: ".sh3d"; ValueType: string; ValueName: ""; ValueData: "eTeks Sweet Home 3D"; Flags: uninsdeletevalue
Root: HKCR; Subkey: ".sh3x"; ValueType: string; ValueName: ""; ValueData: "eTeks Sweet Home 3D"; Flags: uninsdeletevalue
Root: HKCR; Subkey: "eTeks Sweet Home 3D"; ValueType: string; ValueName: ""; ValueData: "Sweet Home 3D"; Flags: uninsdeletekey
Root: HKCR; Subkey: "eTeks Sweet Home 3D\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\SweetHome3D.exe,0"
Root: HKCR; Subkey: "eTeks Sweet Home 3D\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\SweetHome3D.exe"" -open ""%1"""

Root: HKCR; Subkey: ".sh3l"; ValueType: string; ValueName: ""; ValueData: "eTeks Sweet Home 3D Language Library"; Flags: uninsdeletevalue
Root: HKCR; Subkey: "eTeks Sweet Home 3D Language Library"; ValueType: string; ValueName: ""; ValueData: "Sweet Home 3D"; Flags: uninsdeletekey
Root: HKCR; Subkey: "eTeks Sweet Home 3D Language Library\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\SweetHome3D.exe,0"
Root: HKCR; Subkey: "eTeks Sweet Home 3D Language Library\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\SweetHome3D.exe"" -open ""%1"""

Root: HKCR; Subkey: ".sh3f"; ValueType: string; ValueName: ""; ValueData: "eTeks Sweet Home 3D Furniture Library"; Flags: uninsdeletevalue
Root: HKCR; Subkey: "eTeks Sweet Home 3D Furniture Library"; ValueType: string; ValueName: ""; ValueData: "Sweet Home 3D"; Flags: uninsdeletekey
Root: HKCR; Subkey: "eTeks Sweet Home 3D Furniture Library\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\SweetHome3D.exe,0"
Root: HKCR; Subkey: "eTeks Sweet Home 3D Furniture Library\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\SweetHome3D.exe"" -open ""%1"""

Root: HKCR; Subkey: ".sh3t"; ValueType: string; ValueName: ""; ValueData: "eTeks Sweet Home 3D Textures Library"; Flags: uninsdeletevalue
Root: HKCR; Subkey: "eTeks Sweet Home 3D Furniture Library"; ValueType: string; ValueName: ""; ValueData: "Sweet Home 3D"; Flags: uninsdeletekey
Root: HKCR; Subkey: "eTeks Sweet Home 3D Furniture Library\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\SweetHome3D.exe,0"
Root: HKCR; Subkey: "eTeks Sweet Home 3D Furniture Library\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\SweetHome3D.exe"" -open ""%1"""

Root: HKCR; Subkey: ".sh3p"; ValueType: string; ValueName: ""; ValueData: "eTeks Sweet Home 3D Plugin"; Flags: uninsdeletevalue
Root: HKCR; Subkey: "eTeks Sweet Home 3D Plugin"; ValueType: string; ValueName: ""; ValueData: "Sweet Home 3D"; Flags: uninsdeletekey
Root: HKCR; Subkey: "eTeks Sweet Home 3D Plugin\DefaultIcon"; ValueType: string; ValueName: ""; ValueData: "{app}\SweetHome3D.exe,0"
Root: HKCR; Subkey: "eTeks Sweet Home 3D Plugin\shell\open\command"; ValueType: string; ValueName: ""; ValueData: """{app}\SweetHome3D.exe"" -open ""%1"""
