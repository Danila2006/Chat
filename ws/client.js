const { WebSocket } = require('ws');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const wsClientFactory = () => {
    const ws = new WebSocket('ws://localhost:8080');
    let clientId = null;
    let userName = '';

    ws.on('open', () => {
        console.log('Connected to server');
        rl.question('Enter your name: ', (name) => {
            userName = name;
            console.log(`Hello, ${userName}! You can now start sending messages.`);
        });
    });

    ws.on('message', (data) => {
        const messageData = JSON.parse(data);

        if (messageData.type === 'session') {
            clientId = messageData.clientId;
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
