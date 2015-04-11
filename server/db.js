//DB interface, will eventually be abstract with subclasses
//but for now, implements only pouchDB
var DB = (function () {
    function DB(path) {
        var Pouch = require('pouchdb');
        //Pouch.debug.enable('*');
        Pouch.plugin(require('geopouch'));
        this.db = Pouch(path, {});
        this.fs = require('level-filesystem')(this.db);
    }
    return DB;
})();
exports.DB = DB;
