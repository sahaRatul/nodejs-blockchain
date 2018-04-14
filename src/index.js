let express = require('express');
let morgan = require('morgan');

let Block = require('./block');
let BlockChain = require('./blockchain');
let Utils = require('./utils');

let app = express();
app.use(morgan('dev'));

let blockchain = new BlockChain.default();

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

app.listen(5000, () => {
    console.log('\nBlockchain listening on port 5000');
});