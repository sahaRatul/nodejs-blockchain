import Utils from './utils';

class Block {
    constructor(data = {}, previousHash = "") {
        this.data = data;
        this.previousHash = previousHash;
        this.timeStamp = Date.now();
        this.nonce = 0;
        this.transactions = [];
        this.merkleRoot = "";
        this.hash = this.calculateBlockHash(this.previousHash, this.timeStamp, this.nonce, this.merkleRoot);

        this.calculateBlockHash = this.calculateBlockHash.bind(this);
        this.mineBlock = this.mineBlock.bind(this);
    }

    calculateBlockHash(previousHash = this.previousHash, timeStamp = this.timeStamp, nonce = this.nonce, merkleRoot = this.merkleRoot) {
        return Utils.applySha256(
            previousHash + timeStamp.toString() + nonce.toString() + merkleRoot
        );
    }

    mineBlock(difficulty = 4) {
        let target = new Array(difficulty + 1).join("0");
        this.merkleRoot = Utils.getMerkleRoot(this.transactions);
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateBlockHash();
        }
        return this.hash;
    }

    addTransaction(transaction) {
        if (!transaction) {
            return { error: true, message: "TRANSACTION_DATA_MISSING" };
        }
        else {
            let status = transaction.processTransaction();
            if (status.error) {
                return { error: true, message: status.message };
            }
            else {
                this.transactions.push(transaction);
                return { error: false, message: "TRANSACTION_ADDED" };
            }
        }
    }
}

export default Block;