var argv, fs, path, random, request, server, testid;

request = require('supertest');

fs = require('fs');

server = require('..');

path = require('path');

random = require('../random_id');

testid = random();

argv = require('../defaultargs')({
  data: path.join('/tmp', 'sfwtests', testid),
  port: 55556
});

describe('sitemap', function() {
  var app, sitemapLoc;
  app = {};
  before(function(done) {
    app = server(argv);
    return app.once("owner-set", function() {
      return app.listen(app.startOpts.port, app.startOpts.host, done);
    });
  });
  request = request('http://localhost:55556');
  sitemapLoc = path.join('/tmp', 'sfwtests', testid, 'status', 'sitemap.json');
  it('new site should have an empty sitemap', function(done) {
    return request.get('/system/sitemap.json').expect(200).expect('Content-Type', /json/).end(function(err, res) {
      if (err) {
        throw err;
      }
      res.body.should.be.empty;
      return done();
    });
  });
  it('creating a page should add it to the sitemap', function(done) {
    var body;
    body = JSON.stringify({
      type: 'create',
      item: {
        title: "Asdf Test Page",
        story: [
          {
            id: "a1",
            type: "paragraph",
            text: "this is the first paragraph"
          }, {
            id: "a2",
            type: "paragraph",
            text: "this is the second paragraph"
          }, {
            id: "a3",
            type: "paragraph",
            text: "this is the third paragraph"
          }, {
            id: "a4",
            type: "paragraph",
            text: "this is the fourth paragraph"
          }
        ]
      },
      date: 1234567890123
    });
    return request.put('/page/adsf-test-page/action').send("action=" + body).expect(200).end(function(err, res) {
      if (err) {
        throw err;
      }
      return app.sitemaphandler.once('finished', function() {
        var sitemap;
        try {
          sitemap = JSON.parse(fs.readFileSync(sitemapLoc));
        } catch (_error) {
          err = _error;
          throw err;
        }
        sitemap[0].slug.should.equal['adsf-test-page'];
        sitemap[0].synopsis.should.equal['this is the first paragraph'];
        return done();
      });
    });
  });
  it('synopsis should reflect edit to first paragraph', function(done) {
    var body;
    body = JSON.stringify({
      type: 'edit',
      item: {
        id: 'a1',
        type: 'paragraph',
        text: 'edited'
      },
      id: 'a1'
    });
    return request.put('/page/adsf-test-page/action').send("action=" + body).expect(200).end(function(err, res) {
      if (err) {
        throw err;
      }
      return app.sitemaphandler.once('finished', function() {
        var sitemap;
        try {
          sitemap = JSON.parse(fs.readFileSync(sitemapLoc));
        } catch (_error) {
          err = _error;
          throw err;
        }
        sitemap[0].slug.should.equal['adsf-test-page'];
        sitemap[0].synopsis.should.equal['edited'];
        return done();
      });
    });
  });
  return after(function() {
    if (app.close) {
      return app.close();
    }
  });
});
