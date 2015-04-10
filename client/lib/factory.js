// Generated by CoffeeScript 1.9.1
var arrayToJson, bind, csvToArray, drop, editor, emit, escape, neighborhood, pageHandler, plugin, resolve, synopsis;

neighborhood = require('./neighborhood');

plugin = require('./plugin');

resolve = require('./resolve');

pageHandler = require('./pageHandler');

editor = require('./editor');

synopsis = require('./synopsis');

drop = require('./drop');

escape = function (line) {
    return line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
};

emit = function ($item, item) {
    var showMenu, showPrompt;
    $item.append('<p>Double-Click to Edit<br>Drop Text or Image to Insert</p>');
    showMenu = function () {
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
        return menu.find('a.menu').click(function (evt) {
            $item.removeClass('factory').addClass(item.type = evt.target.text.toLowerCase());
            $item.unbind();
            return editor.textEditor($item, item);
        });
    };
    showPrompt = function () {
        return $item.append("<p>" + (resolve.resolveLinks(item.prompt, escape)) + "</b>");
    };
    if (item.prompt) {
        return showPrompt();
    } else if (window.catalog != null) {
        return showMenu();
    } else {
        return $.getJSON('/system/factories.json', function (data) {
            window.catalog = data;
            return showMenu();
        });
    }
};

bind = function ($item, item) {
    var addReference, addVideo, punt, readFile, syncEditAction;
    syncEditAction = function () {
        var $page, err;
        $item.empty().unbind();
        $item.removeClass("factory").addClass(item.type);
        $page = $item.parents('.page:first');
        try {
            $item.data('pageElement', $page);
            $item.data('item', item);
            plugin.getPlugin(item.type, function (plugin) {
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
    punt = function (data) {
        item.prompt = "Unexpected Item\nWe can't make sense of the drop.\nTry something else or see [[About Factory Plugin]].";
        data.userAgent = navigator.userAgent;
        item.punt = data;
        return syncEditAction();
    };
    addReference = function (data) {
        return $.getJSON("http://" + data.site + "/" + data.slug + ".json", function (remote) {
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
    addVideo = function (video) {
        item.type = 'video';
        item.text = video.text + "\n(double-click to edit caption)\n";
        return syncEditAction();
    };
    readFile = function (file) {
        var majorType, minorType, reader, ref;
        if (file != null) {
            ref = file.type.split("/"), majorType = ref[0], minorType = ref[1];
            reader = new FileReader();
            if (majorType === "image") {
                reader.onload = function (loadEvent) {
                    item.type = 'image';
                    item.url = loadEvent.target.result;
                    item.caption || (item.caption = "Uploaded image");
                    return syncEditAction();
                };
                return reader.readAsDataURL(file);
            } else if (majorType === "text") {
                reader.onload = function (loadEvent) {
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
    $item.dblclick(function (e) {
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
    $item.bind('dragenter', function (evt) {
        return evt.preventDefault();
    });
    $item.bind('dragover', function (evt) {
        return evt.preventDefault();
    });
    return $item.bind("drop", drop.dispatch({
        page: addReference,
        file: readFile,
        video: addVideo,
        punt: punt
    }));
};

csvToArray = function (strData, strDelimiter) {
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

arrayToJson = function (array) {
    var cols, i, len, results, row, rowToObject;
    cols = array.shift();
    rowToObject = function (row) {
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
