// Variables globales
let servers = [];
let selectedServer = null;
let accountType = 'crack'; // 'official' ou 'crack'
let currentPlayer = 'Steve'; // Pseudo par défaut

// Initialisation
window.addEventListener('DOMContentLoaded', () => {
    loadServers();
    setupEventListeners();
    loadNotifications();
});

// Charge les serveurs depuis l'API
async function loadServers() {
    try {
        const response = await window.ezlauncher.fetchServers();
        servers = response.servers;
        renderServerList();
    } catch (error) {
        showNotification(`Erreur lors du chargement des serveurs : ${error.message}`, 'error');
    }
}

// Configure les écouteurs d'événements
function setupEventListeners() {
    // Bouton pour basculer entre officiel/crack
    document.getElementById('account-switcher').addEventListener('click', () => {
        accountType = accountType === 'official' ? 'crack' : 'official';
        document.getElementById('account-switcher').textContent =
            accountType === 'official' ? 'Crack' : 'Officiel';
        
        // Masquer/afficher les champs spécifiques
        document.getElementById('microsoft-login').style.display =
            accountType === 'official' ? 'block' : 'none';
        document.getElementById('crack-username').style.display =
            accountType === 'crack' ? 'block' : 'none';
    });

    // Bouton pour ajouter un serveur
    document.getElementById('add-server-button').addEventListener('click', () => {
        document.getElementById('add-server-modal').classList.add('active');
    });

    // Bouton pour annuler l'ajout d'un serveur
    document.getElementById('cancel-add-server').addEventListener('click', () => {
        document.getElementById('add-server-modal').classList.remove('active');
    });

    // Formulaire pour ajouter un serveur
    document.getElementById('add-server-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const ip = document.getElementById('server-ip').value;
        const port = document.getElementById('server-port').value || 25565;
        const name = document.getElementById('server-name').value || ip;
        
        try {
            await window.ezlauncher.addServer({ ip, name, port });
            showNotification(`Serveur ${name} ajouté avec succès !`, 'success');
            document.getElementById('add-server-modal').classList.remove('active');
            document.getElementById('add-server-form').reset();
            loadServers(); // Recharge la liste des serveurs
        } catch (error) {
            showNotification(`Erreur lors de l'ajout du serveur : ${error.message}`, 'error');
        }
    });
}

// Affiche la liste des serveurs
function renderServerList() {
    const serverList = document.getElementById('server-list');
    serverList.innerHTML = '';
    
    servers.forEach(server => {
        const serverItem = document.createElement('div');
        serverItem.className = 'server-item';
        serverItem.innerHTML = `
            <img src="http://${server.ip || server.savedIp}:8080${server.smallIcon}" width="32" height="32" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZD0iTTIyIDIyYTIyIDIyIDAgMCAwIDIyLTIyem0tMiAyYTIgMiAyIDAgMCAwIDItMmgtNnYyYTIgMiAyIDAgMCAwIDItMnptMiAyYTIgMiAyIDAgMCAwIDItMnYtMmgtMnYyYTIgMiAyIDAgMCAwIDItMnptMiAyYTIgMiAyIDAgMCAwIDItMnYtMmgtMnYyYTIgMiAyIDAgMCAwIDItMnptMiAyYTIgMiAyIDAgMCAwIDItMnYtMmgtMnZ2Mm0yIDJhMiAyIDIyIDAgMCAwIDItMmgtNnYtMmgtMnYyYTIgMiAyIDAgMCAwIDItMnptMiAyYTIgMiAyIDAgMCAwIDItMnYtMmgtMnYyYTIgMiAyIDAgMCAwIDItMnptMiAyYTIgMiAyIDAgMCAwIDItMnYtMmgtMnYyYTIgMiAyIDAgMCAwIDItMnptMiAyYTIgMiAyIDAgMCAwIDItMnYtMmgtMnZ2Mm0yIDJhMiAyIDIyIDAgMCAwIDItMmgtNnYtMmgtMnYyYTIgMiAyIDAgMCAwIDItMnptMiAyYTIgMiAyIDAgMCAwIDItMnYtMmgtMnYyYTIgMiAyIDAgMCAwIDItMnptMiAy" />
            <div class="server-info">
                <div class="server-name">${server.name || server.savedName || server.ip || server.savedIp}</div>
                <div class="server-motd">${server.motd || 'Aucune description'}</div>
            </div>
            <button class="delete-server" onclick="deleteServer('${server.ip || server.savedIp}')">×</button>
        `;
        serverItem.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-server')) return; // Ne pas sélectionner si on clique sur la croix
            selectServer(server);
        });
        serverList.appendChild(serverItem);
    });
}

// Supprime un serveur
async function deleteServer(ip) {
    try {
        await window.ezlauncher.removeServer(ip);
        showNotification(`Serveur ${ip} supprimé avec succès !`, 'success');
        loadServers(); // Recharge la liste des serveurs
    } catch (error) {
        showNotification(`Erreur lors de la suppression du serveur : ${error.message}`, 'error');
    }
}

