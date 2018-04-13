require('babel-register')({
    presets: [ 'env' ]
});

let express = require('express');
let BlockChain = require('./blockchain');

let app = express();

let blockchain = new BlockChain.default();
let identifier = undefined;

let uuid = () => {
    // Private array of chars to use
    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid = new Array(36), rnd = 0, r;
    for (let i = 0; i < 36; i++) {
        if (i == 8 || i == 13 || i == 18 || i == 23) {
            uuid[i] = '-';
        }
        else if (i == 14) {
            uuid[i] = '4';
        }
        else {
            if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return uuid.join('');
}

app.get('/chain', (req, res) => {
    res.contentType('application/json');
    res.send(blockchain.get_chain());
});

app.get('/mine',(req,res) => {
    //We run the proof of work algorithm to get the next proof...
    let chain = blockchain.get_chain();
    let last_block = chain[chain.length - 1];
    let last_proof = last_block.proof;
    
    let proof = blockchain.proof_of_work(last_block);
    // We must receive a reward for finding the proof.
    // The sender is "0" to signify that this node has mined a new coin.
    blockchain.new_transaction("0",identifier,1);

    //Forge the new Block by adding it to the chain
    let previous_hash = BlockChain.default.hash(JSON.stringify(last_block));
    let new_block = blockchain.new_block(proof,previous_hash);

    res.send({
        message: "New block created",
        index: new_block.index,
        transactions: new_block.transactions,
        proof: new_block.proof,
        previous_hash: new_block.previous_hash
    });
});

app.get('/transactions', (req, res) => {
    res.contentType('application/json');
    res.send(blockchain.get_transactions());
});

app.listen(5000, () => {
    identifier = uuid();
    console.log('App listening on port 5000'); 
});