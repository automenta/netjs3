//console.log("Window Name: " + window.name);

var wiki = require('./lib/wiki');

try {
    window.name = window.location.host;

    window.wiki = wiki;

    require('./lib/legacy');

    require('./lib/bind');

    require('./lib/plugins');



}
catch (e) {
    module.exports = {
        wiki: wiki,
        synopsis: require('./lib/synopsis')
    };
}