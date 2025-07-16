# Bolt Expo Starter

Ce projet est une application mobile React Native construite avec Expo et TypeScript. Il utilise Expo Router pour la navigation et inclut plusieurs fonctionnalités modernes pour le développement mobile.

## 🚀 Technologies principales

- React Native avec TypeScript
- Expo SDK 53
- Expo Router pour la navigation
- React Navigation
- Lucide Icons pour les icônes
- Expo Camera pour les fonctionnalités de caméra
- Expo Blur pour les effets visuels
- Expo Haptics pour les retours haptiques
- Expo WebView pour les vues web intégrées

## 📋 Prérequis

- Node.js (version LTS recommandée)
- Expo CLI
- TypeScript
- Un éditeur de code (VS Code recommandé)

## 🛠️ Installation

1. Clonez le repository
2. Installez les dépendances :
```bash
npm install
```

3. Lancez l'application en développement :
```bash
npm run dev
```

## 📱 Structure du projet

```
project/
├── app/              # Composants de l'application
│   ├── (tabs)/      # Navigation tabulée
│   └── _layout.tsx  # Layout principal
├── components/       # Composants réutilisables
├── data/            # Données statiques
├── hooks/           # Hooks personnalisés
└── assets/          # Ressources statiques
```

## 🎯 Fonctionnalités

- Navigation tabulée
- Interface utilisateur moderne avec TypeScript
- Support pour les icônes personnalisées
- Intégration de la caméra
- Effets visuels (blur, gradients)
- Retours haptiques
- Support webview
- Gestion des liens et du splash screen

## 🚀 Scripts disponibles

- `npm run dev`: Lance l'application en mode développement
- `npm run build:web`: Exporte la version web de l'application
- `npm run lint`: Lance l'analyse de code

## 📝 Configuration

Le projet utilise plusieurs fichiers de configuration :
- `tsconfig.json` pour TypeScript
- `.prettierrc` pour le formatage du code
- `app.json` pour la configuration Expo

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier LICENSE pour plus de détails.

## 👥 Contributing

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.
