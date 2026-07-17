# EZLauncher

Launcher Electron pour Minecraft Forge, conçu pour fonctionner avec le plugin **EZLauncher-server**.

## 📌 Fonctionnalités
- **Liste des serveurs** : Affiche les serveurs disponibles avec leurs icônes.
- **Vérification automatique** : Vérifie la whitelist et le hash du modpack avant de jouer.
- **Téléchargement des modpacks** : Télécharge et vérifie les modpacks depuis le serveur.
- **Gestion des comptes** : Bascule entre les comptes **officiels (Microsoft)** et **crack**.
- **Notifications** : Affiche des notifications pour les modpacks obsolètes.
- **Historique** : Enregistre les connexions aux serveurs (durée, joueur, etc.).

## 🛠️ Installation

### Prérequis
- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [Git](https://git-scm.com/)
- Un serveur Minecraft avec le plugin **EZLauncher-server** installé

### Étapes
1. **Cloner le repository** :
   ```bash
   git clone https://github.com/toto789520/EZLauncher.git
   cd EZLauncher
   ```

2. **Installer les dépendances** :
   ```bash
   npm install
   ```

3. **Démarrer le launcher** :
   ```bash
   npm start
   ```

## 📡 Configuration

### Ajouter un serveur
Le launcher récupère automatiquement les serveurs depuis l'API du plugin **EZLauncher-server** (port `8080` par défaut).

Pour ajouter un serveur manuellement, modifie le fichier `renderer/script.js` et ajoute son IP à la liste `servers`.

### Exemple de configuration serveur
Le serveur doit avoir :
- Le plugin **EZLauncher-server** installé dans `mods/`.
- Un dossier `mode_client/` (ou un fichier `mode_client.zip`).
- Les fichiers `server-icon.png` et `server-icon-big.png` (optionnel).
- Le fichier `whitelist.json` si le serveur est privé.

## 🎮 Utilisation

1. **Sélectionner un serveur** : Cliquez sur un serveur dans la liste à gauche.
2. **Vérifier le modpack** : Le launcher vérifie automatiquement si le modpack est à jour.
3. **Mettre à jour** : Si le modpack est obsolète, cliquez sur "Mettre à jour".
4. **Jouer** : Cliquez sur "Jouer" pour lancer Minecraft.

### Comptes
- **Crack** : Utilise un pseudo libre (pas d'authentification).
- **Officiel** : Utilise un compte Microsoft (à implémenter).

## 📦 Build
Pour créer une version exécutable du launcher :
```bash
npm run build
```
Les exécutables seront générés dans le dossier `dist/`.

## ⚠️ Problèmes connus
- Le téléchargement parallèle des modpacks n'est pas encore implémenté (à améliorer).
- L'authentification Microsoft n'est pas encore intégrée (nécessite une bibliothèque comme `msa-auth`).

## 🔗 Liens
- [Plugin EZLauncher-server](https://github.com/toto789520/EZLauncher-server)
- [Minecraft Forge](https://files.minecraftforge.net/)
