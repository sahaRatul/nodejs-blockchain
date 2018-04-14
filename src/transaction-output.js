import Utils from './utils';

class TransactionOutput {
    constructor(recipient = "", assets = [], parentTransactionID = "") {
        this.recipient = recipient; //Owner of assets
        this.assets = assets;
        this.parentTransactionID = parentTransactionID;
        this.id = Utils.applySha256(recipient + JSON.stringify(assets) + parentTransactionID);

        this.isMine = this.isMine.bind(this);
    }

    isMine(publicKey) {
        return publicKey === this.recipient;
    }
}