const { ChatClient } = require('./client/ChatClient');
const readLine = require('node:readline');

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});





const sessionIdIndex = process.argv.indexOf('--sessionId');
const nameIndex = process.argv.indexOf('--name');

if (sessionIdIndex == -1 && nameIndex == -1) {
    console.error('Arguments sessionId or name are required');
    process.exit(1);
}

const sessionId = sessionIdIndex != -1 ? process.argv[sessionIdIndex + 1] : undefined;
const name = nameIndex != -1 ? process.argv[nameIndex + 1] : undefined;



init(name, sessionId);

function init(name, sessionId) {
    const client = new ChatClient({ url: 'ws://localhost:8080', username: name, sessionId});

    client.init();

    const chatInput = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    chatInput.on('line', (input) => {
        if (input.trim().toLowerCase() == 'exit') {
            chatInput.close();
        } else {
            client.send(input);
        }
    });
}

