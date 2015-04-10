var argv, fs, page, path, random, testid, testpage;

path = require('path');

random = require('../random_id');

testid = random();

argv = require('../defaultargs')({
  data: path.join('/tmp', 'sfwtests', testid),
  root: path.join(__dirname, '..')
});

page = require('../page')(argv);

fs = require('fs');

testpage = {
  title: 'Asdf'
};

describe('page', function() {
  describe('#page.put()', function() {
    return it('should save a page', function(done) {
      return page.put('asdf', testpage, function(e) {
        return done(e);
      });
    });
  });
  return describe('#page.get()', function() {
    it('should get a page if it exists', function(done) {
      return page.get('asdf', function(e, got) {
        if (e) {
          throw e;
        }
        got.title.should.equal('Asdf');
        return done();
      });
    });
    it('should copy a page from default if nonexistant in db', function(done) {
      return page.get('index', function(e, got) {
        if (e) {
          throw e;
        }
        got.title.should.equal('Welcome Visitors');
        return done();
      });
    });
    it('should copy a page from plugins if nonexistant in db', function(done) {
      return page.get('recent-changes', function(e, got) {
        if (e) {
          throw e;
        }
        got.title.should.equal('Recent Changes');
        return done();
      });
    });
    it('should mark a page from plugins with the plugin name', function(done) {
      return page.get('recent-changes', function(e, got) {
        if (e) {
          throw e;
        }
        got.plugin.should.equal('activity');
        return done();
      });
    });
    it('should create a page if it exists nowhere', function(done) {
      return page.get(random(), function(e, got) {
        if (e) {
          throw e;
        }
        got.should.equal('Page not found');
        return done();
      });
    });
    return it('should eventually write the page to disk', function(done) {
      var test;
      test = function() {
        return fs.readFile(path.join(argv.db, 'asdf'), function(err, data) {
          var readPage;
          if (err) {
            throw err;
          }
          readPage = JSON.parse(data);
          return page.get('asdf', function(e, got) {
            readPage.title.should.equal(got.title);
            return done();
          });
        });
      };
      if (page.isWorking()) {
        return page.on('finished', function() {
          return test();
        });
      } else {
        return test();
      }
    });
  });
});
