const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

const clients = new Map();

wss.on('connection', function connection(ws) {
    let clientId;

    ws.on('message', function message(data) {
        const messageData = JSON.parse(data);

        if (messageData.type === 'restore' && messageData.clientId && clients.has(messageData.clientId)) {
            clientId = messageData.clientId;
            console.log(`Session restored for client: ${clientId}`);
        } else if (messageData.type !== 'restore') {
            console.log(`Received message from ${clientId || 'unknown'}:`, messageData.text);
            wss.clients.forEach(function each(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ from: clientId, text: messageData.text }));
                }
            });
        }
    });

    ws.on('close', () => {
        if (clientId) {
            clients.delete(clientId);
            console.log(`Client disconnected: ${clientId}`);
        }
    });

    ws.on('error', console.error);

    if (!clientId) {
        clientId = `client-${Date.now()}`;
        clients.set(clientId, ws);
        ws.send(JSON.stringify({ type: 'session', clientId }));
        console.log(`New client connected: ${clientId}`);
    }
});
