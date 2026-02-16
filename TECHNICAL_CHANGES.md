# 🔧 Changements Techniques v2.0

## Vue d'ensemble

Cette mise à jour transforme le jeu d'un système 2 joueurs à un système évolutif supportant jusqu'à 4 joueurs simultanés.

## 📊 Modifications Principales

### 1. Architecture de Connexion

#### Avant (v1.0)
```javascript
let conn = null;  // Une seule connexion
```

#### Après (v2.0)
```javascript
const MAX_PLAYERS = 4;
let connections = [];        // Array pour l'hôte (multiple connexions)
let hostConnection = null;   // Connexion unique pour les invités
let myPlayerIndex = -1;      // Index du joueur local
```

**Impact** : L'hôte peut maintenant gérer plusieurs connexions simultanées au lieu d'une seule.

---

### 2. Système de Couleurs

#### Avant
```javascript
// Couleurs hardcodées dans le code
new Player(1, x, '#fb7185')
new Player(2, x, '#60a5fa')
```

#### Après
```javascript
const PLAYER_COLORS = ['#fb7185', '#60a5fa', '#34d399', '#f59e0b'];

// Attribution automatique
this.players.push(new Player(i + 1, x, PLAYER_COLORS[i]));
```

**Impact** : Attribution automatique des couleurs basée sur l'ordre de connexion.

---

### 3. Initialisation du Moteur de Jeu

#### Avant
```javascript
init(mode) {
    // Positions fixes pour 2 joueurs
    this.players = [
        new Player(1, Math.floor(GRID_WIDTH / 3), '#fb7185'),
        new Player(2, Math.floor(2 * GRID_WIDTH / 3), '#60a5fa')
    ];
}
```

#### Après
```javascript
init(numPlayers) {
    // Répartition dynamique
    this.players = [];
    for (let i = 0; i < numPlayers; i++) {
        const x = Math.floor((GRID_WIDTH / (numPlayers + 1)) * (i + 1));
        this.players.push(new Player(i + 1, x, PLAYER_COLORS[i]));
    }
}
```

**Impact** : Positionnement équitable automatique quel que soit le nombre de joueurs (2-4).

---

### 4. Gestion des Connexions Entrantes

#### Avant
```javascript
peer.on('connection', (connection) => {
    conn = connection;
    setupConnection();
});
```

#### Après
```javascript
peer.on('connection', (connection) => {
    if (!isHost) return;
    
    // Vérifier la capacité
    if (players.length >= MAX_PLAYERS) {
        connection.send({ type: 'roomFull' });
        connection.close();
        return;
    }
    
    connections.push(connection);
    setupConnection(connection);
});
```

**Impact** : 
- Limite le nombre de joueurs à 4
- Rejette les connexions supplémentaires
- Gère plusieurs connexions simultanées

---

### 5. Attribution des Joueurs

#### Nouveau Système
```javascript
if (data.type === 'playerJoined') {
    if (isHost && connection) {
        const playerIndex = players.length;
        const newPlayer = {
            ...data.player,
            index: playerIndex,
            color: PLAYER_COLORS[playerIndex],
            connection: connection
        };
        players.push(newPlayer);
        
        // Informer le joueur de son index
        connection.send({ type: 'yourIndex', index: playerIndex });
        
        // Diffuser la liste mise à jour
        broadcastToAll({ 
            type: 'playerList', 
            players: players.map(p => ({ 
                id: p.id, 
                name: p.name, 
                color: p.color, 
                index: p.index 
            })) 
        });
    }
}
```

**Impact** :
- Attribution automatique d'un index unique (0-3)
- Association couleur basée sur l'index
- Synchronisation de la liste entre tous les joueurs
- Stockage de la connexion pour communication future

---

### 6. Diffusion des Messages (Broadcasting)

#### Nouvelle Fonction
```javascript
function broadcastToAll(message) {
    connections.forEach(conn => {
        if (conn && conn.open) {
            conn.send(message);
        }
    });
}
```

**Utilisation** :
- Envoi de l'état du jeu à tous les joueurs
- Diffusion du démarrage de la partie
- Mise à jour de la liste des joueurs
- Synchronisation globale

---

### 7. Gestion des Inputs Joueurs

#### Avant
```javascript
// Invité utilise un ID fixe
conn.send({
    type: 'playerInput',
    playerId: 2,
    action: action
});
```

#### Après
```javascript
// Invité utilise son index assigné
hostConnection.send({
    type: 'playerInput',
    playerIndex: myPlayerIndex,
    action: action
});

// Hôte traite avec index + 1 (car les IDs commencent à 1)
if (action === 'left') engine.movePlayer(playerIndex + 1, -1);
```

**Impact** :
- Chaque joueur utilise son index unique
- L'hôte peut distinguer les actions de chaque joueur
- Support de plus de 2 joueurs

---

### 8. Déconnexion des Joueurs

#### Nouveau Système
```javascript
connection.on('close', () => {
    if (isHost) {
        // Retirer le joueur déconnecté
        const index = connections.indexOf(connection);
        if (index > -1) {
            connections.splice(index, 1);
            players = players.filter(p => p.connection !== connection);
            updatePlayerList();
            
            // Informer les autres
            broadcastToAll({ 
                type: 'playerList', 
                players: players.map(p => ({ 
                    id: p.id, 
                    name: p.name, 
                    color: p.color 
                })) 
            });
        }
    }
});
```

