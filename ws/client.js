const { WebSocket } = require('ws');
const fs = require('fs');
const readline = require('readline');

const CLIENT_ID_FILE = 'client_id.txt';

function loadClientId() {
    try {
        return fs.readFileSync(CLIENT_ID_FILE, 'utf8');
    } catch (err) {
        console.log('No existing client ID found, starting a new session.');
        return null;
    }
}

function saveClientId(clientId) {
    try {
        fs.writeFileSync(CLIENT_ID_FILE, clientId);
        console.log(`Client ID saved to file: ${clientId}`);
    } catch (error) {
        console.error('Error writing client ID to file:', error);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const wsClientFactory = () => {
    const savedClientId = loadClientId();
    const ws = new WebSocket('ws://localhost:8080');
    let clientId = savedClientId; 
    let userName = '';

    ws.on('open', () => {
        console.log('Connected to server');
        
        if (clientId) {
            console.log(`Restoring session with clientId: ${clientId}`);
            ws.send(JSON.stringify({ type: 'restore', clientId }));
        }

        rl.question('Enter your name: ', (name) => {
            userName = name;
            console.log(`Hello, ${userName}! You can now start sending messages.`);
        });
    });

    ws.on('message', (data) => {
        const messageData = JSON.parse(data);

        if (messageData.type === 'session') {
            clientId = messageData.clientId;
            saveClientId(clientId);
            console.log(`Your session ID is: ${clientId}`);
        } else if (messageData.type === 'message') {
            console.log(`${messageData.from}: ${messageData.text}`);
        }
    });

    rl.on('line', (input) => {
        if (clientId && userName) {
            ws.send(JSON.stringify({
                clientId,
                userName,
                text: input
            }));
        }
    });

    ws.on('error', console.error);
};

wsClientFactory();

