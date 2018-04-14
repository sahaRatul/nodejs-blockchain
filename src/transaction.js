import Utils from './utils';

class Transaction {
    constructor(sender = "", recipient = "", asset = {}, inputs = []) {
        this.sender = sender;
        this.recipient = recipient;
        this.asset = asset;
        this.inputs = inputs;
        this.signature = null;

        this.calulateTransactionHash = this.calulateTransactionHash.bind(this);
    }

    calulateTransactionHash(sender = this.sender, recipient = this.recipient, asset = this.asset) {
        //Generate random number to avoid 2 identical transactions having the same hash
        let random = Math.random().toString();
        return Utils.applySha256(
            sender + recipient + JSON.stringify(asset) + random
        );
    }

    generateSignature(sender = this.sender, recipient = this.recipient, asset = this.asset, privateKey = "") {
        if (privateKey) {
            let data = sender + recipient + JSON.stringify(asset);
            this.signature = Utils.applyECDSASignature(privateKey, data);
        }
        return this.signature;
    }

    verifySignature(sender = this.sender, recipient = this.recipient, asset = this.asset, signature = this.signature) {
        if (sender && signature) {
            let data = sender + recipient + JSON.stringify(asset);
            return Utils.verifyECDSASignature(sender, data, signature)
        }
        return false;
    }
}

export default Transaction;