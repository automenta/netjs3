// Generated by CoffeeScript 1.9.1
var activity, day, hour, lineup, minute, row, second, show, sparks, table;

lineup = require('./lineup');

day = 24 * (hour = 60 * (minute = 60 * (second = 1000)));

activity = function(journal, from, to) {
  var action, i, len;
  for (i = 0, len = journal.length; i < len; i++) {
    action = journal[i];
    if ((action.date != null) && from < action.date && action.date <= to) {
      return true;
    }
  }
  return false;
};

sparks = function(journal) {
  var days, from, i, line, ref;
  line = '';
  days = 60;
  from = (new Date).getTime() - days * day;
  for (i = 1, ref = days; 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--) {
    line += activity(journal, from, from + day) ? '|' : '.';
    if ((new Date(from)).getDay() === 5) {
      line += '<td>';
    }
    from += day;
  }
  return line;
};

row = function(page) {
  var remote, title;
  remote = page.getRemoteSite(location.host);
  title = page.getTitle();
  return "<tr><td align=right>\n  " + (sparks(page.getRawPage().journal)) + "\n<td>\n  <img class=\"remote\" src=\"//" + remote + "/favicon.png\">\n  " + title;
};

table = function(keys) {
  var key;
  return "<table>\n" + (((function() {
    var i, len, results;
    results = [];
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      results.push(row(lineup.atKey(key)));
    }
    return results;
  })()).join("\n")) + "\n</table>\n<p style=\"color: #bbb\">dots are days, advancing to the right, with marks showing activity</p>";
};

show = function() {
  return table(lineup.debugKeys());
};

module.exports = {
  show: show
};
