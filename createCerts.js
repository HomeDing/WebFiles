
const crypto = await import('crypto');
const fs = await import('fs');

// const {
//   generateKeyPair
// } = import('node:crypto');

// console.log(crypto);
// crypto.then(c => { console.log(c); });

const keyPair = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes-256-cbc',
    passphrase: 'top secret'
  }

});

// ++ https://blog.logrocket.com/node-js-crypto-module-a-tutorial/
// ++ https://coolaj86.com/articles/new-in-node-native-rsa-ec-and-dsa-support/
// https://github.com/zachgoll/express-jwt-authentication-starter/blob/master/generateKeypair.js


console.info('public:', keyPair.publicKey);
console.info('private:', keyPair.privateKey);

// Create the public key file
fs.writeFileSync(__dirname + '/certs/id_rsa_pub.pem', keyPair.publicKey, { encoding: "utf-8" });

// Create the private key file
fs.writeFileSync(__dirname + '/certs/id_rsa_priv.pem', keyPair.privateKey, { encoding: "utf-8" });
