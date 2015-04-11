declare function require(name:string);

//DB interface, will eventually be abstract with subclasses
//but for now, implements only pouchDB

export class DB {

    db : Object;
    fs : Object;

    constructor(path) {


        var Pouch = require('pouchdb');

        //Pouch.debug.enable('*');

        Pouch.plugin(require('geopouch'));

        this.db = Pouch(path, {

        });
        this.fs = require('level-filesystem')(this.db);

    }
}
