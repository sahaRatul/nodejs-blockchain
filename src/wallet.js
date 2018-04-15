import Blockchain from './blockchain';
import Transaction from './transaction';
import TransactionInput from './transaction-input';
import Utils from './utils';

class Wallet {
    constructor() {
        let keys = Utils.generateKeyPair();
        this._id = Utils.uuid();
        this.privateKey = keys.private;
        this.publicKey = keys.public;
        this.UTXOs = new Map();

        this.getBalance = this.getBalance.bind(this);
        this.sendAsset = this.sendAsset.bind(this);
    }

    getBalance(publicKey = this.publicKey) {
        let count = 0;
        for (let [key, value] of Blockchain.UTXOs) {
            if (value.isMine(publicKey)) {
                this.UTXOs.set(key, value);
                count++;
            }
        }
        return count;
    }

    static getBalanceStatic(publicKey) {
        let count = 0;
        for (let [key, value] of Blockchain.UTXOs) {
            key;
            if (value.isMine(publicKey)) {
                count++;
            }
        }
        return count;
    }

    sendAsset(recipient = "", asset = { _id: "" }) {
        if (this.getBalance(this.publicKey) < 1) {
            return { error: true, message: "NO_ASSETS_AVAILABLE" };
        }

        let inputs = [];
        let len = 0;
        let filtered = [];
        for (let [key, value] of this.UTXOs) {
            let transactionInput = new TransactionInput(value.id);
            inputs.push(transactionInput);
            key;
            filtered = value.assets.filter((x) => { return x._id === asset._id });
            len = filtered.length;
            if (len > 0) break;
        }
        if (len === 0) {
            return { error: true, message: "ASSET_NOT_AVAILABLE" };
        }

        let newTransaction = new Transaction(this.publicKey, recipient, filtered[0], inputs);
        newTransaction.generateSignature(this.privateKey);//Sign the transaction

        return { error: false, message: "ASSET_SENT", transaction: newTransaction };
    }
}

export default Wallet;