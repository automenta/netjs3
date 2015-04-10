"use strict";

var itemId, randomByte, randomBytes;

var rchars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz_";
randomBytes = function (n) {
    var r = '';
    for (var i = 0; i < n; i++) {
        r += rchars[ Math.floor(Math.random() * rchars.length) ];
    }
    return r;
}

randomByte = function () {
    return randomBytes(1);
    //return (((1 + Math.random()) * 0x100) | 0).toString(16).substring(1);
};

//
//randomBytes = function(n) {
//  return ((function() {
//    var i, ref, results;
//    results = [];
//    for (i = 1, ref = n; 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--) {
//      results.push(randomByte());
//    }
//    return results;
//  })()).join('');
//};

itemId = function () {
    return randomBytes(8);
};

module.exports = {
    randomByte: randomByte,
    randomBytes: randomBytes,
    itemId: itemId
};
