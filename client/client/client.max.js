(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
console.log("Window Name: " + window.name);

window.name = window.location.host;

window.wiki = require('./lib/wiki');

require('./lib/legacy');

require('./lib/bind');

require('./lib/plugins');



},{"./lib/bind":5,"./lib/legacy":13,"./lib/plugins":24,"./lib/wiki":36}],2:[function(require,module,exports){
var add, fork, symbols;

symbols = {
  create: '☼',
  add: '+',
  edit: '✎',
  fork: '⚑',
  move: '↕',
  remove: '✕'
};

fork = symbols['fork'];

add = symbols['add'];

module.exports = {
  symbols: symbols,
  fork: fork,
  add: add
};



},{}],3:[function(require,module,exports){
var active, findScrollContainer, scrollTo;

module.exports = active = {};

active.scrollContainer = void 0;

findScrollContainer = function() {
  var scrolled;
  scrolled = $("body, html").filter(function() {
    return $(this).scrollLeft() > 0;
  });
  if (scrolled.length > 0) {
    return scrolled;
  } else {
    return $("body, html").scrollLeft(12).filter(function() {
      return $(this).scrollLeft() > 0;
    }).scrollTop(0);
  }
};

scrollTo = function($page) {
  var bodyWidth, contentWidth, maxX, minX, target, width;
  if ($page.position() == null) {
    return;
  }
  if (active.scrollContainer == null) {
    active.scrollContainer = findScrollContainer();
  }
  bodyWidth = $("body").width();
  minX = active.scrollContainer.scrollLeft();
  maxX = minX + bodyWidth;
  target = $page.position().left;
  width = $page.outerWidth(true);
  contentWidth = $(".page").outerWidth(true) * $(".page").size();
  if (target < minX) {
    return active.scrollContainer.animate({
      scrollLeft: target
    });
  } else if (target + width > maxX) {
    return active.scrollContainer.animate({
      scrollLeft: target - (bodyWidth - width)
    });
  } else if (maxX > $(".pages").outerWidth()) {
    return active.scrollContainer.animate({
      scrollLeft: Math.min(target, contentWidth - bodyWidth)
    });
  }
};

active.set = function($page) {
  $page = $($page);
  $(".active").removeClass("active");
  return scrollTo($page.addClass("active"));
};



},{}],4:[function(require,module,exports){
var actionSymbols, util;

util = require('./util');

actionSymbols = require('./actionSymbols');

module.exports = function($journal, action) {
  var $action, $page, controls, title;
  $page = $journal.parents('.page:first');
  title = action.type || 'separator';
  if (action.date != null) {
    title += " " + (util.formatElapsedTime(action.date));
  }
  $action = $("<a href=\"#\" /> ").addClass("action").addClass(action.type || 'separator').text(action.symbol || actionSymbols.symbols[action.type]).attr('title', title).attr('data-id', action.id || "0").data('action', action);
  controls = $journal.children('.control-buttons');
  if (controls.length > 0) {
    $action.insertBefore(controls);
  } else {
    $action.appendTo($journal);
  }
  if (action.type === 'fork' && (action.site != null)) {
    return $action.css("background-image", "url(//" + action.site + "/favicon.png)").attr("href", "//" + action.site + "/" + ($page.attr('id')) + ".html").attr("target", "" + action.site).data("site", action.site).data("slug", $page.attr('id'));
  }
};



},{"./actionSymbols":2,"./util":35}],5:[function(require,module,exports){
var link, neighborhood, neighbors, searchbox, state;

neighborhood = require('./neighborhood');

neighbors = require('./neighbors');

searchbox = require('./searchbox');

state = require('./state');

link = require('./link');

$(function() {
  searchbox.inject(neighborhood);
  searchbox.bind();
  neighbors.inject(neighborhood);
  neighbors.bind();
  if (window.seedNeighbors) {
    seedNeighbors.split(',').forEach(function(site) {
      return neighborhood.registerNeighbor(site.trim());
    });
  }
  return state.inject(link);
});



},{"./link":16,"./neighborhood":17,"./neighbors":18,"./searchbox":31,"./state":32}],6:[function(require,module,exports){
var $dialog, emit, open, resolve;

resolve = require('./resolve');

$dialog = null;

emit = function() {
  return $dialog = $('<div></div>').html('This dialog will show every time!').dialog({
    autoOpen: false,
    title: 'Basic Dialog',
    height: 600,
    width: 800
  });
};

open = function(title, html) {
  $dialog.html(html);
  $dialog.dialog("option", "title", resolve.resolveLinks(title));
  return $dialog.dialog('open');
};

module.exports = {
  emit: emit,
  open: open
};



},{"./resolve":28}],7:[function(require,module,exports){
var dispatch, isFile, isPage, isUrl, isVideo,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

isFile = function(event) {
  var dt;
  if ((dt = event.originalEvent.dataTransfer) != null) {
    if (indexOf.call(dt.types, 'Files') >= 0) {
      return dt.files[0];
    }
  }
  return null;
};

isUrl = function(event) {
  var dt, url;
  if ((dt = event.originalEvent.dataTransfer) != null) {
    if ((dt.types != null) && (indexOf.call(dt.types, 'text/uri-list') >= 0 || indexOf.call(dt.types, 'text/x-moz-url') >= 0)) {
      url = dt.getData('URL');
      if (url != null ? url.length : void 0) {
        return url;
      }
    }
  }
  return null;
};

isPage = function(url) {
  var found, ignore, item, origin, ref;
  if (found = url.match(/^http:\/\/([a-zA-Z0-9:.-]+)(\/([a-zA-Z0-9:.-]+)\/([a-z0-9-]+(_rev\d+)?))+$/)) {
    item = {};
    ignore = found[0], origin = found[1], ignore = found[2], item.site = found[3], item.slug = found[4], ignore = found[5];
    if ((ref = item.site) === 'view' || ref === 'local' || ref === 'origin') {
      item.site = origin;
    }
    return item;
  }
  return null;
};

isVideo = function(url) {
  var found;
  if (found = url.match(/^https?:\/\/www.youtube.com\/watch\?v=([\w\-]+).*$/)) {
    return {
      text: "YOUTUBE " + found[1]
    };
  }
  if (found = url.match(/^https?:\/\/youtu.be\/([\w\-]+).*$/)) {
    return {
      text: "YOUTUBE " + found[1]
    };
  }
  if (found = url.match(/www.youtube.com%2Fwatch%3Fv%3D([\w\-]+).*$/)) {
    return {
      text: "YOUTUBE " + found[1]
    };
  }
  if (found = url.match(/^https?:\/\/vimeo.com\/([0-9]+).*$/)) {
    return {
      text: "VIMEO " + found[1]
    };
  }
  if (found = url.match(/url=https?%3A%2F%2Fvimeo.com%2F([0-9]+).*$/)) {
    return {
      text: "VIMEO " + found[1]
    };
  }
  if (found = url.match(/https?:\/\/archive.org\/details\/([\w\.\-]+).*$/)) {
    return {
      text: "ARCHIVE " + found[1]
    };
  }
  if (found = url.match(/https?:\/\/tedxtalks.ted.com\/video\/([\w\-]+).*$/)) {
    return {
      text: "TEDX " + found[1]
    };
  }
  if (found = url.match(/https?:\/\/www.ted.com\/talks\/([\w\.\-]+).*$/)) {
    return {
      text: "TED " + found[1]
    };
  }
  return null;
};

dispatch = function(handlers) {
  return function(event) {
    var file, handle, page, punt, ref, stop, url, video;
    stop = function(ignored) {
      event.preventDefault();
      return event.stopPropagation();
    };
    if (url = isUrl(event)) {
      if (page = isPage(url)) {
        if ((handle = handlers.page) != null) {
          return stop(handle(page));
        }
      }
      if (video = isVideo(url)) {
        if ((handle = handlers.video) != null) {
          return stop(handle(video));
        }
      }
      punt = {
        url: url
      };
    }
    if (file = isFile(event)) {
      if ((handle = handlers.file) != null) {
        return stop(handle(file));
      }
      punt = {
        file: file
      };
    }
    if ((handle = handlers.punt) != null) {
      punt || (punt = {
        dt: event.dataTransfer,
        types: (ref = event.dataTransfer) != null ? ref.types : void 0
      });
      return stop(handle(punt));
    }
  };
};

module.exports = {
  dispatch: dispatch
};



},{}],8:[function(require,module,exports){
var escape, getSelectionPos, itemz, link, pageHandler, plugin, random, setCaretPosition, spawnEditor, textEditor;

plugin = require('./plugin');

itemz = require('./itemz');

pageHandler = require('./pageHandler');

link = require('./link');

random = require('./random');

escape = function(string) {
  return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

textEditor = function($item, item, option) {
  var $textarea, focusoutHandler, keydownHandler, original, ref, ref1;
  if (option == null) {
    option = {};
  }
  console.log('textEditor', item.id, option);
  keydownHandler = function(e) {
    var $page, $previous, caret, page, prefix, previous, sel, suffix, text;
    if ((e.altKey || e.ctlKey || e.metaKey) && e.which === 83) {
      $textarea.focusout();
      return false;
    }
    if ((e.altKey || e.ctlKey || e.metaKey) && e.which === 73) {
      e.preventDefault();
      if (!e.shiftKey) {
        page = $(e.target).parents('.page');
      }
      link.doInternalLink("about " + item.type + " plugin", page);
      return false;
    }
    if (item.type === 'paragraph') {
      sel = getSelectionPos($textarea);
      if (e.which === $.ui.keyCode.BACKSPACE && sel.start === 0 && sel.start === sel.end) {
        $previous = $item.prev();
        previous = itemz.getItem($previous);
        if (previous.type !== 'paragraph') {
          return false;
        }
        caret = previous[option.field || 'text'].length;
        suffix = $textarea.val();
        $textarea.val('');
        textEditor($previous, previous, {
          caret: caret,
          suffix: suffix
        });
        return false;
      }
      if (e.which === $.ui.keyCode.ENTER) {
        if (!sel) {
          return false;
        }
        $page = $item.parent().parent();
        text = $textarea.val();
        prefix = text.substring(0, sel.start);
        suffix = text.substring(sel.end);
        if (prefix === '') {
          $textarea.val(suffix);
          $textarea.focusout();
          spawnEditor($page, $item.prev(), prefix, true);
        } else {
          $textarea.val(prefix);
          $textarea.focusout();
          spawnEditor($page, $item, suffix);
        }
        return false;
      }
    }
  };
  focusoutHandler = function() {
    var $page;
    $item.removeClass('textEditing');
    $textarea.unbind();
    $page = $item.parents('.page:first');
    if (item[option.field || 'text'] = $textarea.val()) {
      plugin["do"]($item.empty(), item);
      if (option.after) {
        if (item[option.field || 'text'] === '') {
          return;
        }
        pageHandler.put($page, {
          type: 'add',
          id: item.id,
          item: item,
          after: option.after
        });
      } else {
        if (item[option.field || 'text'] === original) {
          return;
        }
        pageHandler.put($page, {
          type: 'edit',
          id: item.id,
          item: item
        });
      }
    } else {
      if (!option.after) {
        pageHandler.put($page, {
          type: 'remove',
          id: item.id
        });
      }
      $item.remove();
    }
    return null;
  };
  if ($item.hasClass('textEditing')) {
    return;
  }
  $item.addClass('textEditing');
  $item.unbind();
  original = (ref = item[option.field || 'text']) != null ? ref : '';
  $textarea = $("<textarea>" + (escape(original)) + (escape((ref1 = option.suffix) != null ? ref1 : '')) + "</textarea>").focusout(focusoutHandler).bind('keydown', keydownHandler);
  $item.html($textarea);
  if (option.caret) {
    return setCaretPosition($textarea, option.caret);
  } else if (option.append) {
    setCaretPosition($textarea, $textarea.val().length);
    return $textarea.scrollTop($textarea[0].scrollHeight - $textarea.height());
  } else {
    return $textarea.focus();
  }
};

spawnEditor = function($page, $before, text) {
  var $item, before, item;
  item = {
    type: 'paragraph',
    id: random.itemId(),
    text: text
  };
  $item = $("<div class=\"item paragraph\" data-id=" + item.id + "></div>");
  $item.data('item', item).data('pageElement', $page);
  $before.after($item);
  plugin["do"]($item, item);
  before = itemz.getItem($before);
  return textEditor($item, item, {
    after: before != null ? before.id : void 0
  });
};

getSelectionPos = function($textarea) {
  var el, iePos, sel;
  el = $textarea.get(0);
  if (document.selection) {
    el.focus();
    sel = document.selection.createRange();
    sel.moveStart('character', -el.value.length);
    iePos = sel.text.length;
    return {
      start: iePos,
      end: iePos
    };
  } else {
    return {
      start: el.selectionStart,
      end: el.selectionEnd
    };
  }
};

setCaretPosition = function($textarea, caretPos) {
  var el, range;
  el = $textarea.get(0);
  if (el != null) {
    if (el.createTextRange) {
      range = el.createTextRange();
      range.move("character", caretPos);
      range.select();
    } else {
      el.setSelectionRange(caretPos, caretPos);
    }
    return el.focus();
  }
};

module.exports = {
  textEditor: textEditor
};



},{"./itemz":12,"./link":16,"./pageHandler":20,"./plugin":23,"./random":25}],9:[function(require,module,exports){
var arrayToJson, bind, csvToArray, drop, editor, emit, escape, neighborhood, pageHandler, plugin, resolve, synopsis;

neighborhood = require('./neighborhood');

plugin = require('./plugin');

resolve = require('./resolve');

pageHandler = require('./pageHandler');

editor = require('./editor');

synopsis = require('./synopsis');

drop = require('./drop');

escape = function(line) {
  return line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
};

emit = function($item, item) {
  var showMenu, showPrompt;
  $item.append('<p>Double-Click to Edit<br>Drop Text or Image to Insert</p>');
  showMenu = function() {
    var column, i, info, len, menu, ref;
    menu = $item.find('p').append("<br>Or Choose a Plugin\n<center>\n<table style=\"text-align:left;\">\n<tr><td><ul id=format><td><ul id=data><td><ul id=other>");
    ref = window.catalog;
    for (i = 0, len = ref.length; i < len; i++) {
      info = ref[i];
      column = info.category || 'other';
      if (column !== 'format' && column !== 'data') {
        column = 'other';
      }
      menu.find('#' + column).append("<li><a class=\"menu\" href=\"#\" title=\"" + info.title + "\">" + info.name + "</a></li>");
    }
    return menu.find('a.menu').click(function(evt) {
      $item.removeClass('factory').addClass(item.type = evt.target.text.toLowerCase());
      $item.unbind();
      return editor.textEditor($item, item);
    });
  };
  showPrompt = function() {
    return $item.append("<p>" + (resolve.resolveLinks(item.prompt, escape)) + "</b>");
  };
  if (item.prompt) {
    return showPrompt();
  } else if (window.catalog != null) {
    return showMenu();
  } else {
    return $.getJSON('/system/factories.json', function(data) {
      window.catalog = data;
      return showMenu();
    });
  }
};

bind = function($item, item) {
  var addReference, addVideo, punt, readFile, syncEditAction;
  syncEditAction = function() {
    var $page, err;
    $item.empty().unbind();
    $item.removeClass("factory").addClass(item.type);
    $page = $item.parents('.page:first');
    try {
      $item.data('pageElement', $page);
      $item.data('item', item);
      plugin.getPlugin(item.type, function(plugin) {
        plugin.emit($item, item);
        return plugin.bind($item, item);
      });
    } catch (_error) {
      err = _error;
      $item.append("<p class='error'>" + err + "</p>");
    }
    return pageHandler.put($page, {
      type: 'edit',
      id: item.id,
      item: item
    });
  };
  punt = function(data) {
    item.prompt = "Unexpected Item\nWe can't make sense of the drop.\nTry something else or see [[About Factory Plugin]].";
    data.userAgent = navigator.userAgent;
    item.punt = data;
    return syncEditAction();
  };
  addReference = function(data) {
    return $.getJSON("http://" + data.site + "/" + data.slug + ".json", function(remote) {
      item.type = 'reference';
      item.site = data.site;
      item.slug = data.slug;
      item.title = remote.title || data.slug;
      item.text = synopsis(remote);
      syncEditAction();
      if (item.site != null) {
        return neighborhood.registerNeighbor(item.site);
      }
    });
  };
  addVideo = function(video) {
    item.type = 'video';
    item.text = video.text + "\n(double-click to edit caption)\n";
    return syncEditAction();
  };
  readFile = function(file) {
    var majorType, minorType, reader, ref;
    if (file != null) {
      ref = file.type.split("/"), majorType = ref[0], minorType = ref[1];
      reader = new FileReader();
      if (majorType === "image") {
        reader.onload = function(loadEvent) {
          item.type = 'image';
          item.url = loadEvent.target.result;
          item.caption || (item.caption = "Uploaded image");
          return syncEditAction();
        };
        return reader.readAsDataURL(file);
      } else if (majorType === "text") {
        reader.onload = function(loadEvent) {
          var array, result;
          result = loadEvent.target.result;
          if (minorType === 'csv') {
            item.type = 'data';
            item.columns = (array = csvToArray(result))[0];
            item.data = arrayToJson(array);
            item.text = file.fileName;
          } else {
            item.type = 'paragraph';
            item.text = result;
          }
          return syncEditAction();
        };
        return reader.readAsText(file);
      } else {
        return punt({
          file: file
        });
      }
    }
  };
  $item.dblclick(function(e) {
    if (e.shiftKey) {
      return editor.textEditor($item, item, {
        field: 'prompt'
      });
    } else {
      $item.removeClass('factory').addClass(item.type = 'paragraph');
      $item.unbind();
      return editor.textEditor($item, item);
    }
  });
  $item.bind('dragenter', function(evt) {
    return evt.preventDefault();
  });
  $item.bind('dragover', function(evt) {
    return evt.preventDefault();
  });
  return $item.bind("drop", drop.dispatch({
    page: addReference,
    file: readFile,
    video: addVideo,
    punt: punt
  }));
};

csvToArray = function(strData, strDelimiter) {
  var arrData, arrMatches, objPattern, strMatchedDelimiter, strMatchedValue;
  strDelimiter = strDelimiter || ",";
  objPattern = new RegExp("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + "([^\"\\" + strDelimiter + "\\r\\n]*))", "gi");
  arrData = [[]];
  arrMatches = null;
  while (arrMatches = objPattern.exec(strData)) {
    strMatchedDelimiter = arrMatches[1];
    if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
      arrData.push([]);
    }
    if (arrMatches[2]) {
      strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
    } else {
      strMatchedValue = arrMatches[3];
    }
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  return arrData;
};

arrayToJson = function(array) {
  var cols, i, len, results, row, rowToObject;
  cols = array.shift();
  rowToObject = function(row) {
    var i, k, len, obj, ref, ref1, v;
    obj = {};
    ref = _.zip(cols, row);
    for (i = 0, len = ref.length; i < len; i++) {
      ref1 = ref[i], k = ref1[0], v = ref1[1];
      if ((v != null) && (v.match(/\S/)) && v !== 'NULL') {
        obj[k] = v;
      }
    }
    return obj;
  };
  results = [];
  for (i = 0, len = array.length; i < len; i++) {
    row = array[i];
    results.push(rowToObject(row));
  }
  return results;
};

module.exports = {
  emit: emit,
  bind: bind
};



},{"./drop":7,"./editor":8,"./neighborhood":17,"./pageHandler":20,"./plugin":23,"./resolve":28,"./synopsis":33}],10:[function(require,module,exports){
var bind, emit, neighborhood, resolve;

resolve = require('./resolve');

neighborhood = require('./neighborhood');

emit = function($item, item) {
  var i, info, len, ref, results;
  $item.append(item.text + "<br><br><button class=\"create\">create</button> new blank page");
  if (((info = neighborhood.sites[location.host]) != null) && (info.sitemap != null)) {
    ref = info.sitemap;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      if (item.slug.match(/-template$/)) {
        results.push($item.append("<br><button class=\"create\" data-slug=" + item.slug + ">create</button> from " + (resolve.resolveLinks("[[" + item.title + "]]"))));
      } else {
        results.push(void 0);
      }
    }
    return results;
  }
};

bind = function($item, item) {};

module.exports = {
  emit: emit,
  bind: bind
};



},{"./neighborhood":17,"./resolve":28}],11:[function(require,module,exports){
var bind, dialog, editor, emit, resolve;

dialog = require('./dialog');

editor = require('./editor');

resolve = require('./resolve');

emit = function($item, item) {
  item.text || (item.text = item.caption);
  return $item.append("<img class=thumbnail src=\"" + item.url + "\"> <p>" + (resolve.resolveLinks(item.text)) + "</p>");
};

bind = function($item, item) {
  $item.dblclick(function() {
    return editor.textEditor($item, item);
  });
  return $item.find('img').dblclick(function() {
    return dialog.open(item.text, this);
  });
};

module.exports = {
  emit: emit,
  bind: bind
};



},{"./dialog":6,"./editor":8,"./resolve":28}],12:[function(require,module,exports){
var createItem, getItem, pageHandler, plugin, random, removeItem, replaceItem, sleep;

pageHandler = require('./pageHandler');

plugin = require('./plugin');

random = require('./random');

sleep = function(time, done) {
  return setTimeout(done, time);
};

getItem = function($item) {
  if ($($item).length > 0) {
    return $($item).data("item") || $($item).data('staticItem');
  }
};

removeItem = function($item, item) {
  pageHandler.put($item.parents('.page:first'), {
    type: 'remove',
    id: item.id
  });
  return $item.remove();
};

createItem = function($page, $before, item) {
  var $item, before;
  if ($page == null) {
    $page = $before.parents('.page');
  }
  item.id = random.itemId();
  $item = $("<div class=\"item " + item.type + "\" data-id=\"" + "\"</div>");
  $item.data('item', item).data('pageElement', $page);
  if ($before != null) {
    $before.after($item);
  } else {
    $page.find('.story').append($item);
  }
  plugin["do"]($item, item);
  before = getItem($before);
  sleep(500, function() {
    return pageHandler.put($page, {
      item: item,
      id: item.id,
      type: 'add',
      after: before != null ? before.id : void 0
    });
  });
  return $item;
};

replaceItem = function($item, type, item) {
  var $page, err, newItem;
  newItem = $.extend({}, item);
  $item.empty().unbind();
  $item.removeClass(type).addClass(newItem.type);
  $page = $item.parents('.page:first');
  try {
    $item.data('pageElement', $page);
    $item.data('item', newItem);
    plugin.getPlugin(item.type, function(plugin) {
      plugin.emit($item, newItem);
      return plugin.bind($item, newItem);
    });
  } catch (_error) {
    err = _error;
    $item.append("<p class='error'>" + err + "</p>");
  }
  return pageHandler.put($page, {
    type: 'edit',
    id: newItem.id,
    item: newItem
  });
};

module.exports = {
  createItem: createItem,
  removeItem: removeItem,
  getItem: getItem,
  replaceItem: replaceItem
};



},{"./pageHandler":20,"./plugin":23,"./random":25}],13:[function(require,module,exports){
var active, asSlug, dialog, drop, lineup, link, pageHandler, refresh, state, target;

pageHandler = require('./pageHandler');

state = require('./state');

active = require('./active');

refresh = require('./refresh');

lineup = require('./lineup');

drop = require('./drop');

dialog = require('./dialog');

link = require('./link');

target = require('./target');

asSlug = require('./page').asSlug;

$(function() {
  var LEFTARROW, RIGHTARROW, finishClick, getTemplate, lineupActivity;
  dialog.emit();
  LEFTARROW = 37;
  RIGHTARROW = 39;
  $(document).keydown(function(event) {
    var direction, newIndex, pages;
    direction = (function() {
      switch (event.which) {
        case LEFTARROW:
          return -1;
        case RIGHTARROW:
          return +1;
      }
    })();
    if (direction && !(event.target.tagName === "TEXTAREA")) {
      pages = $('.page');
      newIndex = pages.index($('.active')) + direction;
      if ((0 <= newIndex && newIndex < pages.length)) {
        return active.set(pages.eq(newIndex));
      }
    }
  });
  $(window).on('popstate', state.show);
  $(document).ajaxError(function(event, request, settings) {
    if (request.status === 0 || request.status === 404) {
      return;
    }
    return console.log('ajax error', event, request, settings);
  });
  getTemplate = function(slug, done) {
    if (!slug) {
      return done(null);
    }
    console.log('getTemplate', slug);
    return pageHandler.get({
      whenGotten: function(pageObject, siteFound) {
        return done(pageObject);
      },
      whenNotGotten: function() {
        return done(null);
      },
      pageInformation: {
        slug: slug
      }
    });
  };
  finishClick = function(e, name) {
    var page;
    e.preventDefault();
    if (!e.shiftKey) {
      page = $(e.target).parents('.page');
    }
    link.doInternalLink(name, page, $(e.target).data('site'));
    return false;
  };
  $('.main').delegate('.show-page-source', 'click', function(e) {
    var $page, page;
    e.preventDefault();
    $page = $(this).parent().parent();
    page = lineup.atKey($page.data('key')).getRawPage();
    return dialog.open("JSON for " + page.title, $('<pre/>').text(JSON.stringify(page, null, 2)));
  }).delegate('.page', 'click', function(e) {
    if (!$(e.target).is("a")) {
      return active.set(this);
    }
  }).delegate('.internal', 'click', function(e) {
    var name;
    name = $(e.target).data('pageName');
    name = "" + name;
    pageHandler.context = $(e.target).attr('title').split(' => ');
    return finishClick(e, name);
  }).delegate('img.remote', 'click', function(e) {
    var name;
    name = $(e.target).data('slug');
    pageHandler.context = [$(e.target).data('site')];
    return finishClick(e, name);
  }).delegate('.revision', 'dblclick', function(e) {
    var $page, action, json, page, rev;
    e.preventDefault();
    $page = $(this).parents('.page');
    page = lineup.atKey($page.data('key')).getRawPage();
    rev = page.journal.length - 1;
    action = page.journal[rev];
    json = JSON.stringify(action, null, 2);
    return dialog.open("Revision " + rev + ", " + action.type + " action", $('<pre/>').text(json));
  }).delegate('.action', 'click', function(e) {
    var $action, $page, key, name, rev, slug;
    e.preventDefault();
    $action = $(e.target);
    if ($action.is('.fork') && ((name = $action.data('slug')) != null)) {
      pageHandler.context = [$action.data('site')];
      return finishClick(e, (name.split('_'))[0]);
    } else {
      $page = $(this).parents('.page');
      key = $page.data('key');
      slug = lineup.atKey(key).getSlug();
      rev = $(this).parent().children().not('.separator').index($action);
      if (rev < 0) {
        return;
      }
      if (!e.shiftKey) {
        $page.nextAll().remove();
      }
      if (!e.shiftKey) {
        lineup.removeAllAfterKey(key);
      }
      link.createPage(slug + "_rev" + rev, $page.data('site')).appendTo($('.main')).each(refresh.cycle);
      return active.set($('.page').last());
    }
  }).delegate('.fork-page', 'click', function(e) {
    var $page, action, pageObject;
    $page = $(e.target).parents('.page');
    pageObject = lineup.atKey($page.data('key'));
    action = {
      type: 'fork'
    };
    if ($page.hasClass('local')) {
      if (pageHandler.useLocalStorage()) {
        return;
      }
      $page.removeClass('local');
    } else if (pageObject.isRemote()) {
      action.site = pageObject.getRemoteSite();
    }
    if ($page.data('rev') != null) {
      $page.removeClass('ghost');
      $page.find('.revision').remove();
    }
    return pageHandler.put($page, action);
  }).delegate('button.create', 'click', function(e) {
    return getTemplate($(e.target).data('slug'), function(template) {
      var $page, page, pageObject;
      $page = $(e.target).parents('.page:first');
      $page.removeClass('ghost');
      pageObject = lineup.atKey($page.data('key'));
      pageObject.become(template);
      page = pageObject.getRawPage();
      refresh.rebuildPage(pageObject, $page.empty());
      return pageHandler.put($page, {
        type: 'create',
        id: page.id,
        item: {
          title: page.title,
          story: page.story
        }
      });
    });
  }).delegate('.score', 'hover', function(e) {
    return $('.main').trigger('thumb', $(e.target).data('thumb'));
  }).bind('dragenter', function(evt) {
    return evt.preventDefault();
  }).bind('dragover', function(evt) {
    return evt.preventDefault();
  }).bind("drop", drop.dispatch({
    page: function(item) {
      return link.doInternalLink(item.slug, null, item.site);
    }
  }));
  $(".provider input").click(function() {
    $("footer input:first").val($(this).attr('data-provider'));
    return $("footer form").submit();
  });
  $('body').on('new-neighbor-done', function(e, neighbor) {
    return $('.page').each(function(index, element) {
      return refresh.emitTwins($(element));
    });
  });
  lineupActivity = require('./lineupActivity');
  $("<span class=menu> &nbsp; &equiv; &nbsp; </span>").css({
    "cursor": "pointer",
    "font-size": "120%"
  }).appendTo('footer').click(function() {
    return dialog.open("Lineup Activity", lineupActivity.show());
  });
  target.bind();
  return $(function() {
    state.first();
    $('.page').each(refresh.cycle);
    return active.set($('.page').last());
  });
});



},{"./active":3,"./dialog":6,"./drop":7,"./lineup":14,"./lineupActivity":15,"./link":16,"./page":19,"./pageHandler":20,"./refresh":27,"./state":32,"./target":34}],14:[function(require,module,exports){
var addPage, atKey, bestTitle, crumbs, debugKeys, debugReset, debugSelfCheck, keyByIndex, leftKey, pageByKey, random, removeAllAfterKey, removeKey, titleAtKey,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

random = require('./random');

pageByKey = {};

keyByIndex = [];

addPage = function(pageObject) {
  var key;
  key = random.randomBytes(4);
  pageByKey[key] = pageObject;
  keyByIndex.push(key);
  return key;
};

removeKey = function(key) {
  if (indexOf.call(keyByIndex, key) < 0) {
    return null;
  }
  keyByIndex = keyByIndex.filter(function(each) {
    return key !== each;
  });
  delete pageByKey[key];
  return key;
};

removeAllAfterKey = function(key) {
  var result, unwanted;
  result = [];
  if (indexOf.call(keyByIndex, key) < 0) {
    return result;
  }
  while (keyByIndex[keyByIndex.length - 1] !== key) {
    unwanted = keyByIndex.pop();
    result.unshift(unwanted);
    delete pageByKey[unwanted];
  }
  return result;
};

atKey = function(key) {
  return pageByKey[key];
};

titleAtKey = function(key) {
  return atKey(key).getTitle();
};

bestTitle = function() {
  if (!keyByIndex.length) {
    return "Wiki";
  }
  return titleAtKey(keyByIndex[keyByIndex.length - 1]);
};

debugKeys = function() {
  return keyByIndex;
};

debugReset = function() {
  pageByKey = {};
  return keyByIndex = [];
};

debugSelfCheck = function(keys) {
  var have, keysByIndex, want;
  if ((have = "" + keyByIndex) === (want = "" + keys)) {
    return;
  }
  console.log('The lineup is out of sync with the dom.');
  console.log(".pages:", keys);
  console.log("lineup:", keyByIndex);
  if (("" + (Object.keys(keyByIndex).sort())) !== ("" + (Object.keys(keys).sort()))) {
    return;
  }
  console.log('It looks like an ordering problem we can fix.');
  return keysByIndex = keys;
};

leftKey = function(key) {
  var pos;
  pos = keyByIndex.indexOf(key);
  if (pos < 1) {
    return null;
  }
  return keyByIndex[pos - 1];
};

crumbs = function(key, location) {
  var adjacent, host, left, page, result, slug;
  page = pageByKey[key];
  host = page.getRemoteSite(location);
  result = ['view', slug = page.getSlug()];
  if (slug !== 'welcome-visitors') {
    result.unshift('view', 'welcome-visitors');
  }
  if (host !== location && ((left = leftKey(key)) != null)) {
    if (!(adjacent = pageByKey[left]).isRemote()) {
      result.push(location, adjacent.getSlug());
    }
  }
  result.unshift(host);
  return result;
};

module.exports = {
  addPage: addPage,
  removeKey: removeKey,
  removeAllAfterKey: removeAllAfterKey,
  atKey: atKey,
  titleAtKey: titleAtKey,
  bestTitle: bestTitle,
  debugKeys: debugKeys,
  debugReset: debugReset,
  crumbs: crumbs,
  debugSelfCheck: debugSelfCheck
};



},{"./random":25}],15:[function(require,module,exports){
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



},{"./lineup":14}],16:[function(require,module,exports){
var active, asSlug, createPage, doInternalLink, lineup, pageEmitter, ref, refresh, showPage, showResult;

lineup = require('./lineup');

active = require('./active');

refresh = require('./refresh');

ref = require('./page'), asSlug = ref.asSlug, pageEmitter = ref.pageEmitter;

createPage = function(name, loc) {
  var $page, site;
  if (loc && loc !== 'view') {
    site = loc;
  }
  $page = $("<div class=\"page\" id=\"" + name + "\">\n  <div class=\"twins\"> <p> </p> </div>\n  <div class=\"header\">\n    <h1> <img class=\"favicon\" src=\"" + (site ? "//" + site : "") + "/favicon.png\" height=\"32px\"> " + name + " </h1>\n  </div>\n</div>");
  if (site) {
    $page.data('site', site);
  }
  return $page;
};

showPage = function(name, loc) {
  return createPage(name, loc).appendTo('.main').each(refresh.cycle);
};

doInternalLink = function(name, $page, site) {
  if (site == null) {
    site = null;
  }
  name = asSlug(name);
  if ($page != null) {
    $($page).nextAll().remove();
  }
  if ($page != null) {
    lineup.removeAllAfterKey($($page).data('key'));
  }
  showPage(name, site);
  return active.set($('.page').last());
};

showResult = function(pageObject) {
  var $page;
  $page = createPage(pageObject.getSlug()).addClass('ghost');
  $page.appendTo($('.main'));
  refresh.buildPage(pageObject, $page);
  return active.set($('.page').last());
};

pageEmitter.on('show', function(page) {
  console.log('pageEmitter handling', page);
  return showResult(page);
});

module.exports = {
  createPage: createPage,
  doInternalLink: doInternalLink,
  showPage: showPage,
  showResult: showResult
};



},{"./active":3,"./lineup":14,"./page":19,"./refresh":27}],17:[function(require,module,exports){
var _, neighborhood, nextAvailableFetch, nextFetchInterval, populateSiteInfoFor,
  hasProp = {}.hasOwnProperty;

_ = require('underscore');

module.exports = neighborhood = {};

neighborhood.sites = {};

nextAvailableFetch = 0;

nextFetchInterval = 2000;

populateSiteInfoFor = function(site, neighborInfo) {
  var fetchMap, now, transition;
  if (neighborInfo.sitemapRequestInflight) {
    return;
  }
  neighborInfo.sitemapRequestInflight = true;
  transition = function(site, from, to) {
    return $(".neighbor[data-site=\"" + site + "\"]").find('div').removeClass(from).addClass(to);
  };
  fetchMap = function() {
    var request, sitemapUrl;
    sitemapUrl = "http://" + site + "/system/sitemap.json";
    transition(site, 'wait', 'fetch');
    request = $.ajax({
      type: 'GET',
      dataType: 'json',
      url: sitemapUrl
    });
    return request.always(function() {
      return neighborInfo.sitemapRequestInflight = false;
    }).done(function(data) {
      neighborInfo.sitemap = data;
      transition(site, 'fetch', 'done');
      return $('body').trigger('new-neighbor-done', site);
    }).fail(function(data) {
      return transition(site, 'fetch', 'fail');
    });
  };
  now = Date.now();
  if (now > nextAvailableFetch) {
    nextAvailableFetch = now + nextFetchInterval;
    return setTimeout(fetchMap, 100);
  } else {
    setTimeout(fetchMap, nextAvailableFetch - now);
    return nextAvailableFetch += nextFetchInterval;
  }
};

neighborhood.registerNeighbor = function(site) {
  var neighborInfo;
  if (neighborhood.sites[site] != null) {
    return;
  }
  neighborInfo = {};
  neighborhood.sites[site] = neighborInfo;
  populateSiteInfoFor(site, neighborInfo);
  return $('body').trigger('new-neighbor', site);
};

neighborhood.listNeighbors = function() {
  return _.keys(neighborhood.sites);
};

neighborhood.search = function(searchQuery) {
  var finds, match, matchingPages, neighborInfo, neighborSite, ref, sitemap, start, tally, tick;
  finds = [];
  tally = {};
  tick = function(key) {
    if (tally[key] != null) {
      return tally[key]++;
    } else {
      return tally[key] = 1;
    }
  };
  match = function(key, text) {
    var hit;
    hit = (text != null) && text.toLowerCase().indexOf(searchQuery.toLowerCase()) >= 0;
    if (hit) {
      tick(key);
    }
    return hit;
  };
  start = Date.now();
  ref = neighborhood.sites;
  for (neighborSite in ref) {
    if (!hasProp.call(ref, neighborSite)) continue;
    neighborInfo = ref[neighborSite];
    sitemap = neighborInfo.sitemap;
    if (sitemap != null) {
      tick('sites');
    }
    matchingPages = _.each(sitemap, function(page) {
      tick('pages');
      if (!(match('title', page.title) || match('text', page.synopsis) || match('slug', page.slug))) {
        return;
      }
      tick('finds');
      return finds.push({
        page: page,
        site: neighborSite,
        rank: 1
      });
    });
  }
  tally['msec'] = Date.now() - start;
  return {
    finds: finds,
    tally: tally
  };
};



},{"underscore":38}],18:[function(require,module,exports){
var bind, flag, inject, link, sites, totalPages;

link = require('./link');

sites = null;

totalPages = 0;

flag = function(site) {
  return "<span class=\"neighbor\" data-site=\"" + site + "\">\n  <div class=\"wait\">\n    <img src=\"http://" + site + "/favicon.png\" title=\"" + site + "\">\n  </div>\n</span>";
};

inject = function(neighborhood) {
  return sites = neighborhood.sites;
};

bind = function() {
  var $neighborhood;
  $neighborhood = $('.neighborhood');
  return $('body').on('new-neighbor', function(e, site) {
    return $neighborhood.append(flag(site));
  }).on('new-neighbor-done', function(e, site) {
    var img, pageCount;
    pageCount = sites[site].sitemap.length;
    img = $(".neighborhood .neighbor[data-site=\"" + site + "\"]").find('img');
    img.attr('title', site + "\n " + pageCount + " pages");
    totalPages += pageCount;
    return $('.searchbox .pages').text(totalPages + " pages");
  }).delegate('.neighbor img', 'click', function(e) {
    return link.doInternalLink('welcome-visitors', null, this.title.split("\n")[0]);
  });
};

module.exports = {
  inject: inject,
  bind: bind
};



},{"./link":16}],19:[function(require,module,exports){
var EventEmitter, _, asSlug, formatDate, newPage, nowSections, pageEmitter, random, revision;

formatDate = require('./util').formatDate;

random = require('./random');

revision = require('./revision');

_ = require('underscore');

EventEmitter = require('events').EventEmitter;

pageEmitter = new EventEmitter;

asSlug = function(name) {
  return name.replace(/\s/g, '-').replace(/[^A-Za-z0-9-]/g, '').toLowerCase();
};

nowSections = function(now) {
  return [
    {
      symbol: '❄',
      date: now - 1000 * 60 * 60 * 24 * 366,
      period: 'a Year'
    }, {
      symbol: '⚘',
      date: now - 1000 * 60 * 60 * 24 * 31 * 3,
      period: 'a Season'
    }, {
      symbol: '⚪',
      date: now - 1000 * 60 * 60 * 24 * 31,
      period: 'a Month'
    }, {
      symbol: '☽',
      date: now - 1000 * 60 * 60 * 24 * 7,
      period: 'a Week'
    }, {
      symbol: '☀',
      date: now - 1000 * 60 * 60 * 24,
      period: 'a Day'
    }, {
      symbol: '⌚',
      date: now - 1000 * 60 * 60,
      period: 'an Hour'
    }
  ];
};

newPage = function(json, site) {
  var addItem, addParagraph, apply, become, getContext, getItem, getNeighbors, getRawPage, getRemoteSite, getRemoteSiteDetails, getRevision, getSlug, getTimestamp, getTitle, isLocal, isPlugin, isRemote, merge, notDuplicate, page, seqActions, seqItems, setTitle, siteLineup;
  page = json || {};
  page.title || (page.title = 'empty');
  page.story || (page.story = []);
  page.journal || (page.journal = []);
  getRawPage = function() {
    return page;
  };
  getContext = function() {
    var action, addContext, context, j, len, ref;
    context = ['view'];
    if (isRemote()) {
      context.push(site);
    }
    addContext = function(site) {
      if ((site != null) && !_.include(context, site)) {
        return context.push(site);
      }
    };
    ref = page.journal.slice(0).reverse();
    for (j = 0, len = ref.length; j < len; j++) {
      action = ref[j];
      addContext(action != null ? action.site : void 0);
    }
    return context;
  };
  isPlugin = function() {
    return page.plugin != null;
  };
  isRemote = function() {
    return !(site === (void 0) || site === null || site === 'view' || site === 'origin' || site === 'local');
  };
  isLocal = function() {
    return site === 'local';
  };
  getRemoteSite = function(host) {
    if (host == null) {
      host = null;
    }
    if (isRemote()) {
      return site;
    } else {
      return host;
    }
  };
  getRemoteSiteDetails = function(host) {
    var result;
    if (host == null) {
      host = null;
    }
    result = [];
    if (host || isRemote()) {
      result.push(getRemoteSite(host));
    }
    if (isPlugin()) {
      result.push(page.plugin + " plugin");
    }
    return result.join("\n");
  };
  getSlug = function() {
    return asSlug(page.title);
  };
  getNeighbors = function(host) {
    var action, item, j, k, len, len1, neighbors, ref, ref1;
    neighbors = [];
    if (isRemote()) {
      neighbors.push(site);
    } else {
      if (host != null) {
        neighbors.push(host);
      }
    }
    ref = page.story;
    for (j = 0, len = ref.length; j < len; j++) {
      item = ref[j];
      if ((item != null ? item.site : void 0) != null) {
        neighbors.push(item.site);
      }
    }
    ref1 = page.journal;
    for (k = 0, len1 = ref1.length; k < len1; k++) {
      action = ref1[k];
      if ((action != null ? action.site : void 0) != null) {
        neighbors.push(action.site);
      }
    }
    return _.uniq(neighbors);
  };
  getTitle = function() {
    return page.title;
  };
  setTitle = function(title) {
    return page.title = title;
  };
  getRevision = function() {
    return page.journal.length - 1;
  };
  getTimestamp = function() {
    var date;
    date = page.journal[getRevision()].date;
    if (date != null) {
      return formatDate(date);
    } else {
      return "Revision " + (getRevision());
    }
  };
  addItem = function(item) {
    item = _.extend({}, {
      id: random.itemId()
    }, item);
    return page.story.push(item);
  };
  getItem = function(id) {
    var item, j, len, ref;
    ref = page.story;
    for (j = 0, len = ref.length; j < len; j++) {
      item = ref[j];
      if (item.id === id) {
        return item;
      }
    }
    return null;
  };
  seqItems = function(each) {
    var emitItem;
    emitItem = function(i) {
      if (i >= page.story.length) {
        return;
      }
      return each(page.story[i] || {
        text: 'null'
      }, function() {
        return emitItem(i + 1);
      });
    };
    return emitItem(0);
  };
  addParagraph = function(text) {
    var type;
    type = "paragraph";
    return addItem({
      type: type,
      text: text
    });
  };
  seqActions = function(each) {
    var emitAction, sections, smaller;
    smaller = 0;
    sections = nowSections((new Date).getTime());
    emitAction = function(i) {
      var action, bigger, j, len, section, separator;
      if (i >= page.journal.length) {
        return;
      }
      action = page.journal[i] || {};
      bigger = action.date || 0;
      separator = null;
      for (j = 0, len = sections.length; j < len; j++) {
        section = sections[j];
        if (section.date > smaller && section.date < bigger) {
          separator = section;
        }
      }
      smaller = bigger;
      return each({
        action: action,
        separator: separator
      }, function() {
        return emitAction(i + 1);
      });
    };
    return emitAction(0);
  };
  become = function(template) {
    return page.story = (template != null ? template.getRawPage().story : void 0) || [];
  };
  siteLineup = function() {
    var path, slug;
    slug = getSlug();
    path = slug === 'welcome-visitors' ? "view/welcome-visitors" : "view/welcome-visitors/view/" + slug;
    if (isRemote()) {
      return "//" + site + "/" + path;
    } else {
      return "/" + path;
    }
  };
  notDuplicate = function(journal, action) {
    var each, j, len;
    for (j = 0, len = journal.length; j < len; j++) {
      each = journal[j];
      if (each.id === action.id && each.date === action.date) {
        return false;
      }
    }
    return true;
  };
  merge = function(update) {
    var action, j, len, merged, ref;
    merged = (function() {
      var j, len, ref, results;
      ref = page.journal;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        action = ref[j];
        results.push(action);
      }
      return results;
    })();
    ref = update.getRawPage().journal;
    for (j = 0, len = ref.length; j < len; j++) {
      action = ref[j];
      if (notDuplicate(page.journal, action)) {
        merged.push(action);
      }
    }
    merged.push({
      type: 'fork',
      site: update.getRemoteSite(),
      date: (new Date()).getTime()
    });
    return newPage(revision.create(999, {
      title: page.title,
      journal: merged
    }), site);
  };
  apply = function(action) {
    revision.apply(page, action);
    if (action.site) {
      return site = null;
    }
  };
  return {
    getRawPage: getRawPage,
    getContext: getContext,
    isPlugin: isPlugin,
    isRemote: isRemote,
    isLocal: isLocal,
    getRemoteSite: getRemoteSite,
    getRemoteSiteDetails: getRemoteSiteDetails,
    getSlug: getSlug,
    getNeighbors: getNeighbors,
    getTitle: getTitle,
    setTitle: setTitle,
    getRevision: getRevision,
    getTimestamp: getTimestamp,
    addItem: addItem,
    getItem: getItem,
    addParagraph: addParagraph,
    seqItems: seqItems,
    seqActions: seqActions,
    become: become,
    siteLineup: siteLineup,
    merge: merge,
    apply: apply
  };
};

module.exports = {
  newPage: newPage,
  asSlug: asSlug,
  pageEmitter: pageEmitter
};



},{"./random":25,"./revision":29,"./util":35,"events":37,"underscore":38}],20:[function(require,module,exports){
var _, addToJournal, deepCopy, lineup, newPage, pageFromLocalStorage, pageHandler, pushToLocal, pushToServer, random, recursiveGet, revision, state;

_ = require('underscore');

state = require('./state');

revision = require('./revision');

addToJournal = require('./addToJournal');

newPage = require('./page').newPage;

random = require('./random');

lineup = require('./lineup');

module.exports = pageHandler = {};

deepCopy = function(object) {
  return JSON.parse(JSON.stringify(object));
};

pageHandler.useLocalStorage = function() {
  return $(".login").length > 0;
};

pageFromLocalStorage = function(slug) {
  var json;
  if (json = localStorage.getItem(slug)) {
    return JSON.parse(json);
  } else {
    return void 0;
  }
};

recursiveGet = function(arg) {
  var localContext, localPage, pageInformation, rev, site, slug, url, whenGotten, whenNotGotten;
  pageInformation = arg.pageInformation, whenGotten = arg.whenGotten, whenNotGotten = arg.whenNotGotten, localContext = arg.localContext;
  slug = pageInformation.slug, rev = pageInformation.rev, site = pageInformation.site;
  if (site) {
    localContext = [];
  } else {
    site = localContext.shift();
  }
  if (site === window.location.host) {
    site = 'origin';
  }
  if (site === 'view') {
    site = null;
  }
  if (site != null) {
    if (site === 'local') {
      if (localPage = pageFromLocalStorage(pageInformation.slug)) {
        return whenGotten(newPage(localPage, 'local'));
      } else {
        return whenNotGotten();
      }
    } else {
      if (site === 'origin') {
        url = "/" + slug + ".json";
      } else {
        url = "http://" + site + "/" + slug + ".json";
      }
    }
  } else {
    url = "/" + slug + ".json";
  }
  return $.ajax({
    type: 'GET',
    dataType: 'json',
    url: url + ("?random=" + (random.randomBytes(4))),
    success: function(page) {
      if (rev) {
        page = revision.create(rev, page);
      }
      return whenGotten(newPage(page, site));
    },
    error: function(xhr, type, msg) {
      var troublePageObject;
      if ((xhr.status !== 404) && (xhr.status !== 0)) {
        console.log('pageHandler.get error', xhr, xhr.status, type, msg);
        troublePageObject = newPage({
          title: "Trouble: Can't Get Page"
        }, null);
        troublePageObject.addParagraph("The page handler has run into problems with this   request.\n<pre class=error>" + (JSON.stringify(pageInformation)) + "</pre>\nThe requested url.\n<pre class=error>" + url + "</pre>\nThe server reported status.\n<pre class=error>" + xhr.status + "</pre>\nThe error type.\n<pre class=error>" + type + "</pre>\nThe error message.\n<pre class=error>" + msg + "</pre>\nThese problems are rarely solved by reporting issues.\nThere could be additional information reported in the browser's console.log.\nMore information might be accessible by fetching the page outside of wiki.\n<a href=\"" + url + "\" target=\"_blank\">try-now</a>");
        return whenGotten(troublePageObject);
      }
      if (localContext.length > 0) {
        return recursiveGet({
          pageInformation: pageInformation,
          whenGotten: whenGotten,
          whenNotGotten: whenNotGotten,
          localContext: localContext
        });
      } else {
        return whenNotGotten();
      }
    }
  });
};

pageHandler.get = function(arg) {
  var localPage, pageInformation, whenGotten, whenNotGotten;
  whenGotten = arg.whenGotten, whenNotGotten = arg.whenNotGotten, pageInformation = arg.pageInformation;
  if (!pageInformation.site) {
    if (localPage = pageFromLocalStorage(pageInformation.slug)) {
      if (pageInformation.rev) {
        localPage = revision.create(pageInformation.rev, localPage);
      }
      return whenGotten(newPage(localPage, 'local'));
    }
  }
  if (!pageHandler.context.length) {
    pageHandler.context = ['view'];
  }
  return recursiveGet({
    pageInformation: pageInformation,
    whenGotten: whenGotten,
    whenNotGotten: whenNotGotten,
    localContext: _.clone(pageHandler.context)
  });
};

pageHandler.context = [];

pushToLocal = function($page, pagePutInfo, action) {
  var page, site;
  if (action.type === 'create') {
    page = {
      title: action.item.title,
      story: [],
      journal: []
    };
  } else {
    page = pageFromLocalStorage(pagePutInfo.slug);
    page || (page = lineup.atKey($page.data('key')).getRawPage());
    if (page.journal == null) {
      page.journal = [];
    }
    if ((site = action['fork']) != null) {
      page.journal = page.journal.concat({
        'type': 'fork',
        'site': site,
        'date': (new Date()).getTime()
      });
      delete action['fork'];
    }
  }
  revision.apply(page, action);
  localStorage.setItem(pagePutInfo.slug, JSON.stringify(page));
  addToJournal($page.find('.journal'), action);
  return $page.addClass("local");
};

pushToServer = function($page, pagePutInfo, action) {
  var bundle, pageObject;
  bundle = deepCopy(action);
  pageObject = lineup.atKey($page.data('key'));
  if (action.type === 'fork') {
    bundle.item = deepCopy(pageObject.getRawPage());
  }
  return $.ajax({
    type: 'PUT',
    url: "/page/" + pagePutInfo.slug + "/action",
    data: {
      'action': JSON.stringify(bundle)
    },
    success: function() {
      if (pageObject != null ? pageObject.apply : void 0) {
        pageObject.apply(action);
      }
      addToJournal($page.find('.journal'), action);
      if (action.type === 'fork') {
        return localStorage.removeItem($page.attr('id'));
      }
    },
    error: function(xhr, type, msg) {
      action.error = {
        type: type,
        msg: msg,
        response: xhr.responseText
      };
      return pushToLocal($page, pagePutInfo, action);
    }
  });
};

pageHandler.put = function($page, action) {
  var checkedSite, forkFrom, pagePutInfo;
  checkedSite = function() {
    var site;
    switch (site = $page.data('site')) {
      case 'origin':
      case 'local':
      case 'view':
        return null;
      case location.host:
        return null;
      default:
        return site;
    }
  };
  pagePutInfo = {
    slug: $page.attr('id').split('_rev')[0],
    rev: $page.attr('id').split('_rev')[1],
    site: checkedSite(),
    local: $page.hasClass('local')
  };
  forkFrom = pagePutInfo.site;
  console.log('pageHandler.put', action, pagePutInfo);
  if (pageHandler.useLocalStorage()) {
    if (pagePutInfo.site != null) {
      console.log('remote => local');
    } else if (!pagePutInfo.local) {
      console.log('origin => local');
      action.site = forkFrom = location.host;
    }
  }
  action.date = (new Date()).getTime();
  if (action.site === 'origin') {
    delete action.site;
  }
  if (forkFrom) {
    $page.find('h1').prop('title', location.host);
    $page.find('h1 img').attr('src', '/favicon.png');
    $page.find('h1 a').attr('href', "/view/welcome-visitors/view/" + pagePutInfo.slug).attr('target', location.host);
    $page.data('site', null);
    $page.removeClass('remote');
    state.setUrl();
    if (action.type !== 'fork') {
      action.fork = forkFrom;
      addToJournal($page.find('.journal'), {
        type: 'fork',
        site: forkFrom,
        date: action.date
      });
    }
  }
  if (pageHandler.useLocalStorage() || pagePutInfo.site === 'local') {
    return pushToLocal($page, pagePutInfo, action);
  } else {
    return pushToServer($page, pagePutInfo, action);
  }
};



},{"./addToJournal":4,"./lineup":14,"./page":19,"./random":25,"./revision":29,"./state":32,"underscore":38}],21:[function(require,module,exports){
var bind, editor, emit, itemz, resolve;

editor = require('./editor');

resolve = require('./resolve');

itemz = require('./itemz');

emit = function($item, item) {
  var i, len, ref, results, text;
  ref = item.text.split(/\n\n+/);
  results = [];
  for (i = 0, len = ref.length; i < len; i++) {
    text = ref[i];
    if (text.match(/\S/)) {
      results.push($item.append("<p>" + (resolve.resolveLinks(text)) + "</p>"));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

bind = function($item, item) {
  return $item.dblclick(function(e) {
    if (e.shiftKey) {
      item.type = 'html';
      return itemz.replaceItem($item, 'paragraph', item);
    } else {
      return editor.textEditor($item, item, {
        'append': true
      });
    }
  });
};

module.exports = {
  emit: emit,
  bind: bind
};



},{"./editor":8,"./itemz":12,"./resolve":28}],22:[function(require,module,exports){
module.exports = function(owner) {
  var failureDlg;
  $("#user-email").hide();
  $("#persona-login-btn").hide();
  $("#persona-logout-btn").hide();
  failureDlg = function(message) {
    return $("<div></div>").dialog({
      open: function(event, ui) {
        return $(".ui-dialog-titlebar-close").hide();
      },
      buttons: {
        "Ok": function() {
          $(this).dialog("close");
          return navigator.id.logout();
        }
      },
      close: function(event, ui) {
        return $(this).remove();
      },
      resizable: false,
      title: "Login Failure",
      modal: true
    }).html(message);
  };
  navigator.id.watch({
    loggedInUser: owner,
    onlogin: function(assertion) {
      return $.post("/persona_login", {
        assertion: assertion
      }, function(verified) {
        var failureMsg;
        verified = JSON.parse(verified);
        if ("okay" === verified.status) {
          return window.location = "/";
        } else if ("wrong-address" === verified.status) {
          return failureDlg("<p>Sign in is currently only available for the site owner.</p>");
        } else if ("failure" === verified.status) {
          if (/domain mismatch/.test(verified.reason)) {
            failureMsg = "<p>It looks as if you are accessing the site using an alternative address.</p>" + "<p>Please check that you are using the correct address to access this site.</p>";
          } else {
            failureMsg = "<p>Unable to log you in.</p>";
          }
          return failureDlg(failureMsg);
        } else {
          return navigator.id.logout();
        }
      });
    },
    onlogout: function() {
      return $.post("/persona_logout", function() {
        return window.location = "/";
      });
    },
    onready: function() {
      if (owner) {
        $("#persona-login-btn").hide();
        return $("#persona-logout-btn").show();
      } else {
        $("#persona-login-btn").show();
        return $("#persona-logout-btn").hide();
      }
    }
  });
  $("#persona-login-btn").click(function(e) {
    e.preventDefault();
    return navigator.id.request({});
  });
  return $("#persona-logout-btn").click(function(e) {
    e.preventDefault();
    return navigator.id.logout();
  });
};



},{}],23:[function(require,module,exports){
var cachedScript, escape, getScript, plugin, scripts,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

module.exports = plugin = {};

escape = function(s) {
  return ('' + s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
};

cachedScript = function(url, options) {
  options = $.extend(options || {}, {
    dataType: "script",
    cache: true,
    url: url
  });
  return $.ajax(options);
};

scripts = [];

getScript = plugin.getScript = function(url, callback) {
  if (callback == null) {
    callback = function() {};
  }
  if (indexOf.call(scripts, url) >= 0) {
    return callback();
  } else {
    return cachedScript(url).done(function() {
      scripts.push(url);
      return callback();
    }).fail(function() {
      return callback();
    });
  }
};

plugin.get = plugin.getPlugin = function(name, callback) {
  if (window.plugins[name]) {
    return callback(window.plugins[name]);
  }
  return getScript("/plugins/" + name + "/" + name + ".js", function() {
    if (window.plugins[name]) {
      return callback(window.plugins[name]);
    }
    return getScript("/plugins/" + name + ".js", function() {
      return callback(window.plugins[name]);
    });
  });
};

plugin["do"] = plugin.doPlugin = function(div, item, done) {
  var error;
  if (done == null) {
    done = function() {};
  }
  error = function(ex, script) {
    div.append("<div class=\"error\">\n  " + (escape(item.text || "")) + "\n  <button>help</button><br>\n</div>");
    return div.find('button').on('click', function() {
      wiki.dialog(ex.toString(), "<p> This \"" + item.type + "\" plugin won't show.</p>\n<li> Is it available on this server?\n<li> Is its markup correct?\n<li> Can it find necessary data?\n<li> Has network access been interrupted?\n<li> Has its code been tested?\n<p> Developers may open debugging tools and retry the plugin.</p>\n<button class=\"retry\">retry</button>\n<p> Learn more\n  <a class=\"external\" target=\"_blank\" rel=\"nofollow\"\n  href=\"http://plugins.fed.wiki.org/about-plugins.html\"\n  title=\"http://plugins.fed.wiki.org/about-plugins.html\">\n    About Plugins\n    <img src=\"/images/external-link-ltr-icon.png\">\n  </a>\n</p>");
      return $('.retry').on('click', function() {
        if (script.emit.length > 2) {
          return script.emit(div, item, function() {
            script.bind(div, item);
            return done();
          });
        } else {
          script.emit(div, item);
          script.bind(div, item);
          return done();
        }
      });
    });
  };
  div.data('pageElement', div.parents(".page"));
  div.data('item', item);
  return plugin.get(item.type, function(script) {
    var err;
    try {
      if (script == null) {
        throw TypeError("Can't find plugin for '" + item.type + "'");
      }
      if (script.emit.length > 2) {
        return script.emit(div, item, function() {
          script.bind(div, item);
          return done();
        });
      } else {
        script.emit(div, item);
        script.bind(div, item);
        return done();
      }
    } catch (_error) {
      err = _error;
      console.log('plugin error', err);
      error(err, script);
      return done();
    }
  });
};

plugin.registerPlugin = function(pluginName, pluginFn) {
  return window.plugins[pluginName] = pluginFn($);
};



},{}],24:[function(require,module,exports){
window.plugins = {
  reference: require('./reference'),
  factory: require('./factory'),
  paragraph: require('./paragraph'),
  image: require('./image'),
  future: require('./future')
};



},{"./factory":9,"./future":10,"./image":11,"./paragraph":21,"./reference":26}],25:[function(require,module,exports){
var itemId, randomByte, randomBytes;

randomByte = function() {
  return (((1 + Math.random()) * 0x100) | 0).toString(16).substring(1);
};

randomBytes = function(n) {
  return ((function() {
    var i, ref, results;
    results = [];
    for (i = 1, ref = n; 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--) {
      results.push(randomByte());
    }
    return results;
  })()).join('');
};

itemId = function() {
  return randomBytes(8);
};

module.exports = {
  randomByte: randomByte,
  randomBytes: randomBytes,
  itemId: itemId
};



},{}],26:[function(require,module,exports){
var bind, editor, emit, page, resolve;

editor = require('./editor');

resolve = require('./resolve');

page = require('./page');

emit = function($item, item) {
  var site, slug;
  slug = item.slug;
  if (item.title != null) {
    slug || (slug = page.asSlug(item.title));
  }
  slug || (slug = 'welcome-visitors');
  site = item.site;
  return resolve.resolveFrom(site, function() {
    return $item.append("<p style='margin-bottom:3px;'>\n  <img class='remote'\n    src='//" + site + "/favicon.png'\n    title='" + site + "'\n    data-site=\"" + site + "\"\n    data-slug=\"" + slug + "\"\n  >\n  " + (resolve.resolveLinks("[[" + (item.title || slug) + "]]")) + "\n</p>\n<div>\n  " + (resolve.resolveLinks(item.text)) + "\n</div>");
  });
};

bind = function($item, item) {
  return $item.dblclick(function() {
    return editor.textEditor($item, item);
  });
};

module.exports = {
  emit: emit,
  bind: bind
};



},{"./editor":8,"./page":19,"./resolve":28}],27:[function(require,module,exports){
var _, actionSymbols, addToJournal, aliasItem, asSlug, buildPage, createFactory, createMissingFlag, cycle, editDate, emitControls, emitFooter, emitHeader, emitTimestamp, emitTwins, getItem, getPageObject, handleDragging, handleHeaderClick, handleMerging, initAddButton, initDragging, initMerging, lineup, neighborhood, newPage, pageEmitter, pageHandler, pageModule, plugin, random, rebuildPage, renderPageIntoPageElement, resolve, state;

_ = require('underscore');

pageHandler = require('./pageHandler');

plugin = require('./plugin');

state = require('./state');

neighborhood = require('./neighborhood');

addToJournal = require('./addToJournal');

actionSymbols = require('./actionSymbols');

lineup = require('./lineup');

resolve = require('./resolve');

random = require('./random');

pageModule = require('./page');

newPage = pageModule.newPage;

asSlug = pageModule.asSlug;

pageEmitter = pageModule.pageEmitter;

getItem = function($item) {
  if ($($item).length > 0) {
    return $($item).data("item") || $($item).data('staticItem');
  }
};

aliasItem = function($page, $item, oldItem) {
  var item, pageObject;
  item = $.extend({}, oldItem);
  pageObject = lineup.atKey($page.data('key'));
  if (pageObject.getItem(item.id) != null) {
    item.alias || (item.alias = item.id);
    item.id = random.itemId();
    $item.attr('data-id', item.id);
  } else if (item.alias != null) {
    if (pageObject.getItem(item.alias) == null) {
      item.id = item.alias;
      delete item.alias;
      $item.attr('data-id', item.id);
    }
  }
  return item;
};

handleDragging = function(evt, ui) {
  var $before, $destinationPage, $item, $sourcePage, $thisPage, action, before, equals, item, moveFromPage, moveToPage, moveWithinPage, order, sourceSite;
  $item = ui.item;
  item = getItem($item);
  $thisPage = $(this).parents('.page:first');
  $sourcePage = $item.data('pageElement');
  sourceSite = $sourcePage.data('site');
  $destinationPage = $item.parents('.page:first');
  equals = function(a, b) {
    return a && b && a.get(0) === b.get(0);
  };
  moveWithinPage = !$sourcePage || equals($sourcePage, $destinationPage);
  moveFromPage = !moveWithinPage && equals($thisPage, $sourcePage);
  moveToPage = !moveWithinPage && equals($thisPage, $destinationPage);
  if (moveFromPage) {
    if ($sourcePage.hasClass('ghost') || $sourcePage.attr('id') === $destinationPage.attr('id') || evt.shiftKey) {
      return;
    }
  }
  action = moveWithinPage ? (order = $(this).children().map(function(_, value) {
    return $(value).attr('data-id');
  }).get(), {
    type: 'move',
    order: order
  }) : moveFromPage ? (console.log('drag from', $sourcePage.find('h1').text()), {
    type: 'remove'
  }) : moveToPage ? ($item.data('pageElement', $thisPage), $before = $item.prev('.item'), before = getItem($before), item = aliasItem($thisPage, $item, item), {
    type: 'add',
    item: item,
    after: before != null ? before.id : void 0
  }) : void 0;
  action.id = item.id;
  return pageHandler.put($thisPage, action);
};

initDragging = function($page) {
  var $story, options;
  options = {
    connectWith: '.page .story',
    placeholder: 'item-placeholder',
    forcePlaceholderSize: true
  };
  $story = $page.find('.story');
  return $story.sortable(options).on('sortupdate', handleDragging);
};

getPageObject = function($journal) {
  var $page;
  $page = $($journal).parents('.page:first');
  return lineup.atKey($page.data('key'));
};

handleMerging = function(event, ui) {
  var drag, drop;
  drag = getPageObject(ui.draggable);
  drop = getPageObject(event.target);
  return pageEmitter.emit('show', drop.merge(drag));
};

initMerging = function($page) {
  var $journal;
  $journal = $page.find('.journal');
  $journal.draggable({
    revert: true,
    appendTo: '.main',
    scroll: false,
    helper: 'clone'
  });
  return $journal.droppable({
    hoverClass: "ui-state-hover",
    drop: handleMerging
  });
};

initAddButton = function($page) {
  return $page.find(".add-factory").live("click", function(evt) {
    if ($page.hasClass('ghost')) {
      return;
    }
    evt.preventDefault();
    return createFactory($page);
  });
};

createFactory = function($page) {
  var $before, $item, before, item;
  item = {
    type: "factory",
    id: random.itemId()
  };
  $item = $("<div />", {
    "class": "item factory"
  }).data('item', item).attr('data-id', item.id);
  $item.data('pageElement', $page);
  $page.find(".story").append($item);
  plugin["do"]($item, item);
  $before = $item.prev('.item');
  before = getItem($before);
  return pageHandler.put($page, {
    item: item,
    id: item.id,
    type: "add",
    after: before != null ? before.id : void 0
  });
};

handleHeaderClick = function(e) {
  var $page, crumbs, each, newWindow, target;
  e.preventDefault();
  lineup.debugSelfCheck((function() {
    var j, len, ref, results;
    ref = $('.page');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      each = ref[j];
      results.push($(each).data('key'));
    }
    return results;
  })());
  $page = $(e.target).parents('.page:first');
  crumbs = lineup.crumbs($page.data('key'), location.host);
  target = crumbs[0];
  newWindow = window.open("//" + (crumbs.join('/')), target);
  return newWindow.focus();
};

emitHeader = function($header, $page, pageObject) {
  var remote, tooltip;
  remote = pageObject.getRemoteSite(location.host);
  tooltip = pageObject.getRemoteSiteDetails(location.host);
  $header.append("<h1 title=\"" + tooltip + "\">\n  <a href=\"" + (pageObject.siteLineup()) + "\" target=\"" + remote + "\">\n    <img src=\"//" + remote + "/favicon.png\" height=\"32px\" class=\"favicon\">\n  </a> " + (resolve.escape(pageObject.getTitle())) + "\n</h1>");
  return $header.find('a').on('click', handleHeaderClick);
};

emitTimestamp = function($header, $page, pageObject) {
  if ($page.attr('id').match(/_rev/)) {
    $page.addClass('ghost');
    $page.data('rev', pageObject.getRevision());
    return $header.append($("<h2 class=\"revision\">\n  <span>\n    " + (pageObject.getTimestamp()) + "\n  </span>\n</h2>"));
  }
};

emitControls = function($journal) {
  return $journal.append("<div class=\"control-buttons\">\n  <a href=\"#\" class=\"button fork-page\" title=\"fork this page\">" + actionSymbols.fork + "</a>\n  <a href=\"#\" class=\"button add-factory\" title=\"add paragraph\">" + actionSymbols.add + "</a>\n</div>");
};

emitFooter = function($footer, pageObject) {
  var host, slug;
  host = pageObject.getRemoteSite(location.host);
  slug = pageObject.getSlug();
  return $footer.append("<a id=\"license\" href=\"http://creativecommons.org/licenses/by-sa/4.0/\">CC BY-SA 4.0</a> .\n<a class=\"show-page-source\" href=\"/" + slug + ".json?random=" + (random.randomBytes(4)) + "\" title=\"source\">JSON</a> .\n<a href= \"//" + host + "/" + slug + ".html\" target=\"" + host + "\">" + host + " </a>");
};

editDate = function(journal) {
  var action, j, ref;
  ref = journal || [];
  for (j = ref.length - 1; j >= 0; j += -1) {
    action = ref[j];
    if (action.date && action.type !== 'fork') {
      return action.date;
    }
  }
  return void 0;
};

emitTwins = function($page) {
  var bin, bins, flags, i, info, item, j, legend, len, page, ref, ref1, remoteSite, site, slug, twins, viewing;
  page = $page.data('data');
  if (!page) {
    return;
  }
  site = $page.data('site') || window.location.host;
  if (site === 'view' || site === 'origin') {
    site = window.location.host;
  }
  slug = asSlug(page.title);
  if (viewing = editDate(page.journal)) {
    bins = {
      newer: [],
      same: [],
      older: []
    };
    ref = neighborhood.sites;
    for (remoteSite in ref) {
      info = ref[remoteSite];
      if (remoteSite !== site && (info.sitemap != null)) {
        ref1 = info.sitemap;
        for (j = 0, len = ref1.length; j < len; j++) {
          item = ref1[j];
          if (item.slug === slug) {
            bin = item.date > viewing ? bins.newer : item.date < viewing ? bins.older : bins.same;
            bin.push({
              remoteSite: remoteSite,
              item: item
            });
          }
        }
      }
    }
    twins = [];
    for (legend in bins) {
      bin = bins[legend];
      if (!bin.length) {
        continue;
      }
      bin.sort(function(a, b) {
        return a.item.date < b.item.date;
      });
      flags = (function() {
        var k, len1, ref2, results;
        results = [];
        for (i = k = 0, len1 = bin.length; k < len1; i = ++k) {
          ref2 = bin[i], remoteSite = ref2.remoteSite, item = ref2.item;
          if (i >= 8) {
            break;
          }
          results.push("<img class=\"remote\"\nsrc=\"http://" + remoteSite + "/favicon.png\"\ndata-slug=\"" + slug + "\"\ndata-site=\"" + remoteSite + "\"\ntitle=\"" + remoteSite + "\">");
        }
        return results;
      })();
      twins.push((flags.join('&nbsp;')) + " " + legend);
    }
    if (twins) {
      return $page.find('.twins').html("<p>" + (twins.join(", ")) + "</p>");
    }
  }
};

renderPageIntoPageElement = function(pageObject, $page) {
  var $footer, $header, $journal, $story, $twins, each, ref;
  $page.data("data", pageObject.getRawPage());
  if (pageObject.isRemote()) {
    $page.data("site", pageObject.getRemoteSite());
  }
  console.log('.page keys ', (function() {
    var j, len, ref, results;
    ref = $('.page');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      each = ref[j];
      results.push($(each).data('key'));
    }
    return results;
  })());
  console.log('lineup keys', lineup.debugKeys());
  resolve.resolutionContext = pageObject.getContext();
  $page.empty();
  ref = ['twins', 'header', 'story', 'journal', 'footer'].map(function(className) {
    return $("<div />").addClass(className).appendTo($page);
  }), $twins = ref[0], $header = ref[1], $story = ref[2], $journal = ref[3], $footer = ref[4];
  emitHeader($header, $page, pageObject);
  emitTimestamp($header, $page, pageObject);
  pageObject.seqItems(function(item, done) {
    var $item;
    $item = $("<div class=\"item " + item.type + "\" data-id=\"" + item.id + "\">");
    $story.append($item);
    return plugin["do"]($item, item, done);
  });
  pageObject.seqActions(function(each, done) {
    if (each.separator) {
      addToJournal($journal, each.separator);
    }
    addToJournal($journal, each.action);
    return done();
  });
  emitTwins($page);
  emitControls($journal);
  return emitFooter($footer, pageObject);
};

createMissingFlag = function($page, pageObject) {
  if (!pageObject.isRemote()) {
    return $('img.favicon', $page).error(function() {
      return plugin.get('favicon', function(favicon) {
        return favicon.create();
      });
    });
  }
};

rebuildPage = function(pageObject, $page) {
  if (pageObject.isLocal()) {
    $page.addClass('local');
  }
  if (pageObject.isRemote()) {
    $page.addClass('remote');
  }
  if (pageObject.isPlugin()) {
    $page.addClass('plugin');
  }
  renderPageIntoPageElement(pageObject, $page);
  createMissingFlag($page, pageObject);
  state.setUrl();
  initDragging($page);
  initMerging($page);
  initAddButton($page);
  return $page;
};

buildPage = function(pageObject, $page) {
  $page.data('key', lineup.addPage(pageObject));
  return rebuildPage(pageObject, $page);
};

cycle = function() {
  var $page, createGhostPage, pageInformation, ref, rev, slug, whenGotten;
  $page = $(this);
  ref = $page.attr('id').split('_rev'), slug = ref[0], rev = ref[1];
  pageInformation = {
    slug: slug,
    rev: rev,
    site: $page.data('site')
  };
  createGhostPage = function() {
    var hit, hits, info, j, len, pageObject, ref1, result, site, title;
    title = $("a[href=\"/" + slug + ".html\"]:last").text() || slug;
    pageObject = newPage();
    pageObject.setTitle(title);
    hits = [];
    ref1 = neighborhood.sites;
    for (site in ref1) {
      info = ref1[site];
      if (info.sitemap != null) {
        result = _.find(info.sitemap, function(each) {
          return each.slug === slug;
        });
        if (result != null) {
          hits.push({
            "type": "reference",
            "site": site,
            "slug": slug,
            "title": result.title || slug,
            "text": result.synopsis || ''
          });
        }
      }
    }
    if (hits.length > 0) {
      pageObject.addItem({
        'type': 'future',
        'text': 'We could not find this page in the expected context.',
        'title': title
      });
      pageObject.addItem({
        'type': 'paragraph',
        'text': "We did find the page in your current neighborhood."
      });
      for (j = 0, len = hits.length; j < len; j++) {
        hit = hits[j];
        pageObject.addItem(hit);
      }
    } else {
      pageObject.addItem({
        'type': 'future',
        'text': 'We could not find this page.',
        'title': title
      });
    }
    return buildPage(pageObject, $page).addClass('ghost');
  };
  whenGotten = function(pageObject) {
    var j, len, ref1, results, site;
    buildPage(pageObject, $page);
    ref1 = pageObject.getNeighbors(location.host);
    results = [];
    for (j = 0, len = ref1.length; j < len; j++) {
      site = ref1[j];
      results.push(neighborhood.registerNeighbor(site));
    }
    return results;
  };
  return pageHandler.get({
    whenGotten: whenGotten,
    whenNotGotten: createGhostPage,
    pageInformation: pageInformation
  });
};

module.exports = {
  cycle: cycle,
  emitTwins: emitTwins,
  buildPage: buildPage,
  rebuildPage: rebuildPage
};



},{"./actionSymbols":2,"./addToJournal":4,"./lineup":14,"./neighborhood":17,"./page":19,"./pageHandler":20,"./plugin":23,"./random":25,"./resolve":28,"./state":32,"underscore":38}],28:[function(require,module,exports){
var asSlug, escape, resolve;

asSlug = require('./page').asSlug;

module.exports = resolve = {};

resolve.resolutionContext = [];

resolve.escape = escape = function(string) {
  return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

resolve.resolveFrom = function(addition, callback) {
  resolve.resolutionContext.push(addition);
  try {
    return callback();
  } finally {
    resolve.resolutionContext.pop();
  }
};

resolve.resolveLinks = function(string, sanitize) {
  var external, internal, stash, stashed, unstash;
  if (sanitize == null) {
    sanitize = escape;
  }
  stashed = [];
  stash = function(text) {
    var here;
    here = stashed.length;
    stashed.push(text);
    return "〖" + here + "〗";
  };
  unstash = function(match, digits) {
    return stashed[+digits];
  };
  internal = function(match, name) {
    var slug;
    slug = asSlug(name);
    return stash("<a class=\"internal\" href=\"/" + slug + ".html\" data-page-name=\"" + slug + "\" title=\"" + (resolve.resolutionContext.join(' => ')) + "\">" + (escape(name)) + "</a>");
  };
  external = function(match, href, protocol, rest) {
    return stash("<a class=\"external\" target=\"_blank\" href=\"" + href + "\" title=\"" + href + "\" rel=\"nofollow\">" + (escape(rest)) + " <img src=\"/images/external-link-ltr-icon.png\"></a>");
  };
  string = string.replace(/〖(\d+)〗/g, "〖 $1 〗").replace(/\[\[([^\]]+)\]\]/gi, internal).replace(/\[((http|https|ftp):.*?) (.*?)\]/gi, external);
  return sanitize(string).replace(/〖(\d+)〗/g, unstash);
};



},{"./page":19}],29:[function(require,module,exports){
var apply, create;

apply = function(page, action) {
  var add, after, index, item, order, remove;
  order = function() {
    var i, item, len, ref, results;
    ref = page.story || [];
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      results.push(item != null ? item.id : void 0);
    }
    return results;
  };
  add = function(after, item) {
    var index;
    index = order().indexOf(after) + 1;
    return page.story.splice(index, 0, item);
  };
  remove = function() {
    var index;
    if ((index = order().indexOf(action.id)) !== -1) {
      return page.story.splice(index, 1);
    }
  };
  page.story || (page.story = []);
  switch (action.type) {
    case 'create':
      if (action.item != null) {
        if (action.item.title != null) {
          page.title = action.item.title;
        }
        if (action.item.story != null) {
          page.story = action.item.story.slice();
        }
      }
      break;
    case 'add':
      add(action.after, action.item);
      break;
    case 'edit':
      if ((index = order().indexOf(action.id)) !== -1) {
        page.story.splice(index, 1, action.item);
      } else {
        page.story.push(action.item);
      }
      break;
    case 'move':
      index = action.order.indexOf(action.id);
      after = action.order[index - 1];
      item = page.story[order().indexOf(action.id)];
      remove();
      add(after, item);
      break;
    case 'remove':
      remove();
  }
  page.journal || (page.journal = []);
  return page.journal.push(action);
};

create = function(revIndex, data) {
  var action, i, len, revJournal, revPage;
  revIndex = +revIndex;
  revJournal = data.journal.slice(0, +revIndex + 1 || 9e9);
  revPage = {
    title: data.title,
    story: []
  };
  for (i = 0, len = revJournal.length; i < len; i++) {
    action = revJournal[i];
    apply(revPage, action || {});
  }
  return revPage;
};

module.exports = {
  create: create,
  apply: apply
};



},{}],30:[function(require,module,exports){
var active, createSearch, link, newPage;

link = require('./link');

active = require('./active');

newPage = require('./page').newPage;

createSearch = function(arg) {
  var neighborhood, performSearch;
  neighborhood = arg.neighborhood;
  performSearch = function(searchQuery) {
    var i, len, ref, result, resultPage, searchResults, tally;
    searchResults = neighborhood.search(searchQuery);
    tally = searchResults.tally;
    resultPage = newPage();
    resultPage.setTitle("Search for '" + searchQuery + "'");
    resultPage.addParagraph("String '" + searchQuery + "' found on " + (tally.finds || 'none') + " of " + (tally.pages || 'no') + " pages from " + (tally.sites || 'no') + " sites.\nText matched on " + (tally.title || 'no') + " titles, " + (tally.text || 'no') + " paragraphs, and " + (tally.slug || 'no') + " slugs.\nElapsed time " + tally.msec + " milliseconds.");
    ref = searchResults.finds;
    for (i = 0, len = ref.length; i < len; i++) {
      result = ref[i];
      resultPage.addItem({
        "type": "reference",
        "site": result.site,
        "slug": result.page.slug,
        "title": result.page.title,
        "text": result.page.synopsis || ''
      });
    }
    return link.showResult(resultPage);
  };
  return {
    performSearch: performSearch
  };
};

module.exports = createSearch;



},{"./active":3,"./link":16,"./page":19}],31:[function(require,module,exports){
var bind, createSearch, inject, search;

createSearch = require('./search');

search = null;

inject = function(neighborhood) {
  return search = createSearch({
    neighborhood: neighborhood
  });
};

bind = function() {
  return $('input.search').on('keypress', function(e) {
    var searchQuery;
    if (e.keyCode !== 13) {
      return;
    }
    searchQuery = $(this).val();
    search.performSearch(searchQuery);
    return $(this).val("");
  });
};

module.exports = {
  inject: inject,
  bind: bind
};



},{"./search":30}],32:[function(require,module,exports){
var active, lineup, link, state,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

active = require('./active');

lineup = require('./lineup');

link = null;

module.exports = state = {};

state.inject = function(link_) {
  return link = link_;
};

state.pagesInDom = function() {
  return $.makeArray($(".page").map(function(_, el) {
    return el.id;
  }));
};

state.urlPages = function() {
  var i;
  return ((function() {
    var k, len, ref, results;
    ref = $(location).attr('pathname').split('/');
    results = [];
    for (k = 0, len = ref.length; k < len; k += 2) {
      i = ref[k];
      results.push(i);
    }
    return results;
  })()).slice(1);
};

state.locsInDom = function() {
  return $.makeArray($(".page").map(function(_, el) {
    return $(el).data('site') || 'view';
  }));
};

state.urlLocs = function() {
  var j, k, len, ref, results;
  ref = $(location).attr('pathname').split('/').slice(1);
  results = [];
  for (k = 0, len = ref.length; k < len; k += 2) {
    j = ref[k];
    results.push(j);
  }
  return results;
};

state.setUrl = function() {
  var idx, locs, page, pages, url;
  document.title = lineup.bestTitle();
  if (history && history.pushState) {
    locs = state.locsInDom();
    pages = state.pagesInDom();
    url = ((function() {
      var k, len, results;
      results = [];
      for (idx = k = 0, len = pages.length; k < len; idx = ++k) {
        page = pages[idx];
        results.push("/" + ((locs != null ? locs[idx] : void 0) || 'view') + "/" + page);
      }
      return results;
    })()).join('');
    if (url !== $(location).attr('pathname')) {
      return history.pushState(null, null, url);
    }
  }
};

state.show = function(e) {
  var each, idx, k, l, len, len1, matching, name, newLocs, newPages, old, oldLocs, oldPages;
  oldPages = state.pagesInDom();
  newPages = state.urlPages();
  oldLocs = state.locsInDom();
  newLocs = state.urlLocs();
  if (!location.pathname || location.pathname === '/') {
    return;
  }
  matching = true;
  for (idx = k = 0, len = oldPages.length; k < len; idx = ++k) {
    name = oldPages[idx];
    if (matching && (matching = name === newPages[idx])) {
      continue;
    }
    old = $('.page:last');
    lineup.removeKey(old.data('key'));
    old.remove();
  }
  matching = true;
  for (idx = l = 0, len1 = newPages.length; l < len1; idx = ++l) {
    name = newPages[idx];
    if (matching && (matching = name === oldPages[idx])) {
      continue;
    }
    console.log('push', idx, name);
    link.showPage(name, newLocs[idx]);
  }
  console.log('a .page keys ', (function() {
    var len2, m, ref, results;
    ref = $('.page');
    results = [];
    for (m = 0, len2 = ref.length; m < len2; m++) {
      each = ref[m];
      results.push($(each).data('key'));
    }
    return results;
  })());
  console.log('a lineup keys', lineup.debugKeys());
  active.set($('.page').last());
  return document.title = lineup.bestTitle();
};

state.first = function() {
  var firstUrlLocs, firstUrlPages, idx, k, len, oldPages, results, urlPage;
  state.setUrl();
  firstUrlPages = state.urlPages();
  firstUrlLocs = state.urlLocs();
  oldPages = state.pagesInDom();
  results = [];
  for (idx = k = 0, len = firstUrlPages.length; k < len; idx = ++k) {
    urlPage = firstUrlPages[idx];
    if (indexOf.call(oldPages, urlPage) < 0) {
      if (urlPage !== '') {
        results.push(link.createPage(urlPage, firstUrlLocs[idx]));
      } else {
        results.push(void 0);
      }
    }
  }
  return results;
};



},{"./active":3,"./lineup":14}],33:[function(require,module,exports){
module.exports = function(page) {
  var p1, p2, synopsis;
  synopsis = page.synopsis;
  if ((page != null) && (page.story != null)) {
    p1 = page.story[0];
    p2 = page.story[1];
    if (p1 && p1.type === 'paragraph') {
      synopsis || (synopsis = p1.text);
    }
    if (p2 && p2.type === 'paragraph') {
      synopsis || (synopsis = p2.text);
    }
    if (p1 && (p1.text != null)) {
      synopsis || (synopsis = p1.text);
    }
    if (p2 && (p2.text != null)) {
      synopsis || (synopsis = p2.text);
    }
    synopsis || (synopsis = (page.story != null) && ("A page with " + page.story.length + " items."));
  } else {
    synopsis = 'A page with no story.';
  }
  return synopsis;
};



},{}],34:[function(require,module,exports){
var action, alignItem, bind, enterAction, enterItem, item, leaveAction, leaveItem, startTargeting, stopTargeting, targeting;

targeting = false;

item = null;

action = null;

bind = function() {
  $(document).keydown(function(e) {
    if (e.keyCode === 16) {
      return startTargeting(e);
    }
  }).keyup(function(e) {
    if (e.keyCode === 16) {
      return stopTargeting(e);
    }
  });
  return $('.main').delegate('.item', 'mouseenter', enterItem).delegate('.item', 'mouseleave', leaveItem).delegate('.action', 'mouseenter', enterAction).delegate('.action', 'mouseleave', leaveAction).delegate('.page', 'align-item', alignItem);
};

startTargeting = function(e) {
  var id;
  targeting = e.shiftKey;
  if (targeting) {
    if (id = item || action) {
      return $("[data-id=" + id + "]").addClass('target');
    }
  }
};

stopTargeting = function(e) {
  targeting = e.shiftKey;
  if (!targeting) {
    return $('.item, .action').removeClass('target');
  }
};

enterItem = function(e) {
  var $item, $page, key, place;
  item = ($item = $(this)).attr('data-id');
  if (targeting) {
    $("[data-id=" + item + "]").addClass('target');
    key = ($page = $(this).parents('.page:first')).data('key');
    place = $item.offset().top;
    return $('.page').trigger('align-item', {
      key: key,
      id: item,
      place: place
    });
  }
};

leaveItem = function(e) {
  if (targeting) {
    $('.item, .action').removeClass('target');
  }
  return item = null;
};

enterAction = function(e) {
  var key;
  action = $(this).data('id');
  if (targeting) {
    $("[data-id=" + action + "]").addClass('target');
    key = $(this).parents('.page:first').data('key');
    return $('.page').trigger('align-item', {
      key: key,
      id: action
    });
  }
};

leaveAction = function(e) {
  if (targeting) {
    $("[data-id=" + action + "]").removeClass('target');
  }
  return action = null;
};

alignItem = function(e, align) {
  var $item, $page, offset, place;
  $page = $(this);
  if ($page.data('key') === align.key) {
    return;
  }
  $item = $page.find(".item[data-id=" + align.id + "]");
  if (!$item.length) {
    return;
  }
  place = align.place || $page.height() / 2;
  offset = $item.offset().top + $page.scrollTop() - place;
  return $page.stop().animate({
    scrollTop: offset
  }, 'slow');
};

module.exports = {
  bind: bind
};



},{}],35:[function(require,module,exports){
var util;

module.exports = util = {};

util.formatTime = function(time) {
  var am, d, h, mi, mo;
  d = new Date((time > 10000000000 ? time : time * 1000));
  mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  h = d.getHours();
  am = h < 12 ? 'AM' : 'PM';
  h = h === 0 ? 12 : h > 12 ? h - 12 : h;
  mi = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
  return h + ":" + mi + " " + am + "<br>" + (d.getDate()) + " " + mo + " " + (d.getFullYear());
};

util.formatDate = function(msSinceEpoch) {
  var am, d, day, h, mi, mo, sec, wk, yr;
  d = new Date(msSinceEpoch);
  wk = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  day = d.getDate();
  yr = d.getFullYear();
  h = d.getHours();
  am = h < 12 ? 'AM' : 'PM';
  h = h === 0 ? 12 : h > 12 ? h - 12 : h;
  mi = (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
  sec = (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
  return wk + " " + mo + " " + day + ", " + yr + "<br>" + h + ":" + mi + ":" + sec + " " + am;
};

util.formatElapsedTime = function(msSinceEpoch) {
  var days, hrs, mins, months, msecs, secs, weeks, years;
  msecs = new Date().getTime() - msSinceEpoch;
  if ((secs = msecs / 1000) < 2) {
    return (Math.floor(msecs)) + " milliseconds ago";
  }
  if ((mins = secs / 60) < 2) {
    return (Math.floor(secs)) + " seconds ago";
  }
  if ((hrs = mins / 60) < 2) {
    return (Math.floor(mins)) + " minutes ago";
  }
  if ((days = hrs / 24) < 2) {
    return (Math.floor(hrs)) + " hours ago";
  }
  if ((weeks = days / 7) < 2) {
    return (Math.floor(days)) + " days ago";
  }
  if ((months = days / 31) < 2) {
    return (Math.floor(weeks)) + " weeks ago";
  }
  if ((years = days / 365) < 2) {
    return (Math.floor(months)) + " months ago";
  }
  return (Math.floor(years)) + " years ago";
};



},{}],36:[function(require,module,exports){
var dialog, editor, itemz, link, pageHandler, plugin, resolve, wiki,
  slice = [].slice;

wiki = {};

wiki.asSlug = require('./page').asSlug;

itemz = require('./itemz');

wiki.removeItem = itemz.removeItem;

wiki.createItem = itemz.createItem;

wiki.getItem = itemz.getItem;

dialog = require('./dialog');

wiki.dialog = dialog.open;

link = require('./link');

wiki.createPage = link.createPage;

wiki.doInternalLink = link.doInternalLink;

plugin = require('./plugin');

wiki.getScript = plugin.getScript;

wiki.getPlugin = plugin.getPlugin;

wiki.doPlugin = plugin.doPlugin;

wiki.registerPlugin = plugin.registerPlugin;

wiki.getData = function(vis) {
  var idx, who;
  if (vis) {
    idx = $('.item').index(vis);
    who = $(".item:lt(" + idx + ")").filter('.chart,.data,.calculator').last();
    if (who != null) {
      return who.data('item').data;
    } else {
      return {};
    }
  } else {
    who = $('.chart,.data,.calculator').last();
    if (who != null) {
      return who.data('item').data;
    } else {
      return {};
    }
  }
};

wiki.getDataNodes = function(vis) {
  var idx, who;
  if (vis) {
    idx = $('.item').index(vis);
    who = $(".item:lt(" + idx + ")").filter('.chart,.data,.calculator').toArray().reverse();
    return $(who);
  } else {
    who = $('.chart,.data,.calculator').toArray().reverse();
    return $(who);
  }
};

wiki.log = function() {
  var things;
  things = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  if ((typeof console !== "undefined" && console !== null ? console.log : void 0) != null) {
    return console.log.apply(console, things);
  }
};

wiki.neighborhood = require('./neighborhood').sites;

wiki.neighborhoodObject = require('./neighborhood');

pageHandler = require('./pageHandler');

wiki.pageHandler = pageHandler;

wiki.useLocalStorage = pageHandler.useLocalStorage;

resolve = require('./resolve');

wiki.resolveFrom = resolve.resolveFrom;

wiki.resolveLinks = resolve.resolveLinks;

wiki.resolutionContext = resolve.resolutionContext;

editor = require('./editor');

wiki.textEditor = editor.textEditor;

wiki.util = require('./util');

wiki.persona = require('./persona');

wiki.createSynopsis = require('./synopsis');

module.exports = wiki;



},{"./dialog":6,"./editor":8,"./itemz":12,"./link":16,"./neighborhood":17,"./page":19,"./pageHandler":20,"./persona":22,"./plugin":23,"./resolve":28,"./synopsis":33,"./util":35}],37:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],38:[function(require,module,exports){
//     Underscore.js 1.8.2
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.2';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var isArrayLike = function(collection) {
    var length = collection && collection.length;
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, target, fromIndex) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    return _.indexOf(obj, target, typeof fromIndex == 'number' && fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (array == null) return [];
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, 'length').length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = list && list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    var i = 0, length = array && array.length;
    if (typeof isSorted == 'number') {
      i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
    } else if (isSorted && length) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (item !== item) {
      return _.findIndex(slice.call(array, i), _.isNaN);
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    var idx = array ? array.length : 0;
    if (typeof from == 'number') {
      idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
    }
    if (item !== item) {
      return _.findLastIndex(slice.call(array, 0, idx), _.isNaN);
    }
    while (--idx >= 0) if (array[idx] === item) return idx;
    return -1;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = array != null && array.length;
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createIndexFinder(1);

  _.findLastIndex = createIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    
    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of 
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;
  
  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}]},{},[1]);
