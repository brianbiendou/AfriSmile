@echo off
echo ================================================
echo    REINITIALISATION COMPLETE DU PROJET
echo    ATTENTION: Cette operation est irreversible
echo ================================================
echo.

echo Etes-vous sur de vouloir effacer les dossiers node_modules et reinstaller toutes les dependances?
echo Cette operation prendra plusieurs minutes.
echo.
choice /C YN /M "Continuer (Y/N)? "
if errorlevel 2 goto :end

echo.
echo [1/5] Sauvegarde du package.json...
if not exist "package.json.backup" copy package.json package.json.backup

echo [2/5] Suppression des dossiers node_modules et yarn.lock...
if exist "node_modules" rd /s /q node_modules
if exist "yarn.lock" del /f /q yarn.lock
if exist "package-lock.json" del /f /q package-lock.json

echo [3/5] Nettoyage des caches...
if exist ".expo" rd /s /q .expo
if exist ".metro" rd /s /q .metro
if exist ".metro-cache" rd /s /q .metro-cache
call npm cache clean --force
call watchman watch-del-all 2>nul

echo [4/5] Reinstallation des dependances...
call npm install

echo [5/5] Installation complete.
echo.
echo ================================================
echo    REINITIALISATION TERMINEE
echo    Executez clean-start.bat pour demarrer
echo ================================================

:end
