class TransactionInput {
    constructor(transactionOutputId = "") {
        this.transactionOutputId = transactionOutputId;
        this.UTXO = null;
    }
}

export default TransactionInput;