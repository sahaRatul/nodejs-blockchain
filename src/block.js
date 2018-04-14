import Utils from './utils';

class Block {
    constructor(data = {}, previousHash = "") {
        this.data = data;
        this.previousHash = previousHash;
        this.timeStamp = Date.now();
        this.nonce = 0;
        this.hash = this.calculateBlockHash(this.previousHash, this.timeStamp, this.nonce, this.data);

        this.calculateBlockHash = this.calculateBlockHash.bind(this);
        this.mineBlock = this.mineBlock.bind(this);
    }

    calculateBlockHash(previousHash = this.previousHash, timeStamp = this.timeStamp, nonce = this.nonce, data = this.data) {
        return Utils.applySha256(
            previousHash + timeStamp.toString() + nonce.toString() + JSON.stringify(data)
        );
    }

    mineBlock(difficulty = 4) {
        let target = new Array(difficulty + 1).join("0");
        while (this.hash.substring(0, difficulty) !== target) {
            this.nonce++;
            this.hash = this.calculateBlockHash();
        }
        return this.hash;
    }
}

export default Block;