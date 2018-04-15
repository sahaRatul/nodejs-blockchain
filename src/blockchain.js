//import Block from './block';
import Utils from './utils';

class Blockchain {
    constructor() {
        Blockchain.blockchain = [];
        Blockchain.UTXOs = new Map();
        this.difficulty = 4;

        this.addBlock = this.addBlock.bind(this);
        this.getChain = this.getChain.bind(this);
        this.isChainValid = this.isChainValid.bind(this);
    }

    static get blockchain() {
        if (!this._blockchain) {
            this._blockchain = [];
        }
        return this._blockchain;
    };

    static set blockchain(val) { this._blockchain = val; };

    static get UTXOs() {
        if (!this._UTXOs) {
            this._UTXOs = new Map();
        }
        return this._UTXOs;
    }
    static set UTXOs(value) { this._UTXOs = value; };

    static get minTransactionQuantity() {
        if (!this.minQuantity) {
            this.minQuantity = 1;
        }
        return this.minQuantity;
    }

    addBlock(block) {
        if (block) {
            Blockchain.blockchain.push(block);
        }
        return Blockchain.blockchain;
    }

    getChain() {
        return Blockchain.blockchain;
    }

    isChainValid(difficulty = this.difficulty) {
        let currentBlock = undefined;
        let previousBlock = undefined;
        let target = new Array(difficulty + 1).join("0");

        for (let i = 1; i < Blockchain.blockchain.length - 1; i++) {
            currentBlock = Blockchain.blockchain[i];
            previousBlock = Blockchain.blockchain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateBlockHash()) {
                console.log("Hash mismatch");
                return false;
            }
            if (currentBlock.previousHash !== previousBlock.calculateBlockHash()) {
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