// Fichier de configuration Metro optimisé
// Il aide à résoudre les problèmes courants avec Metro Bundler

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// Éviter les problèmes avec les fichiers anonymes
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'cjs', 'mjs', 'json'];
config.resolver.assetExts = ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'webp', 'ttf'];

// Réduire les erreurs "no such file"
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
};

// Solution avancée pour le problème de symbolication
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Réécriture complète de la symbolication pour éviter les erreurs de fichiers anonymes
config.symbolicator = {
  customizeFrame: (frame) => {
    // Ignorer complètement les frames anonymes
    if (!frame.file || frame.file.includes('<anonymous>')) {
      return null;
    }
    
    // Vérifier si le fichier existe avant de tenter de l'ouvrir
    try {
      if (frame.file && !frame.file.startsWith('http')) {
        const filePath = path.resolve(frame.file);
        if (!fs.existsSync(filePath)) {
          return null; // Ignorer les fichiers qui n'existent pas
        }
      }
    } catch (e) {
      return null; // En cas d'erreur, ignorer le frame
    }
    
    return frame;
  },
};

// Améliorer la vitesse de bundling
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Empêcher Metro de faire crasher sur des fichiers inconnus
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Intercepter les requêtes de symbolication qui pourraient causer des erreurs
      if (req.url && req.url.includes('symbolicate')) {
        try {
          // Utiliser next directement pour éviter la manipulation risquée du flux de réponse
          return middleware(req, res, next);
        } catch (e) {
          // En cas d'erreur dans le middleware, on continue simplement
          return next();
        }
      }
      return middleware(req, res, next);
    };
  }
};

// Ajout d'un watcher personnalisé pour éviter les erreurs de watching
config.watchFolders = [
  path.resolve(__dirname),
  // Éviter de surveiller les dossiers qui pourraient causer des problèmes
  ...config.watchFolders.filter(folder => !folder.includes('node_modules')),
];

module.exports = config;
