import Utils from './utils';

class Wallet {
    constructor() {
        let keys = Utils.generateKeyPair();
        this._id = Utils.uuid();
        this.privateKey = keys.private;
        this.publicKey = keys.public;
    }
}

export default Wallet;