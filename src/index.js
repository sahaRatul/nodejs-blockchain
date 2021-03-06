require('babel-register')({
    presets: ['env']
});

let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');

let Assets = require('./assetlist');
let Block = require('./block');
let BlockChain = require('./blockchain');
let Nodes = require('./nodes');
let Transaction = require('./transaction');
let TransactionOutput = require('./transaction-output');
let Utils = require('./utils');
let Wallet = require('./wallet');
let WalletList = require('./wallet-list');

let app = express();
app.use(bodyParser.json());
app.use(morgan('dev'));

let http_port = 3000 + Math.floor(Math.random() * 10);
let node_port = 18070 + Math.floor(Math.random() * 30);
// eslint-disable-next-line no-undef
let port = process.env.PORT || http_port;

let blockchain = new BlockChain.default();
let coinbase = new Wallet.default(); //Default wallet
let nodes = new Nodes.default(node_port);

WalletList.default.wallets = [coinbase];

//Create genesis Transaction
let genesisTransaction = new Transaction.default(coinbase.publicKey, coinbase.publicKey, Assets[0], null);
genesisTransaction.generateSignature(coinbase.privateKey);
genesisTransaction.transactionId = "0";
genesisTransaction.outputs.push(new TransactionOutput.default(genesisTransaction.recipient, [genesisTransaction.asset], genesisTransaction.transactionId));
BlockChain.default.UTXOs.set(genesisTransaction.outputs[0].id, genesisTransaction.outputs[0]);

//Create and add genesis block to blockchain
let genesisBlock = new Block.default({
    _id: Utils.default.uuid(),
    message: "Block 0"
}, "0", 0);
genesisBlock.addTransaction(genesisTransaction); //Add genesis transaction to genesis block
blockchain.addBlock(genesisBlock);

//GET /
app.get('/', (req, res) => {
    // eslint-disable-next-line no-undef
    res.sendFile('index.html', { root: __dirname });
});

//GET /api/blockchain
app.get('/api/blockchain', (req, res) => {
    res.contentType('application/json');
    res.send(blockchain.getChain());
});

//GET /api/isValid
app.get('/api/isValid', (req, res) => {
    res.contentType('application/json');
    res.send({
        isValid: blockchain.isChainValid()
    });
});

//GET /api/mine
app.get('/api/mine', (req, res) => {
    let chain = blockchain.getChain();
    let last_block = chain[chain.length - 1];

    last_block.mineBlock();

    //Automatically add a new block to blockchain
    let secondBlock = new Block.default({
        _id: Utils.default.uuid(),
        message: "Block " + (chain.length + 1).toString()
    }, last_block.hash, chain.length);
    blockchain.addBlock(secondBlock);
    nodes.broadcastMessage("BLOCK", secondBlock);

    res.contentType('application/json');
    res.send({
        message: "Block mined successfully",
        nonce: last_block.nonce,
        hash: last_block.hash
    });
});

//GET /api/wallet
app.get('/api/wallet', (req, res) => {
    let wallet = new Wallet.default();
    res.contentType('application/json');
    let walletList = WalletList.default.wallets;
    walletList.push(wallet);
    WalletList.default.wallets = walletList;
    res.send(wallet);
});

//GET /api/wallets
app.get('/api/wallets', (req, res) => {
    res.contentType('application/json');
    let walletList = WalletList.default.wallets.map((x) => { return { _id: x.id, publicKey: x.publicKey }; })
    res.send(walletList);
});

//GET /api/wallet/balance
app.get('/api/wallet/balance', (req, res) => {
    if (req.query.key) {
        res.contentType('application/json');
        res.send({
            balance: Wallet.default.getBalanceStatic(req.query.key)
        });
    }
    else {
        res.status(400).send({
            message: "key parameter missing in query"
        });
    }
});

//GET /api/transaction
app.post('/api/transaction', (req, res) => {
    if (req.body && req.body.sender && req.body.recipient && req.body.asset && req.body.private_key) {
        //Retrieve wallet object of sender
        let senderWallet = WalletList.default.wallets.filter((x) => { return x.publicKey === req.body.sender; });
        if (senderWallet.length > 0) {
            let response = senderWallet[0].sendAsset(req.body.recipient, req.body.asset);
            if (!response.error) {
                let innerResponse = BlockChain.default.blockchain[BlockChain.default.blockchain.length - 1].addTransaction(response.transaction);
                res.status(innerResponse.error ? 400 : 200).send(innerResponse);
            }
            else {
                res.status(400).send(response);
            }
        }
        else {
            res.status(400).send({
                message: "Sender not found in list"
            });
        }
    }
    else {
        res.contentType('application/json');
        res.status(400).send({
            message: "One or more fields missing in body"
        });
    }
});

//GET /api/addNode/:port
app.get('/api/addNode/:host/:port', (req, res) => {
    if (req.params.host && req.params.port) {
        let response = nodes.addPeer(req.params.host, req.params.port);
        if (response.error) {
            res.status(500).send(response);
        }
        else {
            res.send(response);
        }
    }
    else {
        res.status(400).send({
            message: "HOST and PORT must be send in request URL"
        });
    }
});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log('\nApp listening on port ' + port + '\n');
    // eslint-disable-next-line no-console
    console.log(coinbase.publicKey);
    // eslint-disable-next-line no-console
    console.log(coinbase.privateKey);
});