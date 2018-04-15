require('babel-register')({
    presets: ['env']
});

let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');

let Assets = require('./assetlist');
let Block = require('./block');
let BlockChain = require('./blockchain');
let Transaction = require('./transaction');
let TransactionOutput = require('./transaction-output');
let Utils = require('./utils');
let Wallet = require('./wallet');

let app = express();
app.use(bodyParser.json());
app.use(morgan('dev'));

let blockchain = new BlockChain.default();
let coinbase = new Wallet.default();

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
}, "0");
genesisBlock.addTransaction(genesisTransaction); //Add genesis transaction to genesis block
blockchain.addBlock(genesisBlock);

app.get('/api/blockchain', (req, res) => {
    res.contentType('application/json');
    res.send(blockchain.getChain());
});

app.get('/api/isValid', (req, res) => {
    res.contentType('application/json');
    res.send({
        isValid: blockchain.isChainValid()
    });
});

app.get('/api/mine', (req, res) => {
    let chain = blockchain.getChain();
    let last_block = chain[chain.length - 1];

    let nonce = last_block.mineBlock();

    //Automatically add a new block to blockchain
    let secondBlock = new Block.default({
        _id: Utils.default.uuid(),
        message: "Block " + (chain.length + 1).toString()
    }, last_block.hash);
    blockchain.addBlock(secondBlock);

    res.contentType('application/json');
    res.send({
        message: "Block mined successfully",
        nonce: last_block.nonce,
        hash: last_block.hash
    });
});

app.get('/api/wallet', (req, res) => {
    let wallet = new Wallet.default();
    res.contentType('application/json');
    res.send(wallet);
});

app.get('/api/wallet/balance', (req, res) => {
    if (req.query.key) {
        res.contentType('application/json');
        res.send({
            balance: Wallet.default.getBalance(req.query.key)
        });
    }
    else {
        res.status(400).send({
            message: "key parameter missing in query"
        });
    }
});

app.post('/api/transaction', (req, res) => {
    if (req.body && req.body.sender && req.body.recipient && req.body.asset && req.body.private_key) {
        let transaction = new Transaction.default(req.body.sender, req.body.recipient, req.body.asset);

        //Create signature
        let signature = transaction.generateSignature(req.body.sender, req.body.recipient, req.body.asset, req.body.private_key);

        //Verify transaction with generated signature
        let verified = transaction.verifySignature(req.body.sender, req.body.recipient, req.body.asset, signature);
        res.contentType('application/json');
        res.send({
            message: "Transaction created",
            verified: verified
        });
    }
    else {
        res.contentType('application/json');
        res.status(400).send({
            message: "One or more fields missing in body"
        });
    }
});

app.listen(5000, () => {
    console.log('\nBlockchain Application listening on port 5000');
});