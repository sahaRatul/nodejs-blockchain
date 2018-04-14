let express = require('express');
let bodyParser = require('body-parser');
let morgan = require('morgan');

let Block = require('./block');
let BlockChain = require('./blockchain');
let Transaction = require('./transaction');
let Utils = require('./utils');
let Wallet = require('./wallet');

let app = express();
app.use(bodyParser.json());
app.use(morgan('dev'));

let blockchain = new BlockChain.default();

/*
let keys = Utils.default.generateKeyPair();
let signature = Utils.default.applyECDSASignature(keys.private, "Ratul Saha");
console.log(Utils.default.verifyECDSASignature(keys.public, "Ratul Saha", signature));
*/

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