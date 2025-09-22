// Demonstrates insecure hashing and encryption usage
const CryptoJS = require('crypto-js');

module.exports = {
  weakHash: function (input) {
    // VULN: MD5-like/legacy usage via crypto-js SHA1 or similar
    return CryptoJS.SHA1(input).toString();
  },
  insecureEncrypt: function (text) {
    // VULN: symmetric encryption with weak key stored in code (for demo only)
    const key = 'hardcoded_key_123';
    return CryptoJS.AES.encrypt(text, key).toString();
  }
};
