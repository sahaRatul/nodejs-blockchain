class WalletList {
    static get wallets() {
        if (!this._wallets) {
            this._wallets = [];
        }
        return this._wallets;
    }

    static set wallets(wallets) {
        this._wallets = wallets;
    }
}

export default WalletList;