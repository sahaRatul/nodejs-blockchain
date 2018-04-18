import WebSocket from 'ws';

import Blockchain from './blockchain';

class Nodes {
    constructor(port = 3000) {
        this.server = new WebSocket.Server({ port: port });
        console.log('starting on port ' + port);
        this.sockets = [];

        this.addPeer = this.addPeer.bind(this);
        this.broadcastMessage = this.broadcastMessage.bind(this);
        this.closeConnection = this.closeConnection.bind(this);
        this.initConnection = this.initConnection.bind(this);
        this.messageHandler = this.messageHandler.bind(this);
        this.processedReceivedBlock = this.processedReceivedBlock.bind(this);
        this.requestLatestBlock = this.requestLatestBlock.bind(this);

        this.server.on('connection', (connection) => { this.initConnection(connection, false); });
    }

    initConnection(connection) {
        this.sockets.push(connection);

        this.requestLatestBlock(connection);
        this.messageHandler(connection);

        connection.on('error', () => { this.closeConnection(connection); });
        connection.on('close', () => { this.closeConnection(connection); });
    }

    broadcastMessage(event, message) {
        this.sockets.map((connection) => { connection.send(JSON.stringify({ event, message })); });
    }

    closeConnection(connection) {
        this.sockets.splice(this.sockets.indexOf(connection), 1);
    }

    requestLatestBlock(connection) {
        if (connection) {
            let latest = Blockchain.blockchain[Blockchain.blockchain.length - 1];
            connection.send(JSON.stringify({ event: "BLOCK", message: latest }));
        }
    }

    messageHandler(connection) {
        connection.on('message', (data) => {
            const msg = JSON.parse(data);
            console.log(msg);
            switch (msg.event) {
            case "BLOCK":
                console.log('Block received');
                console.log(msg.message);
                break;
            default:
                console.log('Unknown message');
            }
        });
    }

    processedReceivedBlock(block) {
        let currentTopBlock = Blockchain.blockchain[Blockchain.blockchain.length - 1];
        let blockchain = new Blockchain();

        // Is the same or older?
        if (block.index <= currentTopBlock.index) {
            console.log('No update needed');
            return;
        }

        //Is claiming to be the next in the chain
        if (block.previousHash === currentTopBlock.hash) {
            //Attempt the top block to our chain
            blockchain.addBlock(block);
            console.log(Blockchain.blockchain[Blockchain.blockchain.length - 1]);
        }
        else {
            // It is ahead.. we are therefore a few behind, request the whole chain
            console.log('requesting chain');
            this.broadcastMessage("REQUEST_CHAIN", "");
        }
    }

    addPeer(host, port) {
        let connection = new WebSocket(`ws://${host}:${port}`);

        connection.on('error', (error) => {
            console.log(error);
            return { error: true, message: error };
        });

        connection.on('open', () => {
            this.initConnection(connection, true);
        });

        return { error: false, message: "PEER_ADDED" };
    }
}

export default Nodes;