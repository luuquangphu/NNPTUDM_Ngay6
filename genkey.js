const { generateKeyPairSync } = require('crypto');
const fs = require('fs');

// Tạo cặp khóa RSA
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048, // Độ dài khóa
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});

// Ghi khóa vào file
fs.writeFileSync('private.key', privateKey);
fs.writeFileSync('public.key', publicKey);

console.log('Keys generated and saved to private.key and public.key');