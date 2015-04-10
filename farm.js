// Generated by CoffeeScript 1.9.1

/*
 * Federated Wiki : Node Server
 *
 * Copyright Ward Cunningham and other contributors
 * Licensed under the MIT license.
 * https://github.com/fedwiki/wiki-node/blob/master/LICENSE.txt
 */
var exports, http, path, server,
    indexOf = [].indexOf || function (item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) return i;
            }
            return -1;
        };

path = require('path');

http = require('http');

server = require('./server');

module.exports = exports = function (argv) {
    var allow, allowed, farmServ, hosts, runningFarmServ, runningServers;
    hosts = {};
    runningServers = [];
    if (argv.allowed) {
        allowed = argv.allowed.split(',');
        allow = function (host) {
            var ref;
            return ref = host.split(':')[0], indexOf.call(allowed, ref) >= 0;
        };
    } else {
        allow = function () {
            return true;
        };
    }
    farmServ = http.createServer(function (req, res) {
        var copy, incHost, local, neighbors, newargv, ref;
        if ((ref = req.headers) != null ? ref.host : void 0) {
            incHost = req.headers.host;
        } else {
            res.statusCode = 400;
            res.end('Missing host header');
            return;
        }
        if (incHost.slice(0, 4) === "www.") {
            incHost = incHost.slice(4);
        }
        if (!allow(incHost)) {
            res.statusCode = 400;
            res.end('Invalid host');
            return;
        }
        if (hosts[incHost]) {
            return hosts[incHost](req, res);
        } else {
            copy = function (map) {
                var clone, key, value;
                clone = {};
                for (key in map) {
                    value = map[key];
                    clone[key] = typeof value === "object" ? copy(value) : value;
                }
                return clone;
            };
            newargv = copy(argv);
            newargv.data = argv.data ? path.join(argv.data, incHost.split(':')[0]) : path.join(argv.root, 'data', incHost.split(':')[0]);
            newargv.url = "http://" + incHost;
            local = server(newargv);
            hosts[incHost] = local;
            runningServers.push(local);
            if (argv.autoseed) {
                neighbors = argv.neighbors ? argv.neighbors + ',' : '';
                neighbors += Object.keys(hosts).join(',');
                runningServers.forEach(function (server) {
                    return server.startOpts.neighbors = neighbors;
                });
            }
            return local.once("owner-set", function () {
                return hosts[incHost](req, res);
            });
        }
    });
    return runningFarmServ = farmServ.listen(argv.port, argv.host);
};
