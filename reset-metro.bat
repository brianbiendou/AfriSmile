@echo off
echo === NETTOYAGE DES CACHES ET DES FICHIERS TEMPORAIRES ===
echo.

echo 1. Suppression du dossier node_modules/.cache
rmdir /s /q node_modules\.cache
echo.

echo 2. Suppression du cache Metro
rmdir /s /q node_modules\.metro-cache
echo.

echo 3. Suppression du cache Expo
rmdir /s /q .expo
echo.

echo 4. Suppression du cache NPM
echo npm cache clean --force
call npm cache clean --force
echo.

echo 5. Suppression des fichiers lock
if exist package-lock.json del /f package-lock.json
if exist yarn.lock del /f yarn.lock
echo.

echo 6. Réinstallation des dépendances
echo npm install
call npm install
echo.

echo 7. Redémarrage avec un cache propre
echo npx expo start --clear
echo.
echo === NETTOYAGE TERMINÉ ===
echo Pour démarrer l'application, exécutez la commande suivante :
echo npx expo start --clear
