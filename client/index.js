//coffescript wrapper

require('coffee-script');
require('coffee-script/register');

module.exports = {
    wiki: require('./lib/wiki'),
    synopsis: require('./lib/synopsis')
};