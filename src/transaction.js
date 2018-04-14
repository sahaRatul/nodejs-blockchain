import Utils from './utils';
import Blockchain from './blockchain';
import TransactionOutput from './transaction-output';

class Transaction {
    constructor(sender = "", recipient = "", asset = {}, inputs = [], outputs = []) {
        this.sender = sender;
        this.recipient = recipient;
        this.asset = asset;
        this.inputs = inputs;
        this.outputs = outputs;
        this.signature = null;

        this.calulateTransactionHash = this.calulateTransactionHash.bind(this);
        this.generateSignature = this.generateSignature.bind(this);
        this.getInputAssets = this.getInputAssets.bind(this);
        this.getOutputAssets = this.getOutputAssets.bind(this);
        this.processTransaction = this.processTransaction.bind(this);
        this.verifySignature = this.verifySignature.bind(this);
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

    processTransaction() {
        if (!this.verifySignature()) {
            return { error: true, message: "SIGNATURE_VERIFICATION_FAILED" };
        }

        //Gather transaction inputs (Make sure they are unspent):
        this.inputs.map((x) => {
            x.UTXO = Blockchain.UTXOs.get(x.transactionOutputId);
        });

        //Input assets
        let inputAssets = this.getInputAssets();
        if (inputAssets.length < Blockchain.minTransactionQuantity) {
            return { error: true, message: "LESS_THAN_MIN_QUANTITY" };
        }

        //Get asset to be sent to recipient
        let asset = inputAssets.filter((x) => { x.id === this.asset._id; })[0];

        if (asset) {
            //generate transaction outputs:
            let transactionId = this.calulateTransactionHash();
            this.outputs.push(new TransactionOutput(this.recipient, [asset], transactionId)); //Send asset to recipient
            let remainingAssets = inputAssets.filter((x) => { x.id !== this.asset._id; }); //Get remaining assets
            this.outputs.push(new TransactionOutput(this.sender, remainingAssets, transactionId));//Send remaining assets to sender

            //Add unspent assets
            this.outputs.map((x) => {
                Blockchain.UTXOs.set(x.id, x);
            });

            //Remove spent assets
            this.inputs.map((x) => {
                Blockchain.UTXOs.delete(x.id);
            });

            return { error: false, message: "ASSET_TRANSFERRED" }
        }
        else {
            return { error: true, message: "ASSET_NOT_FOUND" };
        }
    }

    getInputAssets() {
        let assets = this.inputs.reduce((acc, val) => {
            return acc.concat(val.UTXO ? val.UTXO.assets : []);
        });
        return assets;
    }

    getOutputAssets() {
        let assets = this.outputs.reduce((acc, val) => {
            return acc.concat(val.assets);
        }, []);
        return assets;
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