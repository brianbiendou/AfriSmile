# Afrismile & Kolofap Mobile Application

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/yourusername/project) [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📱 À propos du projet

Cette application mobile est développée avec Expo et React Native, offrant une expérience utilisateur fluide et moderne. Elle est conçue pour fonctionner sur iOS et Android, avec une interface web également disponible.

## 🚀 Technologies utilisées

- **Framework**: Expo Router (React Native)
- **Langage**: TypeScript
- **Base de données**: Supabase
- **UI Components**:
  - Expo UI Components
  - Lucide React Native
  - React Native Gesture Handler
  - React Native Reanimated

## 🛠️ Configuration requise

- Node.js (version recommandée: 18.x ou supérieure)
- Expo CLI
- TypeScript
- Git

## 📦 Installation

1. Cloner le repository
```bash
git clone https://github.com/yourusername/project.git
cd project
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
Créez un fichier `.env` à la racine du projet et ajoutez vos configurations (voir `.env.example`)

4. Démarrer le projet
```bash
npm run dev
```

## 🏃‍♂️ Scripts disponibles

- `npm run dev`: Démarrer l'application en mode développement
- `npm run build:web`: Générer la version web de l'application
- `npm run lint`: Vérifier le code avec ESLint

## 📁 Structure du projet

```
project/
├── app/                 # Routes et pages de l'application
├── components/          # Composants réutilisables
├── contexts/           # Contextes React
├── data/               # Données statiques
├── hooks/             # Hooks personnalisés
├── lib/               # Fonctions utilitaires
├── supabase/          # Configuration Supabase
└── types/             # Types TypeScript
```

## 📱 Fonctionnalités principales

- Navigation fluide avec Expo Router
- Support multi-plateformes (iOS, Android, Web)
- Interface utilisateur moderne et réactive
- Intégration avec Supabase pour la gestion des données
- Support des animations natives
- Gestion des états avec React Context

## 🔧 Configuration

### Variables d'environnement
Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

## 📝 Contribuer

1. Fork le repository
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add some amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **Brian BIENDOU** - _Développeur principal_ - [Brian BIENDOU](https://github.com/brianbiendou)

## 🙏 Remerciements

- Merci à l'équipe Expo pour leur excellent framework
- Merci à la communauté React Native pour leur soutien
- Merci à tous les contributeurs à ce projet
