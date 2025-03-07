const crypto = require('crypto');

exports.hex = (str, type = "md5") => {
    let hash = crypto.createHash('md5');
    hash.update(str);
    let ret = hash.digest("hex");
    return ret;
}