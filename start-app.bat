@echo off
echo ========================================
echo    Application Afrismile ^& Kolofap
echo ========================================
echo.

echo Verification de l'environnement...
if not exist "package.json" (
    echo ERREUR: Fichier package.json non trouve
    echo Veuillez vous placer dans le dossier du projet
    pause
    exit /b 1
)

echo Verification des dependances...
if not exist "node_modules" (
    echo Installation des dependances...
    npm install
    if errorlevel 1 (
        echo ERREUR: Echec de l'installation des dependances
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependances trouvees
)

echo.
echo Verification de la configuration...
if not exist ".env" (
    echo ATTENTION: Fichier .env manquant
    echo Veuillez configurer vos variables d'environnement
    pause
)

echo.
echo ========================================
echo   Lancement de l'application...
echo ========================================
echo.
echo 🌐 Interface Web: http://localhost:8081
echo 📱 Mobile: Scanner le QR code avec Expo Go
echo ⚡ Hot Reload: Active
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

npm run dev