// Sélectionne un serveur
async function selectServer(server) {
    selectedServer = server;
    
    // Affiche les détails du serveur
    const ip = server.ip || server.savedIp;
    const bigIconUrl = server.bigIcon ? `http://${ip}:8080${server.bigIcon}` : `http://${ip}:8080${server.smallIcon}`;
    
    document.getElementById('server-details').innerHTML = `
        <img src="${bigIconUrl}" class="background-image" onerror="this.style.display='none'" />
        <div class="server-details-content">
            <h2>${server.name || server.savedName || ip}</h2>
            <p>${server.motd || 'Aucune description'}</p>
            <p>Version : ${server.version || 'Inconnue'}</p>
            <p>IP : ${ip}:${server.port || 25565}</p>
            <div id="server-status"></div>
            <div class="version-info">
                <p>Modpack : ${server.hash ? server.hash.substring(0, 16) + '...' : 'Non spécifié'}</p>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button id="play-button" disabled>Jouer</button>
                <button id="update-button" style="display: none;">Mettre à jour</button>
            </div>
        </div>
    `;

    // Vérifie le statut du serveur
    await checkServerStatus(server);
}

// Vérifie le statut du serveur (whitelist + hash)
async function checkServerStatus(server) {
    try {
        const ip = server.ip || server.savedIp;
        const player = accountType === 'crack' ?
            document.getElementById('crack-username-input').value :
            document.getElementById('microsoft-username').textContent || currentPlayer;

        // Récupère le hash local si le modpack existe
        let localHash = null;

        const response = await window.ezlauncher.checkServer({
            ip: ip,
            player: player,
            hash: localHash
        });

        const statusDiv = document.getElementById('server-status');
        const playButton = document.getElementById('play-button');
        const updateButton = document.getElementById('update-button');

        if (!response.whitelisted && server.isPrivate) {
            statusDiv.innerHTML = `<span style="color: red;">❌ Vous n'êtes pas dans la whitelist !</span>`;
            playButton.disabled = true;
            updateButton.style.display = 'none';
            return;
        }

        if (!response.upToDate) {
            statusDiv.innerHTML = `<span style="color: orange;">⚠️ Modpack obsolète !</span>`;
            playButton.disabled = true;
            updateButton.style.display = 'block';
            updateButton.onclick = () => updateModpack(server, response.downloadUrl);
            
            // Ajoute une notification
            window.ezlauncher.addNotification({
                serverIp: ip,
                message: `Modpack obsolète pour ${server.name || ip}`
            });
            loadNotifications();
        } else {
            statusDiv.innerHTML = `<span style="color: green;">✅ Prêt à jouer !</span>`;
            playButton.disabled = false;
            updateButton.style.display = 'none';
            playButton.onclick = () => launchGame(server);
        }
    } catch (error) {
        showNotification(`Erreur lors de la vérification : ${error.message}`, 'error');
    }
}

// Met à jour le modpack
async function updateModpack(server, downloadUrl) {
    try {
        const ip = server.ip || server.savedIp;
        showNotification(`Téléchargement du modpack pour ${server.name || ip}...`, 'info');
        
        const result = await window.ezlauncher.downloadModpack({
            ip: ip,
            serverHash: server.hash
        });
        
        showNotification(`Modpack mis à jour avec succès !`, 'success');
        await checkServerStatus(server); // Re-vérifie le statut
    } catch (error) {
        showNotification(`Échec de la mise à jour : ${error.message}`, 'error');
    }
}

// Lance le jeu
function launchGame(server) {
    const ip = server.ip || server.savedIp;
    const player = accountType === 'crack' ?
        document.getElementById('crack-username-input').value :
        document.getElementById('microsoft-username').textContent || currentPlayer;

    // Log la connexion
    const startTime = new Date().toISOString();
    window.ezlauncher.logConnection({
        serverIp: ip,
        playerName: player,
        startTime: startTime,
        endTime: new Date().toISOString()
    });

    window.ezlauncher.launchGame({
        ip: ip,
        port: server.port || 25565,
        version: server.version || '1.19.2',
        username: player,
        isOfficial: accountType === 'official'
    });
}

// Affiche une notification
function showNotification(message, type = 'info') {
    const notificationsContainer = document.getElementById('notifications-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <span class="notification-close" onclick="this.parentElement.remove()">×</span>
    `;
    notificationsContainer.appendChild(notification);
    
    // Supprime la notification après 5 secondes
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Charge les notifications depuis la base de données
async function loadNotifications() {
    try {
        const notifications = await window.ezlauncher.getNotifications();
        const notificationsContainer = document.getElementById('notifications-container');
        notifications.forEach(notification => {
            showNotification(notification.message, 'info');
            window.ezlauncher.markNotificationRead(notification.id);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error.message);
    }
}
