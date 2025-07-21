@echo off
echo ================================================
echo    MISE A JOUR DES DEPENDANCES EXPO
echo ================================================
echo.

echo [1/3] Sauvegarde de l'etat actuel...
if not exist "package.json.backup" copy package.json package.json.backup

echo [2/3] Installation des mises a jour recommandees...
call npm install @react-native-async-storage/async-storage@2.1.2 ^
                expo@53.0.20 ^
                expo-font@~13.3.2 ^
                expo-router@~5.1.4 ^
                expo-web-browser@~14.2.0 ^
                react-native@0.79.5 ^
                react-native-safe-area-context@5.4.0 ^
                react-native-screens@~4.11.1 --save

echo [3/3] Nettoyage du cache...
call npm cache clean --force

echo.
echo ================================================
echo    MISE A JOUR TERMINEE
echo    Executez clean-start.bat pour relancer l'app
echo ================================================
