import sha from 'sha.js';

class Blockchain {
    constructor() {
        this.chain = [];
        this.current_transaction = [];

        this.get_chain = this.get_chain.bind(this);
        this.get_transactions = this.get_transactions.bind(this);
        this.new_block = this.new_block.bind(this);
        this.new_transaction = this.new_transaction.bind(this);
        this.proof_of_work = this.proof_of_work.bind(this);

        // Create the genesis block
        this.new_block(100,1);
    }

    get_chain() {
        return this.chain;
    }

    get_transactions() {
        return this.current_transaction;
    }

    new_block(proof, previous_hash) {
        let new_block = {
            index: this.chain.length + 1,
            timestamp: new Date().toISOString(),
            transactions: this.current_transaction,
            proof: proof,
            previous_hash: previous_hash ? previous_hash : Blockchain.hash(JSON.stringify(this.chain[this.chain.length - 1])),
        };

        this.current_transaction = [];
        this.chain.push(new_block);
        return new_block;
    }

    new_transaction(sender, recipient, amount) {
        this.current_transaction.push({
            sender: sender,
            recipient: recipient,
            amount: amount
        });
    }

    static hash(block_string) {
        return new sha.sha256().update(block_string).digest('hex');
    }

    static valid_proof(last_proof, proof) {
        let guess = last_proof.toString() + proof.toString();
        let guess_hash = new sha.sha256().update(guess).digest('hex');
        return guess_hash.substring(0, 4) === "0000";
    }

    proof_of_work(last_proof) {
        let proof = 0;
        while(!Blockchain.valid_proof(last_proof, proof)) {
            proof++;
        }
        return proof;
    }
}

export default Blockchain;