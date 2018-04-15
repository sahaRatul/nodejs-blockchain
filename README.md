# NodeJS Blockchain App

## API Reference

### `GET /`

##### Returns this page.

### `GET /api/blockchain`

##### Returns the blockchain.

### `GET /api/mine`

##### Verifies the blockchain in server upto 2nd latest block in chain. The last block is unverified.

### `GET /api/isValid`

##### Verifies the blockchain integrity.

### `GET /api/wallet`

##### Returns a new wallet with wallet with public and private keys. The public key is the wallet address used for sending/receiving and the private key is used to sign transactions send by the wallet. The private key should be saved since it's not possible to retrieve it once lost.

### `GET /api/wallets`

##### Returns a list of wallets currently in app memory. The private key is not sent for security.

### `GET /api/wallet/balance?key=<wallet_public_key>`

##### Retrieves the balance in amount. The wallet public key i.e. address must be sent in query string

### `POST /api/transaction`

##### Send asset from one wallet to another. The data must be send in request body and should have below format.

##### `{ sender: <sender_public_key>, recipient: <recepient_public_key>, asset: <data>, private_key: <sender_private_key> }`