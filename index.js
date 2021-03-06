/*
 * netjs3 (forked from smallest federated wiki) : Node Server
 *
 * Copyright Ward Cunningham and other contributors
 * Licensed under the AGPL
 */
var app, argv, cc, config, farm, getUserHome, glob, optimist, path, server;
path = require('path');
optimist = require('optimist');
cc = require('config-chain');
glob = require('glob');
farm = require('./farm');
server = require('./server');

getUserHome = function () {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
};

argv = optimist.usage('Usage: $0').options('url', {
    alias: 'u',
    describe: 'Important: Your server URL, used as Persona audience during verification'
}).options('port', {
    alias: 'p',
    describe: 'Port'
}).options('data', {
    alias: 'd',
    describe: 'location of flat file data'
}).options('root', {
    alias: 'r',
    describe: 'Application root folder'
}).options('farm', {
    alias: 'f',
    describe: 'Turn on the farm?'
}).options('home', {
    describe: 'The page to go to instead of index.html'
}).options('host', {
    alias: 'o',
    describe: 'Host to accept connections on, falsy == any'
}).options('id', {
    describe: 'Set the location of the open id file'
}).options('database', {
    describe: 'JSON object for database config'
}).options('neighbors', {
    describe: 'comma separated list of neighbor sites to seed'
}).options('autoseed', {
    describe: 'Seed all sites in a farm to each other site in the farm.',
    boolean: true
}).options('allowed', {
    describe: 'comma separated list of allowed host names for farm mode.'
}).options('uploadLimit', {
    describe: 'Set the upload size limit, limits the size page content items, and pages that can be forked'
}).options('test', {
    boolean: true,
    describe: 'Set server to work with the rspec integration tests'
}).options('help', {
    alias: 'h',
    boolean: true,
    describe: 'Show this help info and exit'
}).options('config', {
    alias: 'conf',
    describe: 'Optional config file.'
}).options('version', {
    alias: 'v',
    describe: 'Optional config file.'
}).argv;

config = cc(argv, argv.config, 'config.json', path.join(__dirname, '..', 'config.json'), cc.env('wiki_'), {
    root: __dirname, //path.dirname(require.resolve('wiki-server')),
    home: 'index',
    packageDir: path.resolve(path.join(__dirname, 'node_modules'))
}).store;

if (argv.help) {
    optimist.showHelp();
} else if (argv.version) {
    console.log('core: ' + require('./package').version);
    glob('wiki-plugin-*', {
        cwd: config.packageDir
    }, function (e, plugins) {
        return plugins.map(function (plugin) {
            return console.log(plugin + ': ' + require(plugin + '/package').version);
        });
    });
} else if (argv.test) {
    console.log("WARNING: Server started in testing mode, other options ignored");
    server({
        port: 33333,
        data: path.join(argv.root, 'spec', 'data')
    });
} else if (config.farm) {
    console.log('netjs3 cluster: navigate to a specific server to start it.');
    farm(config);
} else {


    argv.db = 'netention';
    argv.dbpath = 'db';

    var db = require('./server/p2pdb')(argv, function (db) {

        app = server(config, db);


        console.log('listening..');
        var serv = app.listen(app.startOpts.port, app.startOpts.host);
        console.log("netjs3 on:", app.startOpts.port, "in mode:", app.settings.env);
        return app.emit('running-serv', serv);

    });

}
