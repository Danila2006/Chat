const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

const clients = new Map();

wss.on('connection', function connection(ws) {
    const clientId = `client-${Date.now()}`;
    clients.set(clientId, ws);

    console.log(`Client ${clientId} connected`);

    ws.send(JSON.stringify({ type: 'session', clientId }));

    ws.on('message', function message(data) {
        const messageData = JSON.parse(data);
        console.log(`Received message from ${messageData.clientId}: ${messageData.text}`);

        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === ws.OPEN) {
                client.send(JSON.stringify({
                    type: 'message',
                    from: messageData.clientId,
                    text: messageData.text
                }));
            }
        });
    });

    ws.on('close', () => {
        clients.delete(clientId);
        console.log(`Client ${clientId} disconnected`);
    });

    ws.on('error', console.error);
});