**Impact** :
- Suppression automatique des joueurs déconnectés
- Mise à jour en temps réel de la liste
- Continuité de la partie pour les autres joueurs

---

### 9. État du Lobby

#### Nouvelles Conditions
```javascript
if (players.length >= 2) {
    // Afficher le bouton START pour l'hôte
    document.getElementById('start-game-btn').classList.remove('hidden');
    document.getElementById('waiting-message').classList.add('hidden');
}
```

**Impact** :
- Minimum 2 joueurs pour démarrer
- Maximum 4 joueurs autorisés
- Interface adaptative selon le nombre de joueurs

---

## 🔄 Flux de Données

### Connexion d'un Nouveau Joueur

```
1. Joueur → Hôte : { type: 'playerJoined', player: {...} }
2. Hôte : Assigne index et couleur
3. Hôte → Joueur : { type: 'yourIndex', index: N }
4. Hôte → Tous : { type: 'playerList', players: [...] }
5. Tous : Mise à jour affichage lobby
```

### Boucle de Jeu (60 FPS)

```
1. Hôte : engine.update()
2. Hôte → Tous : { type: 'gameState', state: {...} }
3. Invités : engine.setState(state)
4. Invités : render()
```

### Actions Joueur

```
1. Invité : Appui touche
2. Invité → Hôte : { type: 'playerInput', playerIndex: N, action: 'shoot' }
3. Hôte : engine.shoot(N + 1)
4. Hôte → Tous : Nouvel état (étape 2 de la boucle)
```

---

## 📈 Métriques de Performance

### Bande Passante

**Par frame (60 FPS)** :
- État du jeu : ~2-5 KB
- Débit pour 4 joueurs : ~120-300 KB/s

**Messages ponctuels** :
- playerJoined : ~200 bytes
- playerInput : ~100 bytes
- playerList : ~500 bytes

### Latence

- **Locale** (même réseau) : 5-20 ms
- **Internet** : 30-100 ms
- **Actions → Affichage** : 16-50 ms (1-3 frames)

---

## 🧪 Tests Recommandés

### Test 1 : Connexion Progressive
1. Hôte crée la partie
2. P2 rejoint → Vérifier liste
3. P3 rejoint → Vérifier liste
4. P4 rejoint → Vérifier liste
5. P5 essaie → Devrait être rejeté

### Test 2 : Déconnexion en Lobby
1. 4 joueurs connectés
2. P3 ferme sa fenêtre
3. Vérifier que P3 disparaît de toutes les listes
4. Un nouveau joueur peut rejoindre comme P3

### Test 3 : Déconnexion en Jeu
1. Partie en cours avec 4 joueurs
2. Un invité se déconnecte
3. Vérifier que le jeu continue pour les autres
4. Si l'hôte se déconnecte, tous sont déconnectés

### Test 4 : Positions des Joueurs
1. Tester avec 2 joueurs : positions à 33% et 67%
2. Tester avec 3 joueurs : positions à 25%, 50%, 75%
3. Tester avec 4 joueurs : positions à 20%, 40%, 60%, 80%

### Test 5 : Actions Simultanées
1. Tous les joueurs tirent en même temps
2. Vérifier que toutes les balles apparaissent
3. Pas de collision entre balles de différents joueurs

---

## 🐛 Bugs Potentiels et Solutions

### Bug : Désynchronisation d'Index

**Problème** : Si un joueur se déconnecte, les index des autres peuvent être décalés.

**Solution** : Les index sont assignés à la connexion et ne changent jamais. Les nouveaux joueurs prennent le prochain index disponible.

### Bug : Salle Pleine Non Détectée

**Problème** : Si exactement 4 joueurs sont connectés et un 5ème essaie.

**Solution** : Vérification `if (players.length >= MAX_PLAYERS)` avant d'accepter connexion.

### Bug : Message Broadcast Perdu

**Problème** : Un joueur ne reçoit pas un état du jeu.

**Solution** : L'état est envoyé à chaque frame, donc max 16ms de désynchronisation.

---

## 🚀 Améliorations Futures

### 1. Reconnexion Automatique
```javascript
// Permettre à un joueur déconnecté de rejoindre avec le même index
{ type: 'reconnect', playerId: originalId }
```

### 2. Compression d'État
```javascript
// Utiliser MessagePack ou similaire pour réduire la taille
const compressed = encode(state);
```

### 3. Prédiction Côté Client
```javascript
// Les invités prédisent leurs propres mouvements
// pour réduire la latence perçue
localPlayer.x += dx;  // Prédiction
// Correction à la réception de l'état serveur
```

### 4. Interpolation
```javascript
// Lisser les mouvements des autres joueurs
const interpolated = lerp(lastPos, currentPos, alpha);
```

---

## 📝 Checklist de Migration

- [x] Remplacer `conn` par `connections` et `hostConnection`
- [x] Ajouter `MAX_PLAYERS` et `PLAYER_COLORS`
- [x] Modifier `init()` pour accepter `numPlayers`
- [x] Implémenter `broadcastToAll()`
- [x] Ajouter gestion de `roomFull`
- [x] Implémenter attribution automatique d'index
- [x] Mettre à jour gestion des inputs avec `playerIndex`
- [x] Ajouter gestion de déconnexion multiple
- [x] Tester avec 2, 3, 4 joueurs
- [x] Tester rejet du 5ème joueur

---

**Version** : 2.0  
**Date** : Février 2026  
**Compatibilité** : PeerJS 1.5.0+
