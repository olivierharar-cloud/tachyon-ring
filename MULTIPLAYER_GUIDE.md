# 🎮 Guide Multijoueur - Tachyon Ring (4 Joueurs)

## ✨ Nouvelles Fonctionnalités

Votre jeu **Tachyon Ring** supporte maintenant jusqu'à **4 joueurs simultanés** en mode réseau peer-to-peer !

### 🎯 Caractéristiques Principales

- **Jusqu'à 4 joueurs** peuvent jouer ensemble sur le même écran
- **Connexion peer-to-peer** sans serveur (utilise PeerJS)
- **Attribution automatique** des couleurs et positions
- **Synchronisation en temps réel** de l'état du jeu
- **Interface modernisée** avec affichage clair des joueurs

## 🎨 Couleurs des Joueurs

Chaque joueur se voit automatiquement attribuer une couleur distincte :

1. **Joueur 1 (Host)** : 🔴 Rose (`#fb7185`)
2. **Joueur 2** : 🔵 Bleu (`#60a5fa`)
3. **Joueur 3** : 🟢 Vert (`#34d399`)
4. **Joueur 4** : 🟠 Orange (`#f59e0b`)

## 📍 Positions de Départ

Les joueurs sont répartis équitablement sur la grille :
- **2 joueurs** : positions 1/3 et 2/3 de la largeur
- **3 joueurs** : positions 1/4, 2/4 et 3/4 de la largeur
- **4 joueurs** : positions 1/5, 2/5, 3/5 et 4/5 de la largeur

## 🚀 Comment Jouer

### Pour l'Hôte (Host)

1. Ouvrez `multiplayer.html` dans votre navigateur
2. Entrez votre nom de joueur
3. Cliquez sur **"HOST GAME"**
4. Partagez le **Room ID** affiché avec vos amis
5. Attendez que les joueurs rejoignent (minimum 2 joueurs)
6. Cliquez sur **"START!"** quand tout le monde est prêt

### Pour Rejoindre (Guest)

1. Ouvrez `multiplayer.html` dans votre navigateur
2. Entrez votre nom de joueur
3. Entrez le **Room ID** fourni par l'hôte
4. Cliquez sur **"JOIN GAME"**
5. Attendez que l'hôte démarre la partie

## 🎮 Contrôles

Tous les joueurs utilisent les mêmes touches :

- **◀ / A** : Déplacer à gauche
- **▶ / D** : Déplacer à droite
- **ESPACE / ENTRÉE** : Tirer
- **ESC** : Pause (affiche le menu pause)

## 🔧 Architecture Technique

### Système de Connexion

- **L'hôte** gère la logique du jeu et diffuse l'état à tous les joueurs
- **Les invités** envoient leurs inputs à l'hôte
- Maximum **4 connexions simultanées**
- Gestion automatique de la déconnexion des joueurs

### Messages Réseau

Le système utilise plusieurs types de messages :

1. **`playerJoined`** : Quand un nouveau joueur rejoint
2. **`playerList`** : Mise à jour de la liste des joueurs
3. **`yourIndex`** : Attribution de l'index du joueur
4. **`gameStart`** : Démarrage de la partie
5. **`gameState`** : État du jeu (envoyé chaque frame par l'hôte)
6. **`playerInput`** : Actions des joueurs invités
7. **`roomFull`** : Salle pleine (rejeté)

### Synchronisation

- L'hôte met à jour le jeu à **60 FPS**
- L'état complet est diffusé chaque frame à tous les joueurs
- Les invités affichent l'état reçu sans calculs locaux
- Latence minimale grâce à PeerJS

## 🐛 Dépannage

### Connexion impossible

- Vérifiez que vous utilisez le bon **Room ID**
- Assurez-vous que l'hôte n'a pas démarré la partie
- Vérifiez votre connexion Internet
- Essayez de rafraîchir la page (F5)

### Déconnexion en cours de partie

- Si l'hôte se déconnecte, la partie se termine
- Si un invité se déconnecte, il est retiré de la liste
- Les autres joueurs peuvent continuer

### Salle pleine

- Le jeu accepte un **maximum de 4 joueurs**
- Si vous voyez "Room is full!", attendez qu'un joueur quitte
- Sinon, créez une nouvelle salle

## 📝 Notes Techniques

### PeerJS

Le jeu utilise **PeerJS 1.5.0** pour les connexions peer-to-peer :
- Pas besoin de serveur backend
- Connexions directes entre navigateurs
- Utilise des serveurs STUN/TURN publics

### Canvas

- Taille : `15 x 25` blocs
- Taille des blocs : `28px`
- Panneaux latéraux : `60px` chaque côté
- Responsive design pour différentes tailles d'écran

## 🎯 Conseils de Jeu

1. **Communication** : Utilisez Discord, Skype ou un autre outil pour coordonner
2. **Positions** : Chaque joueur a sa zone, évitez de vous gêner
3. **Coopération** : Travaillez ensemble pour compléter les formes
4. **Score partagé** : Le score est commun à tous les joueurs

## 🔮 Prochaines Améliorations Possibles

- [ ] Chat intégré dans le jeu
- [ ] Statistiques par joueur
- [ ] Replay des parties
- [ ] Modes de jeu compétitifs
- [ ] Personnalisation des couleurs
- [ ] Sauvegarde des scores

---

**Amusez-vous bien ! 🚀**
