//https://github.com/pouchdb/pouchdb-server/blob/master/bin/pouchdb-server

module.exports = function (argv, init) {

    var express = require('express'),
        corser = require('corser'),
        path = require('path'),
        mkdirp = require('mkdirp'),
    //argv = require('optimist').argv,
        port = +(argv.p || argv.port || 5984),
        logger = argv.l || argv.log || 'dev',
        user = argv.u || argv.user,
        pass = argv.s || argv.pass,
        dbpath = argv.dbpath,
        useAuth = user && pass,
        app = express(),
        corserRequestListener = corser.create({
            methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
            supportsCredentials: true
        });

    // Help, display usage information
    if (argv.h || argv.help) {
        var path = require('path'),
            fs = require('fs'),
            fp = path.resolve(__dirname, 'usage.txt'),
            usage = fs.readFileSync(fp, 'utf8');

        process.stdout.write(usage);
        process.exit(1);
    }

    //app.use(require('morgan')(logger));
    app.use(function (req, res, next) {
        corserRequestListener(req, res, function () {
            if (req.method == 'OPTIONS') {
                // End CORS preflight request.
                res.writeHead(204);
                return res.end();
            }
            next();
        });
    });

    if (useAuth) {
        app.all('*', function (req, res, next) {
            var auth = req.headers.authorization;
            // Default read-only
            if (req.user || req.method === 'GET') return next();
            // Otherwise authenticate
            if (!auth) return res.send(401);

            var parts = auth.split(' ');
            if (parts.length !== 2) return res.send(400);
            var scheme = parts[0],
                credentials = new Buffer(parts[1], 'base64').toString(),
                index = credentials.indexOf(':');

            if (scheme !== 'Basic' || index < 0) return res.send(400);

            var reqUser = credentials.slice(0, index),
                reqPass = credentials.slice(index + 1);

            if (reqUser == user && reqPass == pass) return next();
            res.send(401);
        });
    }

    var expressPouchDB = require('express-pouchdb');
    var opts = {};

    if (dbpath) {
        opts.prefix = path.resolve(dbpath) + path.sep;
        mkdirp.sync(opts.prefix);
    }
    else {
        opts.db = require('memdown');
        opts.prefix = '';
    }


    var PouchDB = require('pouchdb').defaults(opts);

    PouchDB.plugin(require('pouchdb-find'));
    PouchDB.plugin(require('geopouch'));

    app.use(expressPouchDB(PouchDB));
    app.listen(port, function () {
        console.log('\npouchdb-server listening on port ' + port + '.');
        if (!dbpath) {
            console.log('database is in-memory; no changes will be saved.');
        } else {
            console.log('database files will be saved to ' + opts.prefix);
        }
        console.log('\nnavigate to http://localhost:' + port + '/_utils for the Fauxton UI.\n');
    }).on('error', function (e) {
        if (e.code === 'EADDRINUSE') {
            console.error('\nError: Port ' + port + ' is already in use.')
            console.error('Try another one, e.g. pouchdb-server -p ' +
            (parseInt(port) + 1) + '\n');
        } else {
            console.error('Uncaught error: ' + e);
            console.error(e.stack);
        }
    });


    process.on('SIGINT', function () {
        process.exit(0)
    });


    var network = argv.network;
    var tport = 10000;

    var T = new (require('telepathine').Telepathine)(
        tport, [/* seeds */], {
            network: network,
            address: "24.131.65.218",
            addressMap: {
                "192.168.0.102": "24.131.65.218",
                "127.0.0.1": "24.131.65.218"
            }
        }
    );

    T.on('start', function () {
        console.log('telepathine p2p started on port ' + T.port);
    });


    var db = new PouchDB(argv.db, opts);
    db.info().then(function (info) {
        db.changes({
            since: info.update_seq,
            live: true,
            include_docs: true
        }).on('change', function (c) {
            var x = c.doc;
            var i = x._id;
            var ip = i.indexOf('_');

            var peer;
            if (ip == -1) {
                peer = T.peer_name;
            }
            else {
                peer = i.substring(0, ip);
            }

            console.log('change from ', peer, ' key=', x.id);

            if (peer == T.peer_name) {
                //console.log('  change was created locally');

                //broadcast
                var key = x.id || x._id;
                T.set(key, x);

                //console.log('setting', key, x);
            }

        });

        T.on('set', function (peer, k, v) {
            //console.log('recv', peer, k, v);

            if (peer == T.peer_name) return;

            if (!(typeof v == "object")) {
                v = {value: v};
            }

            v._id = peer + '_' + k;
            v.id = k;
            delete v._tag;

            db.get(v._id, function (err, otherDoc) {
                if (otherDoc) {
                    v._rev = otherDoc._rev;
                }

                db.put(v, function callback(err, result) {
                    if (err) console.error(err);
                });
            });

        });

        T.start();

        if (init)
            init(db);

    }).catch(function (err) {
        console.log(err);
    });


    var idb;

    //http://pouchdb.com/2014/05/01/secondary-indexes-have-landed-in-pouchdb.html
    function newView(name, mapFunction) {
        var ddoc = {
            views: {}
        };
        ddoc.views[name] = {
            map: mapFunction.toString()
        };

        var id = '_design/' + name;
        idb.set(id, ddoc, function (err, c) {
            if (err)
                console.error('newView', err);
        }, function compare(existingView, newView) {
            if (_.isEqual(existingView.views, newView.views)) {
                return null;
            }
        });

        return ddoc;
    }


    var revisions = false;

    //db.viewCleanup();
    db.compact({});

    idb = {

        db: db,

        start: function () {

            db.createIndex({
                index: {
                    fields: ['tag'],
                    name: 'tag',
                    ddoc: 'tag',
                    type: 'string'
                }
            });

            //idb.tagView = newView('tag', function (doc) {
            //    if (doc.value) {
            //        var v = doc.value;
            //        for (var i = 0; i < v.length; i++) {
            //            if (v[i].id)
            //                emit(v[i].id);
            //        }
            //    }
            //});
            idb.modifiedAtView = newView('modifiedAt', function (doc) {
                if (doc.modifiedAt)
                    emit(doc.modifiedAt);
                else if (doc.createdAt)
                    emit(doc.createdAt);
            });
            idb.authorView = newView('author', function (doc) {
                if (doc.author)
                    emit(doc.author);
            });

            return this;
        },

        get: function (id, callback) {
            return db.get(id).then(function (x) {
                if (x)
                    callback(null, x);
            }).catch(callback);
        },


        setAll: function (values, done) {
            if (revisions) {
                console.error('with revisions=true, setAll() may not work');
            }

            db.bulkDocs(values, done);
        },

        set: function (id, value, done, compareFilter) {
            var opts = {};
            value._id = id;

            function insert() {
                //opts.doc = [value];
                //db.bulkDocs(opts, done);


                db.put(value, function (err, result) {
                    //console.log('put', err, result, value, opts);
                    done(err, result);
                });

                /*
                 .then(function (response) {

                 if (done)
                 done(null, value);
                 })
                 .catch(function (err) {
                 console.log('not inserted', err, value, opts);

                 if (done)
                 done(err, null);
                 });
                 */
            }

            /*if (!revisions) {
             //if not revisions, no need to check existing document
             opts.new_edits = false;
             insert();
             return;
             }
             else
             */

            {
                db.get(id).then(function (existing) {
                    if (existing) {
                        if (compareFilter) {
                            value = compareFilter(existing, value);
                            if (value == null) {
                                return done(null, existing);
                            }
                        }
                        value._rev = existing._rev;
                    }

                    insert();
                }).catch(function (err) {
                    db.put(value, function (err, result) {
                        done(err, result);
                    });

                    //insert();
                });
            }
        },

        getAllByFieldValue: function (field, value, callback) {
            var map;
            if (field === 'author') {
                map = 'author';
            }
            else {
                //TODO is this more efficient as a precompiled string?
                map = {
                    map: function (doc, emit) {
                        emit(doc[field]);
                    }
                };
            }

            db.query(map, {include_docs: true, key: value}, function (err, result) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, result.rows.map(function (row) {
                        return row.doc;
                    }));
                }
            });
        },

        getAllByTag: function (tag, callback) {
            if (typeof tag === "string")
                tag = [tag];

            db.query('tag', {keys: tag, include_docs: true},
                function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result.rows.map(function (row) {
                            return row.doc;
                        }));
                    }
                });
        },

        getTagCounts: function(callback) {
            "use strict";
              db.find({
                  selector: {tag: "$exists"},
                  fields: [],
                  sort: ['name'],
                  reduce: "_count"
              }).then(function (result) {
                  callback(result);
              }).catch(function (err) {
                  callback(err);
              });
        },


        getNewest: function (max, callback) {
            db.query("modifiedAt",
                {limit: max, descending: true, include_docs: true},
                function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result.rows.map(function (row) {
                            return row.doc;
                        }));
                    }
                });
        },

        streamNewest: function (max, perObject) {
            db.query("modifiedAt",
                {limit: max, descending: true, include_docs: true},
                function (err, result) {
                    if (!err) {
                        result.rows.forEach(function (r) {
                            perObject(null, r.doc);
                        });
                        perObject(null);
                    } else {
                        perObject(err);
                    }
                });
        },


        getAll: function (callback) {
            db.allDocs({
                    include_docs: true
                },
                function (err, response) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, response.rows.map(function (row) {
                            return row.doc;
                        }));
                    }
                }
            );
        },


        remove: function (query, callback) {
            db.get(query).then(function (doc) {
                db.remove(doc).then(function () {
                    callback(null, doc);
                }).catch(callback);
            }).catch(callback);
        },

        //remove expired, and other periodic maintenance
        update: function () {
            /*
             function getExpiredObjects(withObjects) {
             db.obj.ensureIndex({modifiedAt: 1}, function(err, eres) {
             if (err) {
             withError('ENSURE INDEX modifiedAt ' + err);
             return;
             }

             var now = Date.now();

             db.obj.find({expiresAt: {$lte: now}}, function(err, objs) {
             if (!err)
             withObjects(objs);
             });
             });
             }
             function removeExpired() {
             getExpiredObjects(function(objs) {
             if (objs.length == 0)
             return;
             var ids = _.map(objs, function(o) {
             return o.id;
             });

             $N.deleteObjects(ids); //TODO dont refer to $N, use local DB-specific function
             });
             }

             removeExpired();
             */
        },

        stop: function () {
        }
    };


    return idb;
}
