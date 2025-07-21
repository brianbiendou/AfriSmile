@echo off
echo ================================================
echo    NETTOYAGE AVANCE ET REDEMARRAGE METRO
echo ================================================
echo.

echo [1/8] Suppression des caches de Metro...
if exist ".expo" rd /s /q .expo
if exist ".metro" rd /s /q .metro
if exist ".metro-cache" rd /s /q .metro-cache
call npx expo r -c
call watchman watch-del-all 2>nul

echo [2/8] Nettoyage des caches Node.js...
if exist "node_modules\.cache" rd /s /q node_modules\.cache
del /f /q %TEMP%\.metro* 2>nul

echo [3/8] Nettoyage du cache npm...
call npm cache clean --force

echo [4/8] Suppression des fichiers temporaires de symbolisation...
del /f /q *.symbolicateLog 2>nul
del /f /q *.symbolicateCrash 2>nul

echo [5/8] Suppression des fichiers temporaires React Native...
if exist "node_modules\react-native\ReactAndroid\build" rd /s /q node_modules\react-native\ReactAndroid\build
if exist "android\.gradle" rd /s /q android\.gradle

echo [6/8] Réinitialisation de l'environnement Metro...
set EXPO_METRO_CONFIG_PATH=%cd%\metro.config.js
set EXPO_METRO_CACHE_DISABLED=true

echo [7/8] Augmentation des limites de mémoire et configuration du débogage...
set NODE_OPTIONS=--max-old-space-size=4096
set EXPO_DEBUG=true

echo [8/8] Démarrage avec configuration fraîche...
echo.
echo ================================================
echo    DEMARRAGE DE L'APPLICATION 
echo ================================================

echo Utilisation de la configuration Metro personnalisée : %EXPO_METRO_CONFIG_PATH%
call npx expo start --reset-cache
