import CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';

class Utils {
    static applySha256(input = "") {
        return CryptoJS.SHA256(input).toString();
    }

    static uuid() {
        // Private array of chars to use
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        let uuid = new Array(36), rnd = 0, r;
        for (let i = 0; i < 36; i++) {
            if (i == 8 || i == 13 || i == 18 || i == 23) {
                uuid[i] = '-';
            }
            else if (i == 14) {
                uuid[i] = '4';
            }
            else {
                if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid.join('');
    }

    // Convert a hex string to a byte array
    static hexToBytes(hex) {
        let bytes = [];
        for (let c = 0; c < hex.length; c += 2)
            bytes.push(parseInt(hex.substr(c, 2), 16));
        return bytes;
    }

    // Convert a byte array to a hex string
    static bytesToHex(bytes) {
        let hex = [];
        for (let i = 0; i < bytes.length; i++) {
            hex.push((bytes[i] >>> 4).toString(16));
            hex.push((bytes[i] & 0xF).toString(16));
        }
        return hex.join("");
    }

    static generateKeyPair() {
        let ec = new EC('secp256k1');
        let key = ec.genKeyPair();

        let keys = {
            public: key.getPublic().encode('hex'),
            private: key.getPrivate('hex')
        };

        return keys;
    }

    static applyECDSASignature(privateKey = "", input = "") {
        if (privateKey) {
            let ec = new EC('secp256k1');
            let key = ec.keyFromPrivate(privateKey);
            //Convert input to byte array
            let inputBytes = input.split('').map((x) => { return x.charCodeAt(0); });

            //Sign the input
            let signature = key.sign(inputBytes);

            //Export DER encoded signature in Array
            let derSign = signature.toDER();
            return Utils.bytesToHex(derSign);
        }
        return null;
    }

    static verifyECDSASignature(publicKey = "", input = "", signature = "") {
        if (signature && publicKey) {
            let ec = new EC('secp256k1');
            let key = ec.keyFromPublic(publicKey, 'hex');
            //Convert input to byte array
            let inputBytes = input.split('').map((x) => { return x.charCodeAt(0); });

            return key.verify(inputBytes, signature);
        }
        return false;
    }

    static getMerkleRoot(transactions = []) {
        let count = transactions.length;
        let previousTreeLayer = transactions.map((x) => { return x; });
        let treeLayer = [Utils.applySha256(JSON.stringify(previousTreeLayer[0]))];
        while (count > 1) {
            treeLayer = new Array(0);
            for (let i = 1; i < previousTreeLayer.length; i++) {
                treeLayer.push(Utils.applySha256(JSON.stringify(previousTreeLayer[i - 1]) + JSON.stringify(previousTreeLayer[i])));
            }
            count = treeLayer.length;
            previousTreeLayer = treeLayer;
        }

        let merkleTreeRoot = treeLayer.length === 1 ? treeLayer[0] : "";
        return merkleTreeRoot;
    }
}

export default Utils;