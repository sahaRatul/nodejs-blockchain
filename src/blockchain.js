import Block from './block';
import Utils from './utils';

class Blockchain {
    constructor() {
        this.blockchain = [new Block({ _id: Utils.uuid(), message: "Genesis block" }, "0")];
        this.difficulty = 4;

        this.addBlock = this.addBlock.bind(this);
        this.getChain = this.getChain.bind(this);
        this.isChainValid = this.isChainValid.bind(this);
    }

    addBlock(block) {
        if (block) {
            this.blockchain.push(block);
        }
        return this.blockchain;
    }

    getChain() {
        return this.blockchain;
    }

    isChainValid(difficulty = this.difficulty) {
        let currentBlock = undefined;
        let previousBlock = undefined;
        let target = new Array(difficulty + 1).join("0");

        for (let i = 1; i < this.blockchain.length - 1; i++) {
            currentBlock = this.blockchain[i];
            previousBlock = this.blockchain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                console.log("Hash mismatch");
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.calculateHash()) {
                console.log("Hash mismatch");
                return false;
            }
            if (currentBlock.hash.substr(0, difficulty) !== target) {
                console.log("This block hasn't been mined");
                return false;
            }
        }

        return true;
    }
}

export default Blockchain;