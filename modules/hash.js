const crypto = require('crypto');
const fs = require('fs');

exports.hex = (str, type = "md5") => {
    let hash = crypto.createHash('md5');
    hash.update(str);
    let ret = hash.digest("hex");
    return ret;
}