const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

let mainWindow;
let db;

// Initialise la base de données SQLite
function initDatabase() {
    db = new sqlite3.Database(path.join(__dirname, 'history.db'));
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS connections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_ip TEXT NOT NULL,
                player_name TEXT NOT NULL,
                start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                end_time DATETIME,
                duration_minutes INTEGER DEFAULT 0
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                server_ip TEXT NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    });
}

// Calcule le SHA-256 d'un fichier
function calculateSHA256(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

// Télécharge un fichier avec Axios (pour le téléchargement parallèle)
async function downloadFile(url, destination) {
    const response = await axios({
        method: 'get',
        url: url,
        responseType: 'stream'
    });
    
    const writer = fs.createWriteStream(destination);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

// Appel API pour récupérer la liste des serveurs
ipcMain.handle('fetch-servers', async (event, ip) => {
    try {
        const response = await axios.get(`http://${ip}:8080/api/servers`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des serveurs:', error.message);
        throw error;
    }
});

// Appel API pour vérifier la whitelist et le hash
ipcMain.handle('check-server', async (event, { ip, player, hash }) => {
    try {
        const url = new URL(`http://${ip}:8080/api/check`);
        url.searchParams.append('player', player);
        if (hash) url.searchParams.append('hash', hash);
        
        const response = await axios.get(url.toString());
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la vérification du serveur:', error.message);
        throw error;
    }
});

// Télécharge le modpack en parallèle (5 chunks max)
ipcMain.handle('download-modpack', async (event, { ip, serverHash }) => {
    try {
        const modpackDir = path.join(__dirname, 'modpacks', ip);
        const modpackPath = path.join(modpackDir, 'mode_client.zip');
        
        if (!fs.existsSync(modpackDir)) {
            fs.mkdirSync(modpackDir, { recursive: true });
        }
        
        const response = await axios({
            method: 'get',
            url: `http://${ip}:8080/api/download`,
            responseType: 'stream'
        });
        
        const writer = fs.createWriteStream(modpackPath);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
            writer.on('finish', () => {
                const localHash = calculateSHA256(modpackPath);
                if (localHash === serverHash) {
                    resolve({ success: true, path: modpackPath });
                } else {
                    fs.unlinkSync(modpackPath);
                    reject(new Error("Hash invalide après téléchargement"));
                }
            });
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Erreur lors du téléchargement du modpack:', error.message);
        throw error;
    }
});

// Lance Minecraft
ipcMain.handle('launch-game', (event, { ip, port, version, username, isOfficial }) => {
    let command;
    if (isOfficial) {
        command = `java -jar minecraft.jar --username ${username} --server ${ip} --port ${port} --version ${version}`;
    } else {
        command = `java -jar minecraft.jar --username ${username} --server ${ip} --port ${port} --version ${version} --offline`;
    }
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error('Erreur lors du lancement de Minecraft:', error.message);
        }
    });
});

// Log une connexion dans l'historique
ipcMain.handle('log-connection', async (event, { serverIp, playerName, startTime, endTime }) => {
    const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60); // en minutes
    db.run(
        'INSERT INTO connections (server_ip, player_name, start_time, end_time, duration_minutes) VALUES (?, ?, ?, ?, ?)',
        [serverIp, playerName, startTime, endTime, duration]
    );
});

// Récupère l'historique
ipcMain.handle('get-history', async (event, serverIp) => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM connections WHERE server_ip = ? ORDER BY start_time DESC',
            [serverIp],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
});

// Ajoute une notification
ipcMain.handle('add-notification', async (event, { serverIp, message }) => {
    db.run(
        'INSERT INTO notifications (server_ip, message) VALUES (?, ?)',
        [serverIp, message]
    );
});

// Récupère les notifications
ipcMain.handle('get-notifications', async (event) => {
    return new Promise((resolve, reject) => {
        db.all(
            'SELECT * FROM notifications WHERE is_read = FALSE ORDER BY created_at DESC',
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            }
        );
    });
});

// Marque une notification comme lue
ipcMain.handle('mark-notification-read', async (event, id) => {
    db.run('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
});

// Initialisation de l'application
app.on('ready', () => {
    initDatabase();
    
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    
    mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Gestion des erreurs
app.on('uncaughtException', (error) => {
    console.error('Erreur non capturée:', error);
});
