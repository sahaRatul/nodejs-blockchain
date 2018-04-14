import Blockchain from './blockchain';
import Transaction from './transaction';
import Utils from './utils';

class Wallet {
    constructor() {
        let keys = Utils.generateKeyPair();
        this._id = Utils.uuid();
        this.privateKey = keys.private;
        this.publicKey = keys.public;
        this.UTXOs = new Map();
    }

    static getBalance(publicKey = this.publicKey) {
        let count = 0;
        for (let [key, value] of Blockchain.UTXOs) {
            if (value.isMine(publicKey)) {
                this.UTXOs.set(key, value);
                count++;
            }
        }
        return count;
    }

    sendAsset(recipient = "", asset = { _id: "" }) {
        if (Wallet.getBalance(this.publicKey) < 1) {
            return null;
        }

        let inputs = [];
        for (let [key, value] of this.UTXOs) {
            inputs.push(value);
            let len = value.assets.filter((x) => { x._id === asset._id });
            if (len > 0) break;
        }

        let newTransaction = new Transaction(this.publicKey, recipient, asset, inputs)
    }
}

export default Wallet;