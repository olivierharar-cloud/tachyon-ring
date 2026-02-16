# 🎮 Tachyon Ring - Jeu Multijoueur

Un jeu d'action multijoueur en temps réel où jusqu'à 4 joueurs combattent ensemble !

## 🌟 Nouveautés v2.0

### 🎯 Mode Multijoueur 4 Joueurs
- **Support de 2 à 4 joueurs** en simultané sur le même écran
- **Connexion peer-to-peer** sans serveur (PeerJS)
- **Synchronisation en temps réel** de tous les joueurs
- **Attribution automatique** des couleurs et positions

### 🎨 Design Amélioré
- Interface lobby modernisée style rétro-arcade
- Couleurs distinctes pour chaque joueur
- Affichage clair de la liste des joueurs
- Messages de statut en temps réel

## 📁 Structure du Projet

```
tachyon-ring/
├── multiplayer.html          # Jeu multijoueur (2-4 joueurs)
├── standalone.html           # Version solo
├── test-multiplayer.html     # Page de test pour le multijoueur
├── MULTIPLAYER_GUIDE.md      # Guide complet du mode multijoueur
├── src/
│   ├── App.tsx              # Application React principale
│   ├── components/          # Composants React
│   └── engine/              # Moteur de jeu
└── package.json
```

## 🚀 Démarrage Rapide

### Mode Multijoueur (Recommandé pour 2-4 joueurs)

1. **Ouvrez** `multiplayer.html` dans votre navigateur

2. **Pour l'hôte** :
   - Entrez votre nom
   - Cliquez sur "HOST GAME"
   - Partagez le Room ID avec vos amis

3. **Pour rejoindre** :
   - Entrez votre nom
   - Entrez le Room ID
   - Cliquez sur "JOIN GAME"

4. **L'hôte démarre** la partie quand tout le monde est prêt !

### Mode Solo

- Ouvrez `standalone.html` pour jouer seul
- Ou utilisez l'application React avec `npm run dev`

## 🎮 Contrôles

| Action | Touches |
|--------|---------|
| Déplacer à gauche | ◀ ou A |
| Déplacer à droite | ▶ ou D |
| Tirer | ESPACE ou ENTRÉE |
| Pause | ESC |

## 🎯 Règles du Jeu

1. **Objectif** : Compléter des formes rectangulaires en tirant sur les blocs
2. **Score** : Plus la forme est grande, plus vous gagnez de points
3. **Niveaux** : La difficulté augmente automatiquement
4. **Game Over** : Si les blocs atteignent le bas de l'écran

## 🌐 Configuration Réseau

### Hébergement (Host)

L'hôte gère :
- La logique du jeu
- La génération des formes
- La détection des collisions
- L'attribution des scores

### Invités (Guests)

Les invités :
- Envoient leurs actions à l'hôte
- Reçoivent l'état du jeu
- Affichent le rendu synchronisé

### Limites

- **Maximum 4 joueurs** par partie
- **Connexion Internet** requise
- **NAT traversal** géré par PeerJS

## 🔧 Installation pour Développement

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build
```

## 📦 Dépendances

### Mode Multijoueur (HTML)
- **PeerJS 1.5.0** - Connexion peer-to-peer
- **Tailwind CSS** - Styling moderne

### Application React
- **React 18** - Framework UI
- **Vite** - Build tool
- **TypeScript** - Typage statique

## 🎨 Couleurs des Joueurs

| Joueur | Couleur | Code |
|--------|---------|------|
| Joueur 1 | 🔴 Rose | `#fb7185` |
| Joueur 2 | 🔵 Bleu | `#60a5fa` |
| Joueur 3 | 🟢 Vert | `#34d399` |
| Joueur 4 | 🟠 Orange | `#f59e0b` |

## 🐛 Dépannage

### Impossible de se connecter ?

1. Vérifiez le Room ID (sensible à la casse)
2. Assurez-vous que l'hôte n'a pas démarré la partie
3. Vérifiez votre connexion Internet
4. Essayez de rafraîchir la page (F5)

### Lag ou déconnexion ?

1. Vérifiez votre connexion réseau
2. Fermez les applications qui utilisent beaucoup de bande passante
3. Si l'hôte se déconnecte, la partie se termine pour tous

### "Room is full!" ?

- Le maximum de 4 joueurs est atteint
- Attendez qu'un joueur quitte
- Ou créez une nouvelle partie

## 📝 Changelog

### Version 2.0 (Février 2026)
- ✨ Support de 4 joueurs simultanés
- 🎨 Nouveau système de couleurs
- 🔧 Amélioration de la gestion des connexions
- 📱 Interface lobby redessinée
- 📖 Documentation complète

### Version 1.0
- 🎮 Jeu de base fonctionnel
- 👥 Support de 2 joueurs
- 🌐 Connexion peer-to-peer

## 🤝 Contribution

Ce projet est en développement actif. N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation

## 📄 Licence

Projet personnel - Tous droits réservés

## 🎯 Améliorations Futures

- [ ] Chat intégré dans le jeu
- [ ] Statistiques individuelles par joueur
- [ ] Modes de jeu compétitifs
- [ ] Replay des parties
- [ ] Personnalisation des avatars
- [ ] Sauvegarde des scores en ligne
- [ ] Matchmaking automatique
- [ ] Tournois et classements

---

**Développé avec ❤️ pour Antigravity**

Pour plus d'informations sur le mode multijoueur, consultez [MULTIPLAYER_GUIDE.md](MULTIPLAYER_GUIDE.md)
