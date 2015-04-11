(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
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
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
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
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
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
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

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

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
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
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
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
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
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
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

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
}).call(this);

},{}],2:[function(require,module,exports){
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
},{"./lib/bind":6,"./lib/legacy":14,"./lib/plugins":25,"./lib/synopsis":34,"./lib/wiki":37}],3:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{}],4:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var active, findScrollContainer, scrollTo;

module.exports = active = {};

active.scrollContainer = void 0;

findScrollContainer = function () {
    var scrolled;
    scrolled = $("body, html").filter(function () {
        return $(this).scrollLeft() > 0;
    });
    if (scrolled.length > 0) {
        return scrolled;
    } else {
        return $("body, html").scrollLeft(12).filter(function () {
            return $(this).scrollLeft() > 0;
        }).scrollTop(0);
    }
};

scrollTo = function ($page) {
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

active.set = function ($page) {
    $page = $($page);
    $(".active").removeClass("active");
    return scrollTo($page.addClass("active"));
};

},{}],5:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./actionSymbols":3,"./util":36}],6:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./link":17,"./neighborhood":18,"./neighbors":19,"./searchbox":32,"./state":33}],7:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./resolve":29}],8:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{}],9:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var escape, getSelectionPos, itemz, link, pageHandler, plugin, random, setCaretPosition, spawnEditor, textEditor;

plugin = require('./plugin');

itemz = require('./itemz');

pageHandler = require('./pageHandler');

link = require('./link');

random = require('./random');

escape = function (string) {
    return string.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

textEditor = function ($item, item, option) {
    var $textarea, focusoutHandler, keydownHandler, original, ref, ref1;
    if (option == null) {
        option = {};
    }
    console.log('textEditor', item.id, option);
    keydownHandler = function (e) {
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
    focusoutHandler = function () {
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

spawnEditor = function ($page, $before, text) {
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

getSelectionPos = function ($textarea) {
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

setCaretPosition = function ($textarea, caretPos) {
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

},{"./itemz":13,"./link":17,"./pageHandler":21,"./plugin":24,"./random":26}],10:[function(require,module,exports){
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

},{"./drop":8,"./editor":9,"./neighborhood":18,"./pageHandler":21,"./plugin":24,"./resolve":29,"./synopsis":34}],11:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./neighborhood":18,"./resolve":29}],12:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./dialog":7,"./editor":9,"./resolve":29}],13:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./pageHandler":21,"./plugin":24,"./random":26}],14:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./active":4,"./dialog":7,"./drop":8,"./lineup":15,"./lineupActivity":16,"./link":17,"./page":20,"./pageHandler":21,"./refresh":28,"./state":33,"./target":35}],15:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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
  if (slug !== 'index') {
    result.unshift('view', 'index');
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

},{"./random":26}],16:[function(require,module,exports){
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

},{"./lineup":15}],17:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./active":4,"./lineup":15,"./page":20,"./refresh":28}],18:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"underscore":1}],19:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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
    return link.doInternalLink('index', null, this.title.split("\n")[0]);
  });
};

module.exports = {
  inject: inject,
  bind: bind
};

},{"./link":17}],20:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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
    path = slug === 'index' ? "view/index" : "view/index/view/" + slug;
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

},{"./random":26,"./revision":30,"./util":36,"events":38,"underscore":1}],21:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var _, addToJournal, deepCopy, lineup, newPage, pageFromLocalStorage, pageHandler, pushToLocal, pushToServer, random, recursiveGet, revision, state;

_ = require('underscore');

state = require('./state');

revision = require('./revision');

addToJournal = require('./addToJournal');

newPage = require('./page').newPage;

random = require('./random');

lineup = require('./lineup');

module.exports = pageHandler = {};

deepCopy = function (object) {
    return JSON.parse(JSON.stringify(object));
};

pageHandler.useLocalStorage = function () {
    return $(".login").length > 0;
};

pageFromLocalStorage = function (slug) {
    var json;
    if (json = localStorage.getItem(slug)) {
        return JSON.parse(json);
    } else {
        return void 0;
    }
};

recursiveGet = function (arg) {
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
        success: function (page) {
            if (rev) {
                page = revision.create(rev, page);
            }
            return whenGotten(newPage(page, site));
        },
        error: function (xhr, type, msg) {
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

pageHandler.get = function (arg) {
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

pushToLocal = function ($page, pagePutInfo, action) {
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

pushToServer = function ($page, pagePutInfo, action) {
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
        success: function () {
            if (pageObject != null ? pageObject.apply : void 0) {
                pageObject.apply(action);
            }
            addToJournal($page.find('.journal'), action);
            if (action.type === 'fork') {
                return localStorage.removeItem($page.attr('id'));
            }
        },
        error: function (xhr, type, msg) {
            action.error = {
                type: type,
                msg: msg,
                response: xhr.responseText
            };
            return pushToLocal($page, pagePutInfo, action);
        }
    });
};

pageHandler.put = function ($page, action) {
    var checkedSite, forkFrom, pagePutInfo;
    checkedSite = function () {
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
        $page.find('h1 a').attr('href', "/view/index/view/" + pagePutInfo.slug).attr('target', location.host);
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

},{"./addToJournal":5,"./lineup":15,"./page":20,"./random":26,"./revision":30,"./state":33,"underscore":1}],22:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./editor":9,"./itemz":13,"./resolve":29}],23:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{}],24:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var cachedScript, escape, getScript, plugin, scripts,
    indexOf = [].indexOf || function (item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) return i;
            }
            return -1;
        };

module.exports = plugin = {};

escape = function (s) {
    return ('' + s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
};

cachedScript = function (url, options) {
    options = $.extend(options || {}, {
        dataType: "script",
        cache: true,
        url: url
    });
    return $.ajax(options);
};

scripts = [];

getScript = plugin.getScript = function (url, callback) {
    if (callback == null) {
        callback = function () {
        };
    }
    if (indexOf.call(scripts, url) >= 0) {
        return callback();
    } else {
        return cachedScript(url).done(function () {
            scripts.push(url);
            return callback();
        }).fail(function () {
            return callback();
        });
    }
};

plugin.get = plugin.getPlugin = function (name, callback) {
    if (window.plugins[name]) {
        return callback(window.plugins[name]);
    }
    return getScript("/plugins/" + name + "/" + name + ".js", function () {
        if (window.plugins[name]) {
            return callback(window.plugins[name]);
        }
        return getScript("/plugins/" + name + ".js", function () {
            return callback(window.plugins[name]);
        });
    });
};

plugin["do"] = plugin.doPlugin = function (div, item, done) {
    var error;
    if (done == null) {
        done = function () {
        };
    }
    error = function (ex, script) {
        div.append("<div class=\"error\">\n  " + (escape(item.text || "")) + "\n  <button>help</button><br>\n</div>");
        return div.find('button').on('click', function () {
            wiki.dialog(ex.toString(), "<p> This \"" + item.type + "\" plugin won't show.</p>\n<li> Is it available on this server?\n<li> Is its markup correct?\n<li> Can it find necessary data?\n<li> Has network access been interrupted?\n<li> Has its code been tested?\n<p> Developers may open debugging tools and retry the plugin.</p>\n<button class=\"retry\">retry</button>\n<p> Learn more\n  <a class=\"external\" target=\"_blank\" rel=\"nofollow\"\n  href=\"http://plugins.fed.wiki.org/about-plugins.html\"\n  title=\"http://plugins.fed.wiki.org/about-plugins.html\">\n    About Plugins\n    <img src=\"/images/external-link-ltr-icon.png\">\n  </a>\n</p>");
            return $('.retry').on('click', function () {
                if (script.emit.length > 2) {
                    return script.emit(div, item, function () {
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
    return plugin.get(item.type, function (script) {
        var err;
        try {
            if (script == null) {
                throw TypeError("Can't find plugin for '" + item.type + "'");
            }
            if (script.emit.length > 2) {
                return script.emit(div, item, function () {
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

plugin.registerPlugin = function (pluginName, pluginFn) {
    return window.plugins[pluginName] = pluginFn($);
};

},{}],25:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
window.plugins = {
  reference: require('./reference'),
  factory: require('./factory'),
  paragraph: require('./paragraph'),
  image: require('./image'),
  future: require('./future')
};

},{"./factory":10,"./future":11,"./image":12,"./paragraph":22,"./reference":27}],26:[function(require,module,exports){
"use strict";

var itemId, randomByte, randomBytes;

var rchars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz_";
randomBytes = function (n) {
    var r = '';
    for (var i = 0; i < n; i++) {
        r += rchars[ Math.floor(Math.random() * rchars.length) ];
    }
    return r;
}

randomByte = function () {
    return randomBytes(1);
    //return (((1 + Math.random()) * 0x100) | 0).toString(16).substring(1);
};

//
//randomBytes = function(n) {
//  return ((function() {
//    var i, ref, results;
//    results = [];
//    for (i = 1, ref = n; 1 <= ref ? i <= ref : i >= ref; 1 <= ref ? i++ : i--) {
//      results.push(randomByte());
//    }
//    return results;
//  })()).join('');
//};

itemId = function () {
    return randomBytes(8);
};

module.exports = {
    randomByte: randomByte,
    randomBytes: randomBytes,
    itemId: itemId
};

},{}],27:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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
  slug || (slug = 'index');
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

},{"./editor":9,"./page":20,"./resolve":29}],28:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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
  return $page.find(".add-factory").on("click", function(evt) {
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
  return $footer.append(
      //"<a id=\"license\" href=\"http://creativecommons.org/licenses/by-sa/4.0/\">CC BY-SA 4.0</a> .\n' " +
      "<a class=\"show-page-source\" href=\"/" + slug + ".json" +
          "?random=" + (random.randomBytes(4)) +
      "\" title=\"source\">JSON</a> <a href= \"//" + host + "/" + slug + ".html\" target=\"" + host + "\">" + host + " </a>");
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
    if (twins && twins.length > 0) {
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

},{"./actionSymbols":3,"./addToJournal":5,"./lineup":15,"./neighborhood":18,"./page":20,"./pageHandler":21,"./plugin":24,"./random":26,"./resolve":29,"./state":33,"underscore":1}],29:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./page":20}],30:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{}],31:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./active":4,"./link":17,"./page":20}],32:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./search":31}],33:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
var active, lineup, link, state,
    indexOf = [].indexOf || function (item) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (i in this && this[i] === item) return i;
            }
            return -1;
        };

active = require('./active');

lineup = require('./lineup');

link = null;

module.exports = state = {};

state.inject = function (link_) {
    return link = link_;
};

state.pagesInDom = function () {
    return $.makeArray($(".page").map(function (_, el) {
        return el.id;
    }));
};

state.urlPages = function () {
    var i;
    return ((function () {
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

state.locsInDom = function () {
    return $.makeArray($(".page").map(function (_, el) {
        return $(el).data('site') || 'view';
    }));
};

state.urlLocs = function () {
    var j, k, len, ref, results;
    ref = $(location).attr('pathname').split('/').slice(1);
    results = [];
    for (k = 0, len = ref.length; k < len; k += 2) {
        j = ref[k];
        results.push(j);
    }
    return results;
};

state.setUrl = function () {
    var idx, locs, page, pages, url;
    document.title = lineup.bestTitle();
    if (history && history.pushState) {
        locs = state.locsInDom();
        pages = state.pagesInDom();
        url = ((function () {
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

state.show = function (e) {
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
    console.log('a .page keys ', (function () {
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

state.first = function () {
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

},{"./active":4,"./lineup":15}],34:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{}],35:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{}],36:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{}],37:[function(require,module,exports){
// Generated by CoffeeScript 1.9.1
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

},{"./dialog":7,"./editor":9,"./itemz":13,"./link":17,"./neighborhood":18,"./page":20,"./pageHandler":21,"./persona":23,"./plugin":24,"./resolve":29,"./synopsis":34,"./util":36}],38:[function(require,module,exports){
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

},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvbWUvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvZmFrZV8zYjcyYTc3OS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL2FjdGlvblN5bWJvbHMuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9hY3RpdmUuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9hZGRUb0pvdXJuYWwuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9iaW5kLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvZGlhbG9nLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvZHJvcC5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL2VkaXRvci5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL2ZhY3RvcnkuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9mdXR1cmUuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9pbWFnZS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL2l0ZW16LmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvbGVnYWN5LmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvbGluZXVwLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvbGluZXVwQWN0aXZpdHkuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9saW5rLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvbmVpZ2hib3Job29kLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvbmVpZ2hib3JzLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvcGFnZS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3BhZ2VIYW5kbGVyLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvcGFyYWdyYXBoLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvcGVyc29uYS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3BsdWdpbi5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3BsdWdpbnMuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9yYW5kb20uanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9yZWZlcmVuY2UuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9yZWZyZXNoLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvcmVzb2x2ZS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3JldmlzaW9uLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvc2VhcmNoLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvc2VhcmNoYm94LmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvc3RhdGUuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9zeW5vcHNpcy5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3RhcmdldC5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3V0aWwuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi93aWtpLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9ub2RlX21vZHVsZXMvZ3VscC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy96Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ROQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjYuMFxuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNCBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gRXN0YWJsaXNoIHRoZSBvYmplY3QgdGhhdCBnZXRzIHJldHVybmVkIHRvIGJyZWFrIG91dCBvZiBhIGxvb3AgaXRlcmF0aW9uLlxuICB2YXIgYnJlYWtlciA9IHt9O1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyXG4gICAgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICBzbGljZSAgICAgICAgICAgID0gQXJyYXlQcm90by5zbGljZSxcbiAgICBjb25jYXQgICAgICAgICAgID0gQXJyYXlQcm90by5jb25jYXQsXG4gICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgIGhhc093blByb3BlcnR5ICAgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhclxuICAgIG5hdGl2ZUZvckVhY2ggICAgICA9IEFycmF5UHJvdG8uZm9yRWFjaCxcbiAgICBuYXRpdmVNYXAgICAgICAgICAgPSBBcnJheVByb3RvLm1hcCxcbiAgICBuYXRpdmVSZWR1Y2UgICAgICAgPSBBcnJheVByb3RvLnJlZHVjZSxcbiAgICBuYXRpdmVSZWR1Y2VSaWdodCAgPSBBcnJheVByb3RvLnJlZHVjZVJpZ2h0LFxuICAgIG5hdGl2ZUZpbHRlciAgICAgICA9IEFycmF5UHJvdG8uZmlsdGVyLFxuICAgIG5hdGl2ZUV2ZXJ5ICAgICAgICA9IEFycmF5UHJvdG8uZXZlcnksXG4gICAgbmF0aXZlU29tZSAgICAgICAgID0gQXJyYXlQcm90by5zb21lLFxuICAgIG5hdGl2ZUluZGV4T2YgICAgICA9IEFycmF5UHJvdG8uaW5kZXhPZixcbiAgICBuYXRpdmVMYXN0SW5kZXhPZiAgPSBBcnJheVByb3RvLmxhc3RJbmRleE9mLFxuICAgIG5hdGl2ZUlzQXJyYXkgICAgICA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyAgICAgICAgID0gT2JqZWN0LmtleXMsXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQ7XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0IHZpYSBhIHN0cmluZyBpZGVudGlmaWVyLFxuICAvLyBmb3IgQ2xvc3VyZSBDb21waWxlciBcImFkdmFuY2VkXCIgbW9kZS5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS42LjAnO1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgb2JqZWN0cyB3aXRoIHRoZSBidWlsdC1pbiBgZm9yRWFjaGAsIGFycmF5cywgYW5kIHJhdyBvYmplY3RzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZm9yRWFjaGAgaWYgYXZhaWxhYmxlLlxuICB2YXIgZWFjaCA9IF8uZWFjaCA9IF8uZm9yRWFjaCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgaWYgKG5hdGl2ZUZvckVhY2ggJiYgb2JqLmZvckVhY2ggPT09IG5hdGl2ZUZvckVhY2gpIHtcbiAgICAgIG9iai5mb3JFYWNoKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKSA9PT0gYnJlYWtlcikgcmV0dXJuO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRvciB0byBlYWNoIGVsZW1lbnQuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBtYXBgIGlmIGF2YWlsYWJsZS5cbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIGlmIChuYXRpdmVNYXAgJiYgb2JqLm1hcCA9PT0gbmF0aXZlTWFwKSByZXR1cm4gb2JqLm1hcChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgdmFyIHJlZHVjZUVycm9yID0gJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xuXG4gIC8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbiAgLy8gb3IgYGZvbGRsYC4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHJlZHVjZWAgaWYgYXZhaWxhYmxlLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZSAmJiBvYmoucmVkdWNlID09PSBuYXRpdmVSZWR1Y2UpIHtcbiAgICAgIGlmIChjb250ZXh0KSBpdGVyYXRvciA9IF8uYmluZChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICByZXR1cm4gaW5pdGlhbCA/IG9iai5yZWR1Y2UoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZShpdGVyYXRvcik7XG4gICAgfVxuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmICghaW5pdGlhbCkge1xuICAgICAgICBtZW1vID0gdmFsdWU7XG4gICAgICAgIGluaXRpYWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbWVtbywgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlUmlnaHRgIGlmIGF2YWlsYWJsZS5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcbiAgICBpZiAob2JqID09IG51bGwpIG9iaiA9IFtdO1xuICAgIGlmIChuYXRpdmVSZWR1Y2VSaWdodCAmJiBvYmoucmVkdWNlUmlnaHQgPT09IG5hdGl2ZVJlZHVjZVJpZ2h0KSB7XG4gICAgICBpZiAoY29udGV4dCkgaXRlcmF0b3IgPSBfLmJpbmQoaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlUmlnaHQoaXRlcmF0b3IsIG1lbW8pIDogb2JqLnJlZHVjZVJpZ2h0KGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IG9iai5sZW5ndGg7XG4gICAgaWYgKGxlbmd0aCAhPT0gK2xlbmd0aCkge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIH1cbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpbmRleCA9IGtleXMgPyBrZXlzWy0tbGVuZ3RoXSA6IC0tbGVuZ3RoO1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSBvYmpbaW5kZXhdO1xuICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIG9ialtpbmRleF0sIGluZGV4LCBsaXN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQ7XG4gICAgYW55KG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgZmlsdGVyYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0cztcbiAgICBpZiAobmF0aXZlRmlsdGVyICYmIG9iai5maWx0ZXIgPT09IG5hdGl2ZUZpbHRlcikgcmV0dXJuIG9iai5maWx0ZXIocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgfSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBldmVyeWAgaWYgYXZhaWxhYmxlLlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSB8fCAocHJlZGljYXRlID0gXy5pZGVudGl0eSk7XG4gICAgdmFyIHJlc3VsdCA9IHRydWU7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVFdmVyeSAmJiBvYmouZXZlcnkgPT09IG5hdGl2ZUV2ZXJ5KSByZXR1cm4gb2JqLmV2ZXJ5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKCEocmVzdWx0ID0gcmVzdWx0ICYmIHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpKSByZXR1cm4gYnJlYWtlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBzb21lYCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIHZhciBhbnkgPSBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlIHx8IChwcmVkaWNhdGUgPSBfLmlkZW50aXR5KTtcbiAgICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChuYXRpdmVTb21lICYmIG9iai5zb21lID09PSBuYXRpdmVTb21lKSByZXR1cm4gb2JqLnNvbWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocmVzdWx0IHx8IChyZXN1bHQgPSBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSkgcmV0dXJuIGJyZWFrZXI7XG4gICAgfSk7XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gdmFsdWUgKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIHRhcmdldCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmIChuYXRpdmVJbmRleE9mICYmIG9iai5pbmRleE9mID09PSBuYXRpdmVJbmRleE9mKSByZXR1cm4gb2JqLmluZGV4T2YodGFyZ2V0KSAhPSAtMTtcbiAgICByZXR1cm4gYW55KG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gdGFyZ2V0O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGlzRnVuYyA9IF8uaXNGdW5jdGlvbihtZXRob2QpO1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gKGlzRnVuYyA/IG1ldGhvZCA6IHZhbHVlW21ldGhvZF0pLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXMoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCBvciAoZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIC8vIENhbid0IG9wdGltaXplIGFycmF5cyBvZiBpbnRlZ2VycyBsb25nZXIgdGhhbiA2NSw1MzUgZWxlbWVudHMuXG4gIC8vIFNlZSBbV2ViS2l0IEJ1ZyA4MDc5N10oaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTgwNzk3KVxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoIWl0ZXJhdG9yICYmIF8uaXNBcnJheShvYmopICYmIG9ialswXSA9PT0gK29ialswXSAmJiBvYmoubGVuZ3RoIDwgNjU1MzUpIHtcbiAgICAgIHJldHVybiBNYXRoLm1heC5hcHBseShNYXRoLCBvYmopO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0FycmF5KG9iaikgJiYgb2JqWzBdID09PSArb2JqWzBdICYmIG9iai5sZW5ndGggPCA2NTUzNSkge1xuICAgICAgcmV0dXJuIE1hdGgubWluLmFwcGx5KE1hdGgsIG9iaik7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSBJbmZpbml0eSwgbGFzdENvbXB1dGVkID0gSW5maW5pdHk7XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgdmFyIGNvbXB1dGVkID0gaXRlcmF0b3IgPyBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkgOiB2YWx1ZTtcbiAgICAgIGlmIChjb21wdXRlZCA8IGxhc3RDb21wdXRlZCkge1xuICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBTaHVmZmxlIGFuIGFycmF5LCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJhbmQ7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc2h1ZmZsZWQgPSBbXTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJhbmQgPSBfLnJhbmRvbShpbmRleCsrKTtcbiAgICAgIHNodWZmbGVkW2luZGV4IC0gMV0gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgIHNodWZmbGVkW3JhbmRdID0gdmFsdWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHNodWZmbGVkO1xuICB9O1xuXG4gIC8vIFNhbXBsZSAqKm4qKiByYW5kb20gdmFsdWVzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAvLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50LlxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxuICBfLnNhbXBsZSA9IGZ1bmN0aW9uKG9iaiwgbiwgZ3VhcmQpIHtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICBpZiAob2JqLmxlbmd0aCAhPT0gK29iai5sZW5ndGgpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgICByZXR1cm4gb2JqW18ucmFuZG9tKG9iai5sZW5ndGggLSAxKV07XG4gICAgfVxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgbG9va3VwIGl0ZXJhdG9ycy5cbiAgdmFyIGxvb2t1cEl0ZXJhdG9yID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiB2YWx1ZTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdG9yLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICB2YXIga2V5ID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwga2V5LCB2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSwgdmFsdWUpIHtcbiAgICBfLmhhcyhyZXN1bHQsIGtleSkgPyByZXN1bHRba2V5XS5wdXNoKHZhbHVlKSA6IHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIGtleSkge1xuICAgIF8uaGFzKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldKysgOiByZXN1bHRba2V5XSA9IDE7XG4gIH0pO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRvciA9IGxvb2t1cEl0ZXJhdG9yKGl0ZXJhdG9yKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9iaik7XG4gICAgdmFyIGxvdyA9IDAsIGhpZ2ggPSBhcnJheS5sZW5ndGg7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSAobG93ICsgaGlnaCkgPj4+IDE7XG4gICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGFycmF5W21pZF0pIDwgdmFsdWUgPyBsb3cgPSBtaWQgKyAxIDogaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBTYWZlbHkgY3JlYXRlIGEgcmVhbCwgbGl2ZSBhcnJheSBmcm9tIGFueXRoaW5nIGl0ZXJhYmxlLlxuICBfLnRvQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIW9iaikgcmV0dXJuIFtdO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSkgcmV0dXJuIHNsaWNlLmNhbGwob2JqKTtcbiAgICBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gKG9iai5sZW5ndGggPT09ICtvYmoubGVuZ3RoKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmICgobiA9PSBudWxsKSB8fCBndWFyZCkgcmV0dXJuIGFycmF5WzBdO1xuICAgIGlmIChuIDwgMCkgcmV0dXJuIFtdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBuKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoXG4gIC8vIGBfLm1hcGAuXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBhcnJheS5sZW5ndGggLSAoKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbikpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKiBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmICgobiA9PSBudWxsKSB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBNYXRoLm1heChhcnJheS5sZW5ndGggLSBuLCAwKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5LiBBbGlhc2VkIGFzIGB0YWlsYCBhbmQgYGRyb3BgLlxuICAvLyBFc3BlY2lhbGx5IHVzZWZ1bCBvbiB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVyblxuICAvLyB0aGUgcmVzdCBOIHZhbHVlcyBpbiB0aGUgYXJyYXkuIFRoZSAqKmd1YXJkKipcbiAgLy8gY2hlY2sgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgKG4gPT0gbnVsbCkgfHwgZ3VhcmQgPyAxIDogbik7XG4gIH07XG5cbiAgLy8gVHJpbSBvdXQgYWxsIGZhbHN5IHZhbHVlcyBmcm9tIGFuIGFycmF5LlxuICBfLmNvbXBhY3QgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgXy5pZGVudGl0eSk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYSByZWN1cnNpdmUgYGZsYXR0ZW5gIGZ1bmN0aW9uLlxuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uKGlucHV0LCBzaGFsbG93LCBvdXRwdXQpIHtcbiAgICBpZiAoc2hhbGxvdyAmJiBfLmV2ZXJ5KGlucHV0LCBfLmlzQXJyYXkpKSB7XG4gICAgICByZXR1cm4gY29uY2F0LmFwcGx5KG91dHB1dCwgaW5wdXQpO1xuICAgIH1cbiAgICBlYWNoKGlucHV0LCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKF8uaXNBcnJheSh2YWx1ZSkgfHwgXy5pc0FyZ3VtZW50cyh2YWx1ZSkpIHtcbiAgICAgICAgc2hhbGxvdyA/IHB1c2guYXBwbHkob3V0cHV0LCB2YWx1ZSkgOiBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBvdXRwdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgb3V0cHV0LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBbXSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBTcGxpdCBhbiBhcnJheSBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICBfLnBhcnRpdGlvbiA9IGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgICB2YXIgcGFzcyA9IFtdLCBmYWlsID0gW107XG4gICAgZWFjaChhcnJheSwgZnVuY3Rpb24oZWxlbSkge1xuICAgICAgKHByZWRpY2F0ZShlbGVtKSA/IHBhc3MgOiBmYWlsKS5wdXNoKGVsZW0pO1xuICAgIH0pO1xuICAgIHJldHVybiBbcGFzcywgZmFpbF07XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBBbGlhc2VkIGFzIGB1bmlxdWVgLlxuICBfLnVuaXEgPSBfLnVuaXF1ZSA9IGZ1bmN0aW9uKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdG9yO1xuICAgICAgaXRlcmF0b3IgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBpbml0aWFsID0gaXRlcmF0b3IgPyBfLm1hcChhcnJheSwgaXRlcmF0b3IsIGNvbnRleHQpIDogYXJyYXk7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGVhY2goaW5pdGlhbCwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICBpZiAoaXNTb3J0ZWQgPyAoIWluZGV4IHx8IHNlZW5bc2Vlbi5sZW5ndGggLSAxXSAhPT0gdmFsdWUpIDogIV8uY29udGFpbnMoc2VlbiwgdmFsdWUpKSB7XG4gICAgICAgIHNlZW4ucHVzaCh2YWx1ZSk7XG4gICAgICAgIHJlc3VsdHMucHVzaChhcnJheVtpbmRleF0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdW5pb246IGVhY2ggZGlzdGluY3QgZWxlbWVudCBmcm9tIGFsbCBvZlxuICAvLyB0aGUgcGFzc2VkLWluIGFycmF5cy5cbiAgXy51bmlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuaXEoXy5mbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihfLnVuaXEoYXJyYXkpLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gXy5ldmVyeShyZXN0LCBmdW5jdGlvbihvdGhlcikge1xuICAgICAgICByZXR1cm4gXy5jb250YWlucyhvdGhlciwgaXRlbSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXsgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTsgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGVuZ3RoID0gXy5tYXgoXy5wbHVjayhhcmd1bWVudHMsICdsZW5ndGgnKS5jb25jYXQoMCkpO1xuICAgIHZhciByZXN1bHRzID0gbmV3IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJndW1lbnRzLCAnJyArIGkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgaWYgKGxpc3QgPT0gbnVsbCkgcmV0dXJuIHt9O1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIElmIHRoZSBicm93c2VyIGRvZXNuJ3Qgc3VwcGx5IHVzIHdpdGggaW5kZXhPZiAoSSdtIGxvb2tpbmcgYXQgeW91LCAqKk1TSUUqKiksXG4gIC8vIHdlIG5lZWQgdGhpcyBmdW5jdGlvbi4gUmV0dXJuIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhblxuICAvLyBpdGVtIGluIGFuIGFycmF5LCBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgaW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICAvLyBJZiB0aGUgYXJyYXkgaXMgbGFyZ2UgYW5kIGFscmVhZHkgaW4gc29ydCBvcmRlciwgcGFzcyBgdHJ1ZWBcbiAgLy8gZm9yICoqaXNTb3J0ZWQqKiB0byB1c2UgYmluYXJ5IHNlYXJjaC5cbiAgXy5pbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGlzU29ydGVkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiAtMTtcbiAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgaXNTb3J0ZWQgPT0gJ251bWJlcicpIHtcbiAgICAgICAgaSA9IChpc1NvcnRlZCA8IDAgPyBNYXRoLm1heCgwLCBsZW5ndGggKyBpc1NvcnRlZCkgOiBpc1NvcnRlZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpID0gXy5zb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpXSA9PT0gaXRlbSA/IGkgOiAtMTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5hdGl2ZUluZGV4T2YgJiYgYXJyYXkuaW5kZXhPZiA9PT0gbmF0aXZlSW5kZXhPZikgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSwgaXNTb3J0ZWQpO1xuICAgIGZvciAoOyBpIDwgbGVuZ3RoOyBpKyspIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBsYXN0SW5kZXhPZmAgaWYgYXZhaWxhYmxlLlxuICBfLmxhc3RJbmRleE9mID0gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGZyb20pIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBoYXNJbmRleCA9IGZyb20gIT0gbnVsbDtcbiAgICBpZiAobmF0aXZlTGFzdEluZGV4T2YgJiYgYXJyYXkubGFzdEluZGV4T2YgPT09IG5hdGl2ZUxhc3RJbmRleE9mKSB7XG4gICAgICByZXR1cm4gaGFzSW5kZXggPyBhcnJheS5sYXN0SW5kZXhPZihpdGVtLCBmcm9tKSA6IGFycmF5Lmxhc3RJbmRleE9mKGl0ZW0pO1xuICAgIH1cbiAgICB2YXIgaSA9IChoYXNJbmRleCA/IGZyb20gOiBhcnJheS5sZW5ndGgpO1xuICAgIHdoaWxlIChpLS0pIGlmIChhcnJheVtpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPD0gMSkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBhcmd1bWVudHNbMl0gfHwgMTtcblxuICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgdmFyIGlkeCA9IDA7XG4gICAgdmFyIHJhbmdlID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICB3aGlsZShpZHggPCBsZW5ndGgpIHtcbiAgICAgIHJhbmdlW2lkeCsrXSA9IHN0YXJ0O1xuICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXVzYWJsZSBjb25zdHJ1Y3RvciBmdW5jdGlvbiBmb3IgcHJvdG90eXBlIHNldHRpbmcuXG4gIHZhciBjdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIHZhciBhcmdzLCBib3VuZDtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3I7XG4gICAgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBib3VuZCkpIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgIHZhciBzZWxmID0gbmV3IGN0b3I7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseShzZWxmLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgIGlmIChPYmplY3QocmVzdWx0KSA9PT0gcmVzdWx0KSByZXR1cm4gcmVzdWx0O1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcbiAgfTtcblxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4gIC8vIGFyZ3VtZW50cyBwcmUtZmlsbGVkLCB3aXRob3V0IGNoYW5naW5nIGl0cyBkeW5hbWljIGB0aGlzYCBjb250ZXh0LiBfIGFjdHNcbiAgLy8gYXMgYSBwbGFjZWhvbGRlciwgYWxsb3dpbmcgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyB0byBiZSBwcmUtZmlsbGVkLlxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwO1xuICAgICAgdmFyIGFyZ3MgPSBib3VuZEFyZ3Muc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmdzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChhcmdzW2ldID09PSBfKSBhcmdzW2ldID0gYXJndW1lbnRzW3Bvc2l0aW9uKytdO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEJpbmQgYSBudW1iZXIgb2YgYW4gb2JqZWN0J3MgbWV0aG9kcyB0byB0aGF0IG9iamVjdC4gUmVtYWluaW5nIGFyZ3VtZW50c1xuICAvLyBhcmUgdGhlIG1ldGhvZCBuYW1lcyB0byBiZSBib3VuZC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0IGFsbCBjYWxsYmFja3NcbiAgLy8gZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuICBfLmJpbmRBbGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgZnVuY3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWxsIG11c3QgYmUgcGFzc2VkIGZ1bmN0aW9uIG5hbWVzJyk7XG4gICAgZWFjaChmdW5jcywgZnVuY3Rpb24oZikgeyBvYmpbZl0gPSBfLmJpbmQob2JqW2ZdLCBvYmopOyB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIE1lbW9pemUgYW4gZXhwZW5zaXZlIGZ1bmN0aW9uIGJ5IHN0b3JpbmcgaXRzIHJlc3VsdHMuXG4gIF8ubWVtb2l6ZSA9IGZ1bmN0aW9uKGZ1bmMsIGhhc2hlcikge1xuICAgIHZhciBtZW1vID0ge307XG4gICAgaGFzaGVyIHx8IChoYXNoZXIgPSBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gXy5oYXMobWVtbywga2V5KSA/IG1lbW9ba2V5XSA6IChtZW1vW2tleV0gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gRGVsYXlzIGEgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBhbmQgdGhlbiBjYWxsc1xuICAvLyBpdCB3aXRoIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQuXG4gIF8uZGVsYXkgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXsgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7IH0sIHdhaXQpO1xuICB9O1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHJldHVybiBfLmRlbGF5LmFwcGx5KF8sIFtmdW5jLCAxXS5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgb3B0aW9ucyB8fCAob3B0aW9ucyA9IHt9KTtcbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKCF0aW1lb3V0ICYmIG9wdGlvbnMudHJhaWxpbmcgIT09IGZhbHNlKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCBhcmdzLCBjb250ZXh0LCB0aW1lc3RhbXAsIHJlc3VsdDtcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxhc3QgPSBfLm5vdygpIC0gdGltZXN0YW1wO1xuICAgICAgaWYgKGxhc3QgPCB3YWl0KSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgfVxuICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgcmFuID0gZmFsc2UsIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHJhbikgcmV0dXJuIG1lbW87XG4gICAgICByYW4gPSB0cnVlO1xuICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBmdW5jdGlvbiBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gdGhlIHNlY29uZCxcbiAgLy8gYWxsb3dpbmcgeW91IHRvIGFkanVzdCBhcmd1bWVudHMsIHJ1biBjb2RlIGJlZm9yZSBhbmQgYWZ0ZXIsIGFuZFxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICBfLndyYXAgPSBmdW5jdGlvbihmdW5jLCB3cmFwcGVyKSB7XG4gICAgcmV0dXJuIF8ucGFydGlhbCh3cmFwcGVyLCBmdW5jKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuICAvLyBjb25zdW1pbmcgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICBfLmNvbXBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZnVuY3MgPSBhcmd1bWVudHM7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBmb3IgKHZhciBpID0gZnVuY3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgYXJncyA9IFtmdW5jc1tpXS5hcHBseSh0aGlzLCBhcmdzKV07XG4gICAgICB9XG4gICAgICByZXR1cm4gYXJnc1swXTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBhZnRlciBiZWluZyBjYWxsZWQgTiB0aW1lcy5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBPYmplY3QgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYE9iamVjdC5rZXlzYFxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZXNbaV0gPSBvYmpba2V5c1tpXV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xuICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbb2JqW2tleXNbaV1dXSA9IGtleXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIG9ialtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGNvcHkgPSB7fTtcbiAgICB2YXIga2V5cyA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGVhY2goa2V5cywgZnVuY3Rpb24oa2V5KSB7XG4gICAgICBpZiAoa2V5IGluIG9iaikgY29weVtrZXldID0gb2JqW2tleV07XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvcHk7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKCFfLmNvbnRhaW5zKGtleXMsIGtleSkpIGNvcHlba2V5XSA9IG9ialtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gY29weTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgZWFjaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHNvdXJjZSkge1xuICAgICAgICAgIGlmIChvYmpbcHJvcF0gPT09IHZvaWQgMCkgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gYSA9PSBTdHJpbmcoYik7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLiBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yXG4gICAgICAgIC8vIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gYSAhPSArYSA/IGIgIT0gK2IgOiAoYSA9PSAwID8gMSAvIGEgPT0gMSAvIGIgOiBhID09ICtiKTtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PSArYjtcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyIHNvdXJjZSBwYXR0ZXJucyBhbmQgZmxhZ3MuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgICByZXR1cm4gYS5zb3VyY2UgPT0gYi5zb3VyY2UgJiZcbiAgICAgICAgICAgICAgIGEuZ2xvYmFsID09IGIuZ2xvYmFsICYmXG4gICAgICAgICAgICAgICBhLm11bHRpbGluZSA9PSBiLm11bHRpbGluZSAmJlxuICAgICAgICAgICAgICAgYS5pZ25vcmVDYXNlID09IGIuaWdub3JlQ2FzZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09IGI7XG4gICAgfVxuICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3Rgc1xuICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgIGlmIChhQ3RvciAhPT0gYkN0b3IgJiYgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIChhQ3RvciBpbnN0YW5jZW9mIGFDdG9yKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIChiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICYmICgnY29uc3RydWN0b3InIGluIGEgJiYgJ2NvbnN0cnVjdG9yJyBpbiBiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG4gICAgdmFyIHNpemUgPSAwLCByZXN1bHQgPSB0cnVlO1xuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChjbGFzc05hbWUgPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgLy8gQ29tcGFyZSBhcnJheSBsZW5ndGhzIHRvIGRldGVybWluZSBpZiBhIGRlZXAgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkuXG4gICAgICBzaXplID0gYS5sZW5ndGg7XG4gICAgICByZXN1bHQgPSBzaXplID09IGIubGVuZ3RoO1xuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgICB3aGlsZSAoc2l6ZS0tKSB7XG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gZXEoYVtzaXplXSwgYltzaXplXSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYSkge1xuICAgICAgICBpZiAoXy5oYXMoYSwga2V5KSkge1xuICAgICAgICAgIC8vIENvdW50IHRoZSBleHBlY3RlZCBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgICAgICBzaXplKys7XG4gICAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyLlxuICAgICAgICAgIGlmICghKHJlc3VsdCA9IF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcy5cbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgZm9yIChrZXkgaW4gYikge1xuICAgICAgICAgIGlmIChfLmhhcyhiLCBrZXkpICYmICEoc2l6ZS0tKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0ID0gIXNpemU7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlbW92ZSB0aGUgZmlyc3Qgb2JqZWN0IGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wb3AoKTtcbiAgICBiU3RhY2sucG9wKCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiLCBbXSwgW10pO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gYXJyYXksIHN0cmluZywgb3Igb2JqZWN0IGVtcHR5P1xuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxuICBfLmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gT2JqZWN0KG9iaik7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAuXG4gIGVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSksIHdoZXJlXG4gIC8vIHRoZXJlIGlzbid0IGFueSBpbnNwZWN0YWJsZSBcIkFyZ3VtZW50c1wiIHR5cGUuXG4gIGlmICghXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XG4gICAgXy5pc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuICEhKG9iaiAmJiBfLmhhcyhvYmosICdjYWxsZWUnKSk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS5cbiAgaWYgKHR5cGVvZiAoLy4vKSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc0Zpbml0ZShvYmopICYmICFpc05hTihwYXJzZUZsb2F0KG9iaikpO1xuICB9O1xuXG4gIC8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD8gKE5hTiBpcyB0aGUgb25seSBudW1iZXIgd2hpY2ggZG9lcyBub3QgZXF1YWwgaXRzZWxmKS5cbiAgXy5pc05hTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLmlzTnVtYmVyKG9iaikgJiYgb2JqICE9ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBlcXVhbCB0byBudWxsP1xuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSB1bmRlZmluZWQ/XG4gIF8uaXNVbmRlZmluZWQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XG4gIH07XG5cbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxuICAvLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuICBfLmhhcyA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0b3JzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIF8ucHJvcGVydHkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgcHJlZGljYXRlIGZvciBjaGVja2luZyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgaWYgKG9iaiA9PT0gYXR0cnMpIHJldHVybiB0cnVlOyAvL2F2b2lkIGNvbXBhcmluZyBhbiBvYmplY3QgdG8gaXRzZWxmLlxuICAgICAgZm9yICh2YXIga2V5IGluIGF0dHJzKSB7XG4gICAgICAgIGlmIChhdHRyc1trZXldICE9PSBvYmpba2V5XSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgYWNjdW1baV0gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZW50aXR5TWFwID0ge1xuICAgIGVzY2FwZToge1xuICAgICAgJyYnOiAnJmFtcDsnLFxuICAgICAgJzwnOiAnJmx0OycsXG4gICAgICAnPic6ICcmZ3Q7JyxcbiAgICAgICdcIic6ICcmcXVvdDsnLFxuICAgICAgXCInXCI6ICcmI3gyNzsnXG4gICAgfVxuICB9O1xuICBlbnRpdHlNYXAudW5lc2NhcGUgPSBfLmludmVydChlbnRpdHlNYXAuZXNjYXBlKTtcblxuICAvLyBSZWdleGVzIGNvbnRhaW5pbmcgdGhlIGtleXMgYW5kIHZhbHVlcyBsaXN0ZWQgaW1tZWRpYXRlbHkgYWJvdmUuXG4gIHZhciBlbnRpdHlSZWdleGVzID0ge1xuICAgIGVzY2FwZTogICBuZXcgUmVnRXhwKCdbJyArIF8ua2V5cyhlbnRpdHlNYXAuZXNjYXBlKS5qb2luKCcnKSArICddJywgJ2cnKSxcbiAgICB1bmVzY2FwZTogbmV3IFJlZ0V4cCgnKCcgKyBfLmtleXMoZW50aXR5TWFwLnVuZXNjYXBlKS5qb2luKCd8JykgKyAnKScsICdnJylcbiAgfTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIF8uZWFjaChbJ2VzY2FwZScsICd1bmVzY2FwZSddLCBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBfW21ldGhvZF0gPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIGlmIChzdHJpbmcgPT0gbnVsbCkgcmV0dXJuICcnO1xuICAgICAgcmV0dXJuICgnJyArIHN0cmluZykucmVwbGFjZShlbnRpdHlSZWdleGVzW21ldGhvZF0sIGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgIHJldHVybiBlbnRpdHlNYXBbbWV0aG9kXVttYXRjaF07XG4gICAgICB9KTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIGBwcm9wZXJ0eWAgaXMgYSBmdW5jdGlvbiB0aGVuIGludm9rZSBpdCB3aXRoIHRoZVxuICAvLyBgb2JqZWN0YCBhcyBjb250ZXh0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAgXy5yZXN1bHQgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZS5jYWxsKG9iamVjdCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBmdW5jLmFwcGx5KF8sIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgaW50ZWdlciBpZCAodW5pcXVlIHdpdGhpbiB0aGUgZW50aXJlIGNsaWVudCBzZXNzaW9uKS5cbiAgLy8gVXNlZnVsIGZvciB0ZW1wb3JhcnkgRE9NIGlkcy5cbiAgdmFyIGlkQ291bnRlciA9IDA7XG4gIF8udW5pcXVlSWQgPSBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICB2YXIgaWQgPSArK2lkQ291bnRlciArICcnO1xuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xuICB9O1xuXG4gIC8vIEJ5IGRlZmF1bHQsIFVuZGVyc2NvcmUgdXNlcyBFUkItc3R5bGUgdGVtcGxhdGUgZGVsaW1pdGVycywgY2hhbmdlIHRoZVxuICAvLyBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICBldmFsdWF0ZSAgICA6IC88JShbXFxzXFxTXSs/KSU+L2csXG4gICAgaW50ZXJwb2xhdGUgOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGUgICAgICA6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6ICAgICAgXCInXCIsXG4gICAgJ1xcXFwnOiAgICAgJ1xcXFwnLFxuICAgICdcXHInOiAgICAgJ3InLFxuICAgICdcXG4nOiAgICAgJ24nLFxuICAgICdcXHQnOiAgICAgJ3QnLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICB2YXIgZXNjYXBlciA9IC9cXFxcfCd8XFxyfFxcbnxcXHR8XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIGRhdGEsIHNldHRpbmdzKSB7XG4gICAgdmFyIHJlbmRlcjtcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBuZXcgUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KVxuICAgICAgICAucmVwbGFjZShlc2NhcGVyLCBmdW5jdGlvbihtYXRjaCkgeyByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07IH0pO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9XG4gICAgICBpZiAoaW50ZXJwb2xhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBpbnRlcnBvbGF0ZSArIFwiKSk9PW51bGw/Jyc6X190KStcXG4nXCI7XG4gICAgICB9XG4gICAgICBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgXCJyZXR1cm4gX19wO1xcblwiO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YSkgcmV0dXJuIHJlbmRlcihkYXRhLCBfKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIGZ1bmN0aW9uIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIChzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJykgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbiwgd2hpY2ggd2lsbCBkZWxlZ2F0ZSB0byB0aGUgd3JhcHBlci5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfKG9iaikuY2hhaW4oKTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgcmVzdWx0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIGFsbCBvZiB0aGUgVW5kZXJzY29yZSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIgb2JqZWN0LlxuICBfLm1peGluKF8pO1xuXG4gIC8vIEFkZCBhbGwgbXV0YXRvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIGVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT0gJ3NoaWZ0JyB8fCBuYW1lID09ICdzcGxpY2UnKSAmJiBvYmoubGVuZ3RoID09PSAwKSBkZWxldGUgb2JqWzBdO1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIGVhY2goWydjb25jYXQnLCAnam9pbicsICdzbGljZSddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXN1bHQuY2FsbCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgXy5leHRlbmQoXy5wcm90b3R5cGUsIHtcblxuICAgIC8vIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgICBjaGFpbjogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9jaGFpbiA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gICAgfVxuXG4gIH0pO1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufSkuY2FsbCh0aGlzKTtcbiIsIi8vY29uc29sZS5sb2coXCJXaW5kb3cgTmFtZTogXCIgKyB3aW5kb3cubmFtZSk7XG5cbnZhciB3aWtpID0gcmVxdWlyZSgnLi9saWIvd2lraScpO1xuXG50cnkge1xuICAgIHdpbmRvdy5uYW1lID0gd2luZG93LmxvY2F0aW9uLmhvc3Q7XG5cbiAgICB3aW5kb3cud2lraSA9IHdpa2k7XG5cbiAgICByZXF1aXJlKCcuL2xpYi9sZWdhY3knKTtcblxuICAgIHJlcXVpcmUoJy4vbGliL2JpbmQnKTtcblxuICAgIHJlcXVpcmUoJy4vbGliL3BsdWdpbnMnKTtcblxuXG5cbn1cbmNhdGNoIChlKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIHdpa2k6IHdpa2ksXG4gICAgICAgIHN5bm9wc2lzOiByZXF1aXJlKCcuL2xpYi9zeW5vcHNpcycpXG4gICAgfTtcbn0iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYWRkLCBmb3JrLCBzeW1ib2xzO1xuXG5zeW1ib2xzID0ge1xuICBjcmVhdGU6ICfimLwnLFxuICBhZGQ6ICcrJyxcbiAgZWRpdDogJ+KcjicsXG4gIGZvcms6ICfimpEnLFxuICBtb3ZlOiAn4oaVJyxcbiAgcmVtb3ZlOiAn4pyVJ1xufTtcblxuZm9yayA9IHN5bWJvbHNbJ2ZvcmsnXTtcblxuYWRkID0gc3ltYm9sc1snYWRkJ107XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzeW1ib2xzOiBzeW1ib2xzLFxuICBmb3JrOiBmb3JrLFxuICBhZGQ6IGFkZFxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhY3RpdmUsIGZpbmRTY3JvbGxDb250YWluZXIsIHNjcm9sbFRvO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFjdGl2ZSA9IHt9O1xuXG5hY3RpdmUuc2Nyb2xsQ29udGFpbmVyID0gdm9pZCAwO1xuXG5maW5kU2Nyb2xsQ29udGFpbmVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzY3JvbGxlZDtcbiAgICBzY3JvbGxlZCA9ICQoXCJib2R5LCBodG1sXCIpLmZpbHRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkKHRoaXMpLnNjcm9sbExlZnQoKSA+IDA7XG4gICAgfSk7XG4gICAgaWYgKHNjcm9sbGVkLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIHNjcm9sbGVkO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAkKFwiYm9keSwgaHRtbFwiKS5zY3JvbGxMZWZ0KDEyKS5maWx0ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICQodGhpcykuc2Nyb2xsTGVmdCgpID4gMDtcbiAgICAgICAgfSkuc2Nyb2xsVG9wKDApO1xuICAgIH1cbn07XG5cbnNjcm9sbFRvID0gZnVuY3Rpb24gKCRwYWdlKSB7XG4gICAgdmFyIGJvZHlXaWR0aCwgY29udGVudFdpZHRoLCBtYXhYLCBtaW5YLCB0YXJnZXQsIHdpZHRoO1xuICAgIGlmICgkcGFnZS5wb3NpdGlvbigpID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoYWN0aXZlLnNjcm9sbENvbnRhaW5lciA9PSBudWxsKSB7XG4gICAgICAgIGFjdGl2ZS5zY3JvbGxDb250YWluZXIgPSBmaW5kU2Nyb2xsQ29udGFpbmVyKCk7XG4gICAgfVxuICAgIGJvZHlXaWR0aCA9ICQoXCJib2R5XCIpLndpZHRoKCk7XG4gICAgbWluWCA9IGFjdGl2ZS5zY3JvbGxDb250YWluZXIuc2Nyb2xsTGVmdCgpO1xuICAgIG1heFggPSBtaW5YICsgYm9keVdpZHRoO1xuICAgIHRhcmdldCA9ICRwYWdlLnBvc2l0aW9uKCkubGVmdDtcbiAgICB3aWR0aCA9ICRwYWdlLm91dGVyV2lkdGgodHJ1ZSk7XG4gICAgY29udGVudFdpZHRoID0gJChcIi5wYWdlXCIpLm91dGVyV2lkdGgodHJ1ZSkgKiAkKFwiLnBhZ2VcIikuc2l6ZSgpO1xuICAgIGlmICh0YXJnZXQgPCBtaW5YKSB7XG4gICAgICAgIHJldHVybiBhY3RpdmUuc2Nyb2xsQ29udGFpbmVyLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsTGVmdDogdGFyZ2V0XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGFyZ2V0ICsgd2lkdGggPiBtYXhYKSB7XG4gICAgICAgIHJldHVybiBhY3RpdmUuc2Nyb2xsQ29udGFpbmVyLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsTGVmdDogdGFyZ2V0IC0gKGJvZHlXaWR0aCAtIHdpZHRoKVxuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKG1heFggPiAkKFwiLnBhZ2VzXCIpLm91dGVyV2lkdGgoKSkge1xuICAgICAgICByZXR1cm4gYWN0aXZlLnNjcm9sbENvbnRhaW5lci5hbmltYXRlKHtcbiAgICAgICAgICAgIHNjcm9sbExlZnQ6IE1hdGgubWluKHRhcmdldCwgY29udGVudFdpZHRoIC0gYm9keVdpZHRoKVxuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5hY3RpdmUuc2V0ID0gZnVuY3Rpb24gKCRwYWdlKSB7XG4gICAgJHBhZ2UgPSAkKCRwYWdlKTtcbiAgICAkKFwiLmFjdGl2ZVwiKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcbiAgICByZXR1cm4gc2Nyb2xsVG8oJHBhZ2UuYWRkQ2xhc3MoXCJhY3RpdmVcIikpO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhY3Rpb25TeW1ib2xzLCB1dGlsO1xuXG51dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmFjdGlvblN5bWJvbHMgPSByZXF1aXJlKCcuL2FjdGlvblN5bWJvbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigkam91cm5hbCwgYWN0aW9uKSB7XG4gIHZhciAkYWN0aW9uLCAkcGFnZSwgY29udHJvbHMsIHRpdGxlO1xuICAkcGFnZSA9ICRqb3VybmFsLnBhcmVudHMoJy5wYWdlOmZpcnN0Jyk7XG4gIHRpdGxlID0gYWN0aW9uLnR5cGUgfHwgJ3NlcGFyYXRvcic7XG4gIGlmIChhY3Rpb24uZGF0ZSAhPSBudWxsKSB7XG4gICAgdGl0bGUgKz0gXCIgXCIgKyAodXRpbC5mb3JtYXRFbGFwc2VkVGltZShhY3Rpb24uZGF0ZSkpO1xuICB9XG4gICRhY3Rpb24gPSAkKFwiPGEgaHJlZj1cXFwiI1xcXCIgLz4gXCIpLmFkZENsYXNzKFwiYWN0aW9uXCIpLmFkZENsYXNzKGFjdGlvbi50eXBlIHx8ICdzZXBhcmF0b3InKS50ZXh0KGFjdGlvbi5zeW1ib2wgfHwgYWN0aW9uU3ltYm9scy5zeW1ib2xzW2FjdGlvbi50eXBlXSkuYXR0cigndGl0bGUnLCB0aXRsZSkuYXR0cignZGF0YS1pZCcsIGFjdGlvbi5pZCB8fCBcIjBcIikuZGF0YSgnYWN0aW9uJywgYWN0aW9uKTtcbiAgY29udHJvbHMgPSAkam91cm5hbC5jaGlsZHJlbignLmNvbnRyb2wtYnV0dG9ucycpO1xuICBpZiAoY29udHJvbHMubGVuZ3RoID4gMCkge1xuICAgICRhY3Rpb24uaW5zZXJ0QmVmb3JlKGNvbnRyb2xzKTtcbiAgfSBlbHNlIHtcbiAgICAkYWN0aW9uLmFwcGVuZFRvKCRqb3VybmFsKTtcbiAgfVxuICBpZiAoYWN0aW9uLnR5cGUgPT09ICdmb3JrJyAmJiAoYWN0aW9uLnNpdGUgIT0gbnVsbCkpIHtcbiAgICByZXR1cm4gJGFjdGlvbi5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsIFwidXJsKC8vXCIgKyBhY3Rpb24uc2l0ZSArIFwiL2Zhdmljb24ucG5nKVwiKS5hdHRyKFwiaHJlZlwiLCBcIi8vXCIgKyBhY3Rpb24uc2l0ZSArIFwiL1wiICsgKCRwYWdlLmF0dHIoJ2lkJykpICsgXCIuaHRtbFwiKS5hdHRyKFwidGFyZ2V0XCIsIFwiXCIgKyBhY3Rpb24uc2l0ZSkuZGF0YShcInNpdGVcIiwgYWN0aW9uLnNpdGUpLmRhdGEoXCJzbHVnXCIsICRwYWdlLmF0dHIoJ2lkJykpO1xuICB9XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGxpbmssIG5laWdoYm9yaG9vZCwgbmVpZ2hib3JzLCBzZWFyY2hib3gsIHN0YXRlO1xuXG5uZWlnaGJvcmhvb2QgPSByZXF1aXJlKCcuL25laWdoYm9yaG9vZCcpO1xuXG5uZWlnaGJvcnMgPSByZXF1aXJlKCcuL25laWdoYm9ycycpO1xuXG5zZWFyY2hib3ggPSByZXF1aXJlKCcuL3NlYXJjaGJveCcpO1xuXG5zdGF0ZSA9IHJlcXVpcmUoJy4vc3RhdGUnKTtcblxubGluayA9IHJlcXVpcmUoJy4vbGluaycpO1xuXG4kKGZ1bmN0aW9uKCkge1xuICBzZWFyY2hib3guaW5qZWN0KG5laWdoYm9yaG9vZCk7XG4gIHNlYXJjaGJveC5iaW5kKCk7XG4gIG5laWdoYm9ycy5pbmplY3QobmVpZ2hib3Job29kKTtcbiAgbmVpZ2hib3JzLmJpbmQoKTtcbiAgaWYgKHdpbmRvdy5zZWVkTmVpZ2hib3JzKSB7XG4gICAgc2VlZE5laWdoYm9ycy5zcGxpdCgnLCcpLmZvckVhY2goZnVuY3Rpb24oc2l0ZSkge1xuICAgICAgcmV0dXJuIG5laWdoYm9yaG9vZC5yZWdpc3Rlck5laWdoYm9yKHNpdGUudHJpbSgpKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gc3RhdGUuaW5qZWN0KGxpbmspO1xufSk7XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgJGRpYWxvZywgZW1pdCwgb3BlbiwgcmVzb2x2ZTtcblxucmVzb2x2ZSA9IHJlcXVpcmUoJy4vcmVzb2x2ZScpO1xuXG4kZGlhbG9nID0gbnVsbDtcblxuZW1pdCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gJGRpYWxvZyA9ICQoJzxkaXY+PC9kaXY+JykuaHRtbCgnVGhpcyBkaWFsb2cgd2lsbCBzaG93IGV2ZXJ5IHRpbWUhJykuZGlhbG9nKHtcbiAgICBhdXRvT3BlbjogZmFsc2UsXG4gICAgdGl0bGU6ICdCYXNpYyBEaWFsb2cnLFxuICAgIGhlaWdodDogNjAwLFxuICAgIHdpZHRoOiA4MDBcbiAgfSk7XG59O1xuXG5vcGVuID0gZnVuY3Rpb24odGl0bGUsIGh0bWwpIHtcbiAgJGRpYWxvZy5odG1sKGh0bWwpO1xuICAkZGlhbG9nLmRpYWxvZyhcIm9wdGlvblwiLCBcInRpdGxlXCIsIHJlc29sdmUucmVzb2x2ZUxpbmtzKHRpdGxlKSk7XG4gIHJldHVybiAkZGlhbG9nLmRpYWxvZygnb3BlbicpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGVtaXQ6IGVtaXQsXG4gIG9wZW46IG9wZW5cbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgZGlzcGF0Y2gsIGlzRmlsZSwgaXNQYWdlLCBpc1VybCwgaXNWaWRlbyxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5pc0ZpbGUgPSBmdW5jdGlvbihldmVudCkge1xuICB2YXIgZHQ7XG4gIGlmICgoZHQgPSBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2ZlcikgIT0gbnVsbCkge1xuICAgIGlmIChpbmRleE9mLmNhbGwoZHQudHlwZXMsICdGaWxlcycpID49IDApIHtcbiAgICAgIHJldHVybiBkdC5maWxlc1swXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5pc1VybCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciBkdCwgdXJsO1xuICBpZiAoKGR0ID0gZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIpICE9IG51bGwpIHtcbiAgICBpZiAoKGR0LnR5cGVzICE9IG51bGwpICYmIChpbmRleE9mLmNhbGwoZHQudHlwZXMsICd0ZXh0L3VyaS1saXN0JykgPj0gMCB8fCBpbmRleE9mLmNhbGwoZHQudHlwZXMsICd0ZXh0L3gtbW96LXVybCcpID49IDApKSB7XG4gICAgICB1cmwgPSBkdC5nZXREYXRhKCdVUkwnKTtcbiAgICAgIGlmICh1cmwgIT0gbnVsbCA/IHVybC5sZW5ndGggOiB2b2lkIDApIHtcbiAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5pc1BhZ2UgPSBmdW5jdGlvbih1cmwpIHtcbiAgdmFyIGZvdW5kLCBpZ25vcmUsIGl0ZW0sIG9yaWdpbiwgcmVmO1xuICBpZiAoZm91bmQgPSB1cmwubWF0Y2goL15odHRwOlxcL1xcLyhbYS16QS1aMC05Oi4tXSspKFxcLyhbYS16QS1aMC05Oi4tXSspXFwvKFthLXowLTktXSsoX3JldlxcZCspPykpKyQvKSkge1xuICAgIGl0ZW0gPSB7fTtcbiAgICBpZ25vcmUgPSBmb3VuZFswXSwgb3JpZ2luID0gZm91bmRbMV0sIGlnbm9yZSA9IGZvdW5kWzJdLCBpdGVtLnNpdGUgPSBmb3VuZFszXSwgaXRlbS5zbHVnID0gZm91bmRbNF0sIGlnbm9yZSA9IGZvdW5kWzVdO1xuICAgIGlmICgocmVmID0gaXRlbS5zaXRlKSA9PT0gJ3ZpZXcnIHx8IHJlZiA9PT0gJ2xvY2FsJyB8fCByZWYgPT09ICdvcmlnaW4nKSB7XG4gICAgICBpdGVtLnNpdGUgPSBvcmlnaW47XG4gICAgfVxuICAgIHJldHVybiBpdGVtO1xuICB9XG4gIHJldHVybiBudWxsO1xufTtcblxuaXNWaWRlbyA9IGZ1bmN0aW9uKHVybCkge1xuICB2YXIgZm91bmQ7XG4gIGlmIChmb3VuZCA9IHVybC5tYXRjaCgvXmh0dHBzPzpcXC9cXC93d3cueW91dHViZS5jb21cXC93YXRjaFxcP3Y9KFtcXHdcXC1dKykuKiQvKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiBcIllPVVRVQkUgXCIgKyBmb3VuZFsxXVxuICAgIH07XG4gIH1cbiAgaWYgKGZvdW5kID0gdXJsLm1hdGNoKC9eaHR0cHM/OlxcL1xcL3lvdXR1LmJlXFwvKFtcXHdcXC1dKykuKiQvKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiBcIllPVVRVQkUgXCIgKyBmb3VuZFsxXVxuICAgIH07XG4gIH1cbiAgaWYgKGZvdW5kID0gdXJsLm1hdGNoKC93d3cueW91dHViZS5jb20lMkZ3YXRjaCUzRnYlM0QoW1xcd1xcLV0rKS4qJC8pKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRleHQ6IFwiWU9VVFVCRSBcIiArIGZvdW5kWzFdXG4gICAgfTtcbiAgfVxuICBpZiAoZm91bmQgPSB1cmwubWF0Y2goL15odHRwcz86XFwvXFwvdmltZW8uY29tXFwvKFswLTldKykuKiQvKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiBcIlZJTUVPIFwiICsgZm91bmRbMV1cbiAgICB9O1xuICB9XG4gIGlmIChmb3VuZCA9IHVybC5tYXRjaCgvdXJsPWh0dHBzPyUzQSUyRiUyRnZpbWVvLmNvbSUyRihbMC05XSspLiokLykpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGV4dDogXCJWSU1FTyBcIiArIGZvdW5kWzFdXG4gICAgfTtcbiAgfVxuICBpZiAoZm91bmQgPSB1cmwubWF0Y2goL2h0dHBzPzpcXC9cXC9hcmNoaXZlLm9yZ1xcL2RldGFpbHNcXC8oW1xcd1xcLlxcLV0rKS4qJC8pKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRleHQ6IFwiQVJDSElWRSBcIiArIGZvdW5kWzFdXG4gICAgfTtcbiAgfVxuICBpZiAoZm91bmQgPSB1cmwubWF0Y2goL2h0dHBzPzpcXC9cXC90ZWR4dGFsa3MudGVkLmNvbVxcL3ZpZGVvXFwvKFtcXHdcXC1dKykuKiQvKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiBcIlRFRFggXCIgKyBmb3VuZFsxXVxuICAgIH07XG4gIH1cbiAgaWYgKGZvdW5kID0gdXJsLm1hdGNoKC9odHRwcz86XFwvXFwvd3d3LnRlZC5jb21cXC90YWxrc1xcLyhbXFx3XFwuXFwtXSspLiokLykpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGV4dDogXCJURUQgXCIgKyBmb3VuZFsxXVxuICAgIH07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5kaXNwYXRjaCA9IGZ1bmN0aW9uKGhhbmRsZXJzKSB7XG4gIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBmaWxlLCBoYW5kbGUsIHBhZ2UsIHB1bnQsIHJlZiwgc3RvcCwgdXJsLCB2aWRlbztcbiAgICBzdG9wID0gZnVuY3Rpb24oaWdub3JlZCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHJldHVybiBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9O1xuICAgIGlmICh1cmwgPSBpc1VybChldmVudCkpIHtcbiAgICAgIGlmIChwYWdlID0gaXNQYWdlKHVybCkpIHtcbiAgICAgICAgaWYgKChoYW5kbGUgPSBoYW5kbGVycy5wYWdlKSAhPSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHN0b3AoaGFuZGxlKHBhZ2UpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHZpZGVvID0gaXNWaWRlbyh1cmwpKSB7XG4gICAgICAgIGlmICgoaGFuZGxlID0gaGFuZGxlcnMudmlkZW8pICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gc3RvcChoYW5kbGUodmlkZW8pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcHVudCA9IHtcbiAgICAgICAgdXJsOiB1cmxcbiAgICAgIH07XG4gICAgfVxuICAgIGlmIChmaWxlID0gaXNGaWxlKGV2ZW50KSkge1xuICAgICAgaWYgKChoYW5kbGUgPSBoYW5kbGVycy5maWxlKSAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBzdG9wKGhhbmRsZShmaWxlKSk7XG4gICAgICB9XG4gICAgICBwdW50ID0ge1xuICAgICAgICBmaWxlOiBmaWxlXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAoKGhhbmRsZSA9IGhhbmRsZXJzLnB1bnQpICE9IG51bGwpIHtcbiAgICAgIHB1bnQgfHwgKHB1bnQgPSB7XG4gICAgICAgIGR0OiBldmVudC5kYXRhVHJhbnNmZXIsXG4gICAgICAgIHR5cGVzOiAocmVmID0gZXZlbnQuZGF0YVRyYW5zZmVyKSAhPSBudWxsID8gcmVmLnR5cGVzIDogdm9pZCAwXG4gICAgICB9KTtcbiAgICAgIHJldHVybiBzdG9wKGhhbmRsZShwdW50KSk7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRpc3BhdGNoOiBkaXNwYXRjaFxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBlc2NhcGUsIGdldFNlbGVjdGlvblBvcywgaXRlbXosIGxpbmssIHBhZ2VIYW5kbGVyLCBwbHVnaW4sIHJhbmRvbSwgc2V0Q2FyZXRQb3NpdGlvbiwgc3Bhd25FZGl0b3IsIHRleHRFZGl0b3I7XG5cbnBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJyk7XG5cbml0ZW16ID0gcmVxdWlyZSgnLi9pdGVteicpO1xuXG5wYWdlSGFuZGxlciA9IHJlcXVpcmUoJy4vcGFnZUhhbmRsZXInKTtcblxubGluayA9IHJlcXVpcmUoJy4vbGluaycpO1xuXG5yYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpO1xuXG5lc2NhcGUgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKS5yZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG59O1xuXG50ZXh0RWRpdG9yID0gZnVuY3Rpb24gKCRpdGVtLCBpdGVtLCBvcHRpb24pIHtcbiAgICB2YXIgJHRleHRhcmVhLCBmb2N1c291dEhhbmRsZXIsIGtleWRvd25IYW5kbGVyLCBvcmlnaW5hbCwgcmVmLCByZWYxO1xuICAgIGlmIChvcHRpb24gPT0gbnVsbCkge1xuICAgICAgICBvcHRpb24gPSB7fTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ3RleHRFZGl0b3InLCBpdGVtLmlkLCBvcHRpb24pO1xuICAgIGtleWRvd25IYW5kbGVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyICRwYWdlLCAkcHJldmlvdXMsIGNhcmV0LCBwYWdlLCBwcmVmaXgsIHByZXZpb3VzLCBzZWwsIHN1ZmZpeCwgdGV4dDtcbiAgICAgICAgaWYgKChlLmFsdEtleSB8fCBlLmN0bEtleSB8fCBlLm1ldGFLZXkpICYmIGUud2hpY2ggPT09IDgzKSB7XG4gICAgICAgICAgICAkdGV4dGFyZWEuZm9jdXNvdXQoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKGUuYWx0S2V5IHx8IGUuY3RsS2V5IHx8IGUubWV0YUtleSkgJiYgZS53aGljaCA9PT0gNzMpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGlmICghZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCcucGFnZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGluay5kb0ludGVybmFsTGluayhcImFib3V0IFwiICsgaXRlbS50eXBlICsgXCIgcGx1Z2luXCIsIHBhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpdGVtLnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICBzZWwgPSBnZXRTZWxlY3Rpb25Qb3MoJHRleHRhcmVhKTtcbiAgICAgICAgICAgIGlmIChlLndoaWNoID09PSAkLnVpLmtleUNvZGUuQkFDS1NQQUNFICYmIHNlbC5zdGFydCA9PT0gMCAmJiBzZWwuc3RhcnQgPT09IHNlbC5lbmQpIHtcbiAgICAgICAgICAgICAgICAkcHJldmlvdXMgPSAkaXRlbS5wcmV2KCk7XG4gICAgICAgICAgICAgICAgcHJldmlvdXMgPSBpdGVtei5nZXRJdGVtKCRwcmV2aW91cyk7XG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzLnR5cGUgIT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FyZXQgPSBwcmV2aW91c1tvcHRpb24uZmllbGQgfHwgJ3RleHQnXS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgc3VmZml4ID0gJHRleHRhcmVhLnZhbCgpO1xuICAgICAgICAgICAgICAgICR0ZXh0YXJlYS52YWwoJycpO1xuICAgICAgICAgICAgICAgIHRleHRFZGl0b3IoJHByZXZpb3VzLCBwcmV2aW91cywge1xuICAgICAgICAgICAgICAgICAgICBjYXJldDogY2FyZXQsXG4gICAgICAgICAgICAgICAgICAgIHN1ZmZpeDogc3VmZml4XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09ICQudWkua2V5Q29kZS5FTlRFUikge1xuICAgICAgICAgICAgICAgIGlmICghc2VsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJHBhZ2UgPSAkaXRlbS5wYXJlbnQoKS5wYXJlbnQoKTtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gJHRleHRhcmVhLnZhbCgpO1xuICAgICAgICAgICAgICAgIHByZWZpeCA9IHRleHQuc3Vic3RyaW5nKDAsIHNlbC5zdGFydCk7XG4gICAgICAgICAgICAgICAgc3VmZml4ID0gdGV4dC5zdWJzdHJpbmcoc2VsLmVuZCk7XG4gICAgICAgICAgICAgICAgaWYgKHByZWZpeCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgJHRleHRhcmVhLnZhbChzdWZmaXgpO1xuICAgICAgICAgICAgICAgICAgICAkdGV4dGFyZWEuZm9jdXNvdXQoKTtcbiAgICAgICAgICAgICAgICAgICAgc3Bhd25FZGl0b3IoJHBhZ2UsICRpdGVtLnByZXYoKSwgcHJlZml4LCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkdGV4dGFyZWEudmFsKHByZWZpeCk7XG4gICAgICAgICAgICAgICAgICAgICR0ZXh0YXJlYS5mb2N1c291dCgpO1xuICAgICAgICAgICAgICAgICAgICBzcGF3bkVkaXRvcigkcGFnZSwgJGl0ZW0sIHN1ZmZpeCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgZm9jdXNvdXRIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJHBhZ2U7XG4gICAgICAgICRpdGVtLnJlbW92ZUNsYXNzKCd0ZXh0RWRpdGluZycpO1xuICAgICAgICAkdGV4dGFyZWEudW5iaW5kKCk7XG4gICAgICAgICRwYWdlID0gJGl0ZW0ucGFyZW50cygnLnBhZ2U6Zmlyc3QnKTtcbiAgICAgICAgaWYgKGl0ZW1bb3B0aW9uLmZpZWxkIHx8ICd0ZXh0J10gPSAkdGV4dGFyZWEudmFsKCkpIHtcbiAgICAgICAgICAgIHBsdWdpbltcImRvXCJdKCRpdGVtLmVtcHR5KCksIGl0ZW0pO1xuICAgICAgICAgICAgaWYgKG9wdGlvbi5hZnRlcikge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtW29wdGlvbi5maWVsZCB8fCAndGV4dCddID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhZ2VIYW5kbGVyLnB1dCgkcGFnZSwge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYWRkJyxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW0sXG4gICAgICAgICAgICAgICAgICAgIGFmdGVyOiBvcHRpb24uYWZ0ZXJcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1bb3B0aW9uLmZpZWxkIHx8ICd0ZXh0J10gPT09IG9yaWdpbmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFnZUhhbmRsZXIucHV0KCRwYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdlZGl0JyxcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghb3B0aW9uLmFmdGVyKSB7XG4gICAgICAgICAgICAgICAgcGFnZUhhbmRsZXIucHV0KCRwYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdyZW1vdmUnLFxuICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJGl0ZW0ucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcbiAgICBpZiAoJGl0ZW0uaGFzQ2xhc3MoJ3RleHRFZGl0aW5nJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAkaXRlbS5hZGRDbGFzcygndGV4dEVkaXRpbmcnKTtcbiAgICAkaXRlbS51bmJpbmQoKTtcbiAgICBvcmlnaW5hbCA9IChyZWYgPSBpdGVtW29wdGlvbi5maWVsZCB8fCAndGV4dCddKSAhPSBudWxsID8gcmVmIDogJyc7XG4gICAgJHRleHRhcmVhID0gJChcIjx0ZXh0YXJlYT5cIiArIChlc2NhcGUob3JpZ2luYWwpKSArIChlc2NhcGUoKHJlZjEgPSBvcHRpb24uc3VmZml4KSAhPSBudWxsID8gcmVmMSA6ICcnKSkgKyBcIjwvdGV4dGFyZWE+XCIpLmZvY3Vzb3V0KGZvY3Vzb3V0SGFuZGxlcikuYmluZCgna2V5ZG93bicsIGtleWRvd25IYW5kbGVyKTtcbiAgICAkaXRlbS5odG1sKCR0ZXh0YXJlYSk7XG4gICAgaWYgKG9wdGlvbi5jYXJldCkge1xuICAgICAgICByZXR1cm4gc2V0Q2FyZXRQb3NpdGlvbigkdGV4dGFyZWEsIG9wdGlvbi5jYXJldCk7XG4gICAgfSBlbHNlIGlmIChvcHRpb24uYXBwZW5kKSB7XG4gICAgICAgIHNldENhcmV0UG9zaXRpb24oJHRleHRhcmVhLCAkdGV4dGFyZWEudmFsKCkubGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuICR0ZXh0YXJlYS5zY3JvbGxUb3AoJHRleHRhcmVhWzBdLnNjcm9sbEhlaWdodCAtICR0ZXh0YXJlYS5oZWlnaHQoKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICR0ZXh0YXJlYS5mb2N1cygpO1xuICAgIH1cbn07XG5cbnNwYXduRWRpdG9yID0gZnVuY3Rpb24gKCRwYWdlLCAkYmVmb3JlLCB0ZXh0KSB7XG4gICAgdmFyICRpdGVtLCBiZWZvcmUsIGl0ZW07XG4gICAgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgICAgIGlkOiByYW5kb20uaXRlbUlkKCksXG4gICAgICAgIHRleHQ6IHRleHRcbiAgICB9O1xuICAgICRpdGVtID0gJChcIjxkaXYgY2xhc3M9XFxcIml0ZW0gcGFyYWdyYXBoXFxcIiBkYXRhLWlkPVwiICsgaXRlbS5pZCArIFwiPjwvZGl2PlwiKTtcbiAgICAkaXRlbS5kYXRhKCdpdGVtJywgaXRlbSkuZGF0YSgncGFnZUVsZW1lbnQnLCAkcGFnZSk7XG4gICAgJGJlZm9yZS5hZnRlcigkaXRlbSk7XG4gICAgcGx1Z2luW1wiZG9cIl0oJGl0ZW0sIGl0ZW0pO1xuICAgIGJlZm9yZSA9IGl0ZW16LmdldEl0ZW0oJGJlZm9yZSk7XG4gICAgcmV0dXJuIHRleHRFZGl0b3IoJGl0ZW0sIGl0ZW0sIHtcbiAgICAgICAgYWZ0ZXI6IGJlZm9yZSAhPSBudWxsID8gYmVmb3JlLmlkIDogdm9pZCAwXG4gICAgfSk7XG59O1xuXG5nZXRTZWxlY3Rpb25Qb3MgPSBmdW5jdGlvbiAoJHRleHRhcmVhKSB7XG4gICAgdmFyIGVsLCBpZVBvcywgc2VsO1xuICAgIGVsID0gJHRleHRhcmVhLmdldCgwKTtcbiAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgIGVsLmZvY3VzKCk7XG4gICAgICAgIHNlbCA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICAgICAgICBzZWwubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtZWwudmFsdWUubGVuZ3RoKTtcbiAgICAgICAgaWVQb3MgPSBzZWwudGV4dC5sZW5ndGg7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBzdGFydDogaWVQb3MsXG4gICAgICAgICAgICBlbmQ6IGllUG9zXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0OiBlbC5zZWxlY3Rpb25TdGFydCxcbiAgICAgICAgICAgIGVuZDogZWwuc2VsZWN0aW9uRW5kXG4gICAgICAgIH07XG4gICAgfVxufTtcblxuc2V0Q2FyZXRQb3NpdGlvbiA9IGZ1bmN0aW9uICgkdGV4dGFyZWEsIGNhcmV0UG9zKSB7XG4gICAgdmFyIGVsLCByYW5nZTtcbiAgICBlbCA9ICR0ZXh0YXJlYS5nZXQoMCk7XG4gICAgaWYgKGVsICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGVsLmNyZWF0ZVRleHRSYW5nZSkge1xuICAgICAgICAgICAgcmFuZ2UgPSBlbC5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgICAgIHJhbmdlLm1vdmUoXCJjaGFyYWN0ZXJcIiwgY2FyZXRQb3MpO1xuICAgICAgICAgICAgcmFuZ2Uuc2VsZWN0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbC5zZXRTZWxlY3Rpb25SYW5nZShjYXJldFBvcywgY2FyZXRQb3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBlbC5mb2N1cygpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRleHRFZGl0b3I6IHRleHRFZGl0b3Jcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYXJyYXlUb0pzb24sIGJpbmQsIGNzdlRvQXJyYXksIGRyb3AsIGVkaXRvciwgZW1pdCwgZXNjYXBlLCBuZWlnaGJvcmhvb2QsIHBhZ2VIYW5kbGVyLCBwbHVnaW4sIHJlc29sdmUsIHN5bm9wc2lzO1xuXG5uZWlnaGJvcmhvb2QgPSByZXF1aXJlKCcuL25laWdoYm9yaG9vZCcpO1xuXG5wbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpO1xuXG5yZXNvbHZlID0gcmVxdWlyZSgnLi9yZXNvbHZlJyk7XG5cbnBhZ2VIYW5kbGVyID0gcmVxdWlyZSgnLi9wYWdlSGFuZGxlcicpO1xuXG5lZGl0b3IgPSByZXF1aXJlKCcuL2VkaXRvcicpO1xuXG5zeW5vcHNpcyA9IHJlcXVpcmUoJy4vc3lub3BzaXMnKTtcblxuZHJvcCA9IHJlcXVpcmUoJy4vZHJvcCcpO1xuXG5lc2NhcGUgPSBmdW5jdGlvbiAobGluZSkge1xuICAgIHJldHVybiBsaW5lLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKS5yZXBsYWNlKC9cXG4vZywgJzxicj4nKTtcbn07XG5cbmVtaXQgPSBmdW5jdGlvbiAoJGl0ZW0sIGl0ZW0pIHtcbiAgICB2YXIgc2hvd01lbnUsIHNob3dQcm9tcHQ7XG4gICAgJGl0ZW0uYXBwZW5kKCc8cD5Eb3VibGUtQ2xpY2sgdG8gRWRpdDxicj5Ecm9wIFRleHQgb3IgSW1hZ2UgdG8gSW5zZXJ0PC9wPicpO1xuICAgIHNob3dNZW51ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY29sdW1uLCBpLCBpbmZvLCBsZW4sIG1lbnUsIHJlZjtcbiAgICAgICAgbWVudSA9ICRpdGVtLmZpbmQoJ3AnKS5hcHBlbmQoXCI8YnI+T3IgQ2hvb3NlIGEgUGx1Z2luXFxuPGNlbnRlcj5cXG48dGFibGUgc3R5bGU9XFxcInRleHQtYWxpZ246bGVmdDtcXFwiPlxcbjx0cj48dGQ+PHVsIGlkPWZvcm1hdD48dGQ+PHVsIGlkPWRhdGE+PHRkPjx1bCBpZD1vdGhlcj5cIik7XG4gICAgICAgIHJlZiA9IHdpbmRvdy5jYXRhbG9nO1xuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIGluZm8gPSByZWZbaV07XG4gICAgICAgICAgICBjb2x1bW4gPSBpbmZvLmNhdGVnb3J5IHx8ICdvdGhlcic7XG4gICAgICAgICAgICBpZiAoY29sdW1uICE9PSAnZm9ybWF0JyAmJiBjb2x1bW4gIT09ICdkYXRhJykge1xuICAgICAgICAgICAgICAgIGNvbHVtbiA9ICdvdGhlcic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZW51LmZpbmQoJyMnICsgY29sdW1uKS5hcHBlbmQoXCI8bGk+PGEgY2xhc3M9XFxcIm1lbnVcXFwiIGhyZWY9XFxcIiNcXFwiIHRpdGxlPVxcXCJcIiArIGluZm8udGl0bGUgKyBcIlxcXCI+XCIgKyBpbmZvLm5hbWUgKyBcIjwvYT48L2xpPlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWVudS5maW5kKCdhLm1lbnUnKS5jbGljayhmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAkaXRlbS5yZW1vdmVDbGFzcygnZmFjdG9yeScpLmFkZENsYXNzKGl0ZW0udHlwZSA9IGV2dC50YXJnZXQudGV4dC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgICAgICAgICRpdGVtLnVuYmluZCgpO1xuICAgICAgICAgICAgcmV0dXJuIGVkaXRvci50ZXh0RWRpdG9yKCRpdGVtLCBpdGVtKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBzaG93UHJvbXB0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGl0ZW0uYXBwZW5kKFwiPHA+XCIgKyAocmVzb2x2ZS5yZXNvbHZlTGlua3MoaXRlbS5wcm9tcHQsIGVzY2FwZSkpICsgXCI8L2I+XCIpO1xuICAgIH07XG4gICAgaWYgKGl0ZW0ucHJvbXB0KSB7XG4gICAgICAgIHJldHVybiBzaG93UHJvbXB0KCk7XG4gICAgfSBlbHNlIGlmICh3aW5kb3cuY2F0YWxvZyAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBzaG93TWVudSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAkLmdldEpTT04oJy9zeXN0ZW0vZmFjdG9yaWVzLmpzb24nLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgd2luZG93LmNhdGFsb2cgPSBkYXRhO1xuICAgICAgICAgICAgcmV0dXJuIHNob3dNZW51KCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmJpbmQgPSBmdW5jdGlvbiAoJGl0ZW0sIGl0ZW0pIHtcbiAgICB2YXIgYWRkUmVmZXJlbmNlLCBhZGRWaWRlbywgcHVudCwgcmVhZEZpbGUsIHN5bmNFZGl0QWN0aW9uO1xuICAgIHN5bmNFZGl0QWN0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgJHBhZ2UsIGVycjtcbiAgICAgICAgJGl0ZW0uZW1wdHkoKS51bmJpbmQoKTtcbiAgICAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoXCJmYWN0b3J5XCIpLmFkZENsYXNzKGl0ZW0udHlwZSk7XG4gICAgICAgICRwYWdlID0gJGl0ZW0ucGFyZW50cygnLnBhZ2U6Zmlyc3QnKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICRpdGVtLmRhdGEoJ3BhZ2VFbGVtZW50JywgJHBhZ2UpO1xuICAgICAgICAgICAgJGl0ZW0uZGF0YSgnaXRlbScsIGl0ZW0pO1xuICAgICAgICAgICAgcGx1Z2luLmdldFBsdWdpbihpdGVtLnR5cGUsIGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICAgICAgICAgICAgICBwbHVnaW4uZW1pdCgkaXRlbSwgaXRlbSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBsdWdpbi5iaW5kKCRpdGVtLCBpdGVtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgICAgIGVyciA9IF9lcnJvcjtcbiAgICAgICAgICAgICRpdGVtLmFwcGVuZChcIjxwIGNsYXNzPSdlcnJvcic+XCIgKyBlcnIgKyBcIjwvcD5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhZ2VIYW5kbGVyLnB1dCgkcGFnZSwge1xuICAgICAgICAgICAgdHlwZTogJ2VkaXQnLFxuICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcHVudCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGl0ZW0ucHJvbXB0ID0gXCJVbmV4cGVjdGVkIEl0ZW1cXG5XZSBjYW4ndCBtYWtlIHNlbnNlIG9mIHRoZSBkcm9wLlxcblRyeSBzb21ldGhpbmcgZWxzZSBvciBzZWUgW1tBYm91dCBGYWN0b3J5IFBsdWdpbl1dLlwiO1xuICAgICAgICBkYXRhLnVzZXJBZ2VudCA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG4gICAgICAgIGl0ZW0ucHVudCA9IGRhdGE7XG4gICAgICAgIHJldHVybiBzeW5jRWRpdEFjdGlvbigpO1xuICAgIH07XG4gICAgYWRkUmVmZXJlbmNlID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuICQuZ2V0SlNPTihcImh0dHA6Ly9cIiArIGRhdGEuc2l0ZSArIFwiL1wiICsgZGF0YS5zbHVnICsgXCIuanNvblwiLCBmdW5jdGlvbiAocmVtb3RlKSB7XG4gICAgICAgICAgICBpdGVtLnR5cGUgPSAncmVmZXJlbmNlJztcbiAgICAgICAgICAgIGl0ZW0uc2l0ZSA9IGRhdGEuc2l0ZTtcbiAgICAgICAgICAgIGl0ZW0uc2x1ZyA9IGRhdGEuc2x1ZztcbiAgICAgICAgICAgIGl0ZW0udGl0bGUgPSByZW1vdGUudGl0bGUgfHwgZGF0YS5zbHVnO1xuICAgICAgICAgICAgaXRlbS50ZXh0ID0gc3lub3BzaXMocmVtb3RlKTtcbiAgICAgICAgICAgIHN5bmNFZGl0QWN0aW9uKCk7XG4gICAgICAgICAgICBpZiAoaXRlbS5zaXRlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmVpZ2hib3Job29kLnJlZ2lzdGVyTmVpZ2hib3IoaXRlbS5zaXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBhZGRWaWRlbyA9IGZ1bmN0aW9uICh2aWRlbykge1xuICAgICAgICBpdGVtLnR5cGUgPSAndmlkZW8nO1xuICAgICAgICBpdGVtLnRleHQgPSB2aWRlby50ZXh0ICsgXCJcXG4oZG91YmxlLWNsaWNrIHRvIGVkaXQgY2FwdGlvbilcXG5cIjtcbiAgICAgICAgcmV0dXJuIHN5bmNFZGl0QWN0aW9uKCk7XG4gICAgfTtcbiAgICByZWFkRmlsZSA9IGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgIHZhciBtYWpvclR5cGUsIG1pbm9yVHlwZSwgcmVhZGVyLCByZWY7XG4gICAgICAgIGlmIChmaWxlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJlZiA9IGZpbGUudHlwZS5zcGxpdChcIi9cIiksIG1ham9yVHlwZSA9IHJlZlswXSwgbWlub3JUeXBlID0gcmVmWzFdO1xuICAgICAgICAgICAgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgIGlmIChtYWpvclR5cGUgPT09IFwiaW1hZ2VcIikge1xuICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAobG9hZEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9ICdpbWFnZSc7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udXJsID0gbG9hZEV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uY2FwdGlvbiB8fCAoaXRlbS5jYXB0aW9uID0gXCJVcGxvYWRlZCBpbWFnZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN5bmNFZGl0QWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVhZGVyLnJlYWRBc0RhdGFVUkwoZmlsZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1ham9yVHlwZSA9PT0gXCJ0ZXh0XCIpIHtcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGxvYWRFdmVudCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyYXksIHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gbG9hZEV2ZW50LnRhcmdldC5yZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtaW5vclR5cGUgPT09ICdjc3YnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnR5cGUgPSAnZGF0YSc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmNvbHVtbnMgPSAoYXJyYXkgPSBjc3ZUb0FycmF5KHJlc3VsdCkpWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5kYXRhID0gYXJyYXlUb0pzb24oYXJyYXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50ZXh0ID0gZmlsZS5maWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9ICdwYXJhZ3JhcGgnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50ZXh0ID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzeW5jRWRpdEFjdGlvbigpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHVudCh7XG4gICAgICAgICAgICAgICAgICAgIGZpbGU6IGZpbGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgJGl0ZW0uZGJsY2xpY2soZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBlZGl0b3IudGV4dEVkaXRvcigkaXRlbSwgaXRlbSwge1xuICAgICAgICAgICAgICAgIGZpZWxkOiAncHJvbXB0J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkaXRlbS5yZW1vdmVDbGFzcygnZmFjdG9yeScpLmFkZENsYXNzKGl0ZW0udHlwZSA9ICdwYXJhZ3JhcGgnKTtcbiAgICAgICAgICAgICRpdGVtLnVuYmluZCgpO1xuICAgICAgICAgICAgcmV0dXJuIGVkaXRvci50ZXh0RWRpdG9yKCRpdGVtLCBpdGVtKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgICRpdGVtLmJpbmQoJ2RyYWdlbnRlcicsIGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgcmV0dXJuIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuICAgICRpdGVtLmJpbmQoJ2RyYWdvdmVyJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG4gICAgcmV0dXJuICRpdGVtLmJpbmQoXCJkcm9wXCIsIGRyb3AuZGlzcGF0Y2goe1xuICAgICAgICBwYWdlOiBhZGRSZWZlcmVuY2UsXG4gICAgICAgIGZpbGU6IHJlYWRGaWxlLFxuICAgICAgICB2aWRlbzogYWRkVmlkZW8sXG4gICAgICAgIHB1bnQ6IHB1bnRcbiAgICB9KSk7XG59O1xuXG5jc3ZUb0FycmF5ID0gZnVuY3Rpb24gKHN0ckRhdGEsIHN0ckRlbGltaXRlcikge1xuICAgIHZhciBhcnJEYXRhLCBhcnJNYXRjaGVzLCBvYmpQYXR0ZXJuLCBzdHJNYXRjaGVkRGVsaW1pdGVyLCBzdHJNYXRjaGVkVmFsdWU7XG4gICAgc3RyRGVsaW1pdGVyID0gc3RyRGVsaW1pdGVyIHx8IFwiLFwiO1xuICAgIG9ialBhdHRlcm4gPSBuZXcgUmVnRXhwKFwiKFxcXFxcIiArIHN0ckRlbGltaXRlciArIFwifFxcXFxyP1xcXFxufFxcXFxyfF4pXCIgKyBcIig/OlxcXCIoW15cXFwiXSooPzpcXFwiXFxcIlteXFxcIl0qKSopXFxcInxcIiArIFwiKFteXFxcIlxcXFxcIiArIHN0ckRlbGltaXRlciArIFwiXFxcXHJcXFxcbl0qKSlcIiwgXCJnaVwiKTtcbiAgICBhcnJEYXRhID0gW1tdXTtcbiAgICBhcnJNYXRjaGVzID0gbnVsbDtcbiAgICB3aGlsZSAoYXJyTWF0Y2hlcyA9IG9ialBhdHRlcm4uZXhlYyhzdHJEYXRhKSkge1xuICAgICAgICBzdHJNYXRjaGVkRGVsaW1pdGVyID0gYXJyTWF0Y2hlc1sxXTtcbiAgICAgICAgaWYgKHN0ck1hdGNoZWREZWxpbWl0ZXIubGVuZ3RoICYmIChzdHJNYXRjaGVkRGVsaW1pdGVyICE9PSBzdHJEZWxpbWl0ZXIpKSB7XG4gICAgICAgICAgICBhcnJEYXRhLnB1c2goW10pO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcnJNYXRjaGVzWzJdKSB7XG4gICAgICAgICAgICBzdHJNYXRjaGVkVmFsdWUgPSBhcnJNYXRjaGVzWzJdLnJlcGxhY2UobmV3IFJlZ0V4cChcIlxcXCJcXFwiXCIsIFwiZ1wiKSwgXCJcXFwiXCIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RyTWF0Y2hlZFZhbHVlID0gYXJyTWF0Y2hlc1szXTtcbiAgICAgICAgfVxuICAgICAgICBhcnJEYXRhW2FyckRhdGEubGVuZ3RoIC0gMV0ucHVzaChzdHJNYXRjaGVkVmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gYXJyRGF0YTtcbn07XG5cbmFycmF5VG9Kc29uID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgdmFyIGNvbHMsIGksIGxlbiwgcmVzdWx0cywgcm93LCByb3dUb09iamVjdDtcbiAgICBjb2xzID0gYXJyYXkuc2hpZnQoKTtcbiAgICByb3dUb09iamVjdCA9IGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgdmFyIGksIGssIGxlbiwgb2JqLCByZWYsIHJlZjEsIHY7XG4gICAgICAgIG9iaiA9IHt9O1xuICAgICAgICByZWYgPSBfLnppcChjb2xzLCByb3cpO1xuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgIHJlZjEgPSByZWZbaV0sIGsgPSByZWYxWzBdLCB2ID0gcmVmMVsxXTtcbiAgICAgICAgICAgIGlmICgodiAhPSBudWxsKSAmJiAodi5tYXRjaCgvXFxTLykpICYmIHYgIT09ICdOVUxMJykge1xuICAgICAgICAgICAgICAgIG9ialtrXSA9IHY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICByb3cgPSBhcnJheVtpXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHJvd1RvT2JqZWN0KHJvdykpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGVtaXQ6IGVtaXQsXG4gICAgYmluZDogYmluZFxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBiaW5kLCBlbWl0LCBuZWlnaGJvcmhvb2QsIHJlc29sdmU7XG5cbnJlc29sdmUgPSByZXF1aXJlKCcuL3Jlc29sdmUnKTtcblxubmVpZ2hib3Job29kID0gcmVxdWlyZSgnLi9uZWlnaGJvcmhvb2QnKTtcblxuZW1pdCA9IGZ1bmN0aW9uKCRpdGVtLCBpdGVtKSB7XG4gIHZhciBpLCBpbmZvLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgJGl0ZW0uYXBwZW5kKGl0ZW0udGV4dCArIFwiPGJyPjxicj48YnV0dG9uIGNsYXNzPVxcXCJjcmVhdGVcXFwiPmNyZWF0ZTwvYnV0dG9uPiBuZXcgYmxhbmsgcGFnZVwiKTtcbiAgaWYgKCgoaW5mbyA9IG5laWdoYm9yaG9vZC5zaXRlc1tsb2NhdGlvbi5ob3N0XSkgIT0gbnVsbCkgJiYgKGluZm8uc2l0ZW1hcCAhPSBudWxsKSkge1xuICAgIHJlZiA9IGluZm8uc2l0ZW1hcDtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgaWYgKGl0ZW0uc2x1Zy5tYXRjaCgvLXRlbXBsYXRlJC8pKSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCgkaXRlbS5hcHBlbmQoXCI8YnI+PGJ1dHRvbiBjbGFzcz1cXFwiY3JlYXRlXFxcIiBkYXRhLXNsdWc9XCIgKyBpdGVtLnNsdWcgKyBcIj5jcmVhdGU8L2J1dHRvbj4gZnJvbSBcIiArIChyZXNvbHZlLnJlc29sdmVMaW5rcyhcIltbXCIgKyBpdGVtLnRpdGxlICsgXCJdXVwiKSkpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufTtcblxuYmluZCA9IGZ1bmN0aW9uKCRpdGVtLCBpdGVtKSB7fTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGVtaXQ6IGVtaXQsXG4gIGJpbmQ6IGJpbmRcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYmluZCwgZGlhbG9nLCBlZGl0b3IsIGVtaXQsIHJlc29sdmU7XG5cbmRpYWxvZyA9IHJlcXVpcmUoJy4vZGlhbG9nJyk7XG5cbmVkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbnJlc29sdmUgPSByZXF1aXJlKCcuL3Jlc29sdmUnKTtcblxuZW1pdCA9IGZ1bmN0aW9uKCRpdGVtLCBpdGVtKSB7XG4gIGl0ZW0udGV4dCB8fCAoaXRlbS50ZXh0ID0gaXRlbS5jYXB0aW9uKTtcbiAgcmV0dXJuICRpdGVtLmFwcGVuZChcIjxpbWcgY2xhc3M9dGh1bWJuYWlsIHNyYz1cXFwiXCIgKyBpdGVtLnVybCArIFwiXFxcIj4gPHA+XCIgKyAocmVzb2x2ZS5yZXNvbHZlTGlua3MoaXRlbS50ZXh0KSkgKyBcIjwvcD5cIik7XG59O1xuXG5iaW5kID0gZnVuY3Rpb24oJGl0ZW0sIGl0ZW0pIHtcbiAgJGl0ZW0uZGJsY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGVkaXRvci50ZXh0RWRpdG9yKCRpdGVtLCBpdGVtKTtcbiAgfSk7XG4gIHJldHVybiAkaXRlbS5maW5kKCdpbWcnKS5kYmxjbGljayhmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlhbG9nLm9wZW4oaXRlbS50ZXh0LCB0aGlzKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZW1pdDogZW1pdCxcbiAgYmluZDogYmluZFxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBjcmVhdGVJdGVtLCBnZXRJdGVtLCBwYWdlSGFuZGxlciwgcGx1Z2luLCByYW5kb20sIHJlbW92ZUl0ZW0sIHJlcGxhY2VJdGVtLCBzbGVlcDtcblxucGFnZUhhbmRsZXIgPSByZXF1aXJlKCcuL3BhZ2VIYW5kbGVyJyk7XG5cbnBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJyk7XG5cbnJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyk7XG5cbnNsZWVwID0gZnVuY3Rpb24odGltZSwgZG9uZSkge1xuICByZXR1cm4gc2V0VGltZW91dChkb25lLCB0aW1lKTtcbn07XG5cbmdldEl0ZW0gPSBmdW5jdGlvbigkaXRlbSkge1xuICBpZiAoJCgkaXRlbSkubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiAkKCRpdGVtKS5kYXRhKFwiaXRlbVwiKSB8fCAkKCRpdGVtKS5kYXRhKCdzdGF0aWNJdGVtJyk7XG4gIH1cbn07XG5cbnJlbW92ZUl0ZW0gPSBmdW5jdGlvbigkaXRlbSwgaXRlbSkge1xuICBwYWdlSGFuZGxlci5wdXQoJGl0ZW0ucGFyZW50cygnLnBhZ2U6Zmlyc3QnKSwge1xuICAgIHR5cGU6ICdyZW1vdmUnLFxuICAgIGlkOiBpdGVtLmlkXG4gIH0pO1xuICByZXR1cm4gJGl0ZW0ucmVtb3ZlKCk7XG59O1xuXG5jcmVhdGVJdGVtID0gZnVuY3Rpb24oJHBhZ2UsICRiZWZvcmUsIGl0ZW0pIHtcbiAgdmFyICRpdGVtLCBiZWZvcmU7XG4gIGlmICgkcGFnZSA9PSBudWxsKSB7XG4gICAgJHBhZ2UgPSAkYmVmb3JlLnBhcmVudHMoJy5wYWdlJyk7XG4gIH1cbiAgaXRlbS5pZCA9IHJhbmRvbS5pdGVtSWQoKTtcbiAgJGl0ZW0gPSAkKFwiPGRpdiBjbGFzcz1cXFwiaXRlbSBcIiArIGl0ZW0udHlwZSArIFwiXFxcIiBkYXRhLWlkPVxcXCJcIiArIFwiXFxcIjwvZGl2PlwiKTtcbiAgJGl0ZW0uZGF0YSgnaXRlbScsIGl0ZW0pLmRhdGEoJ3BhZ2VFbGVtZW50JywgJHBhZ2UpO1xuICBpZiAoJGJlZm9yZSAhPSBudWxsKSB7XG4gICAgJGJlZm9yZS5hZnRlcigkaXRlbSk7XG4gIH0gZWxzZSB7XG4gICAgJHBhZ2UuZmluZCgnLnN0b3J5JykuYXBwZW5kKCRpdGVtKTtcbiAgfVxuICBwbHVnaW5bXCJkb1wiXSgkaXRlbSwgaXRlbSk7XG4gIGJlZm9yZSA9IGdldEl0ZW0oJGJlZm9yZSk7XG4gIHNsZWVwKDUwMCwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHBhZ2VIYW5kbGVyLnB1dCgkcGFnZSwge1xuICAgICAgaXRlbTogaXRlbSxcbiAgICAgIGlkOiBpdGVtLmlkLFxuICAgICAgdHlwZTogJ2FkZCcsXG4gICAgICBhZnRlcjogYmVmb3JlICE9IG51bGwgPyBiZWZvcmUuaWQgOiB2b2lkIDBcbiAgICB9KTtcbiAgfSk7XG4gIHJldHVybiAkaXRlbTtcbn07XG5cbnJlcGxhY2VJdGVtID0gZnVuY3Rpb24oJGl0ZW0sIHR5cGUsIGl0ZW0pIHtcbiAgdmFyICRwYWdlLCBlcnIsIG5ld0l0ZW07XG4gIG5ld0l0ZW0gPSAkLmV4dGVuZCh7fSwgaXRlbSk7XG4gICRpdGVtLmVtcHR5KCkudW5iaW5kKCk7XG4gICRpdGVtLnJlbW92ZUNsYXNzKHR5cGUpLmFkZENsYXNzKG5ld0l0ZW0udHlwZSk7XG4gICRwYWdlID0gJGl0ZW0ucGFyZW50cygnLnBhZ2U6Zmlyc3QnKTtcbiAgdHJ5IHtcbiAgICAkaXRlbS5kYXRhKCdwYWdlRWxlbWVudCcsICRwYWdlKTtcbiAgICAkaXRlbS5kYXRhKCdpdGVtJywgbmV3SXRlbSk7XG4gICAgcGx1Z2luLmdldFBsdWdpbihpdGVtLnR5cGUsIGZ1bmN0aW9uKHBsdWdpbikge1xuICAgICAgcGx1Z2luLmVtaXQoJGl0ZW0sIG5ld0l0ZW0pO1xuICAgICAgcmV0dXJuIHBsdWdpbi5iaW5kKCRpdGVtLCBuZXdJdGVtKTtcbiAgICB9KTtcbiAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgZXJyID0gX2Vycm9yO1xuICAgICRpdGVtLmFwcGVuZChcIjxwIGNsYXNzPSdlcnJvcic+XCIgKyBlcnIgKyBcIjwvcD5cIik7XG4gIH1cbiAgcmV0dXJuIHBhZ2VIYW5kbGVyLnB1dCgkcGFnZSwge1xuICAgIHR5cGU6ICdlZGl0JyxcbiAgICBpZDogbmV3SXRlbS5pZCxcbiAgICBpdGVtOiBuZXdJdGVtXG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZUl0ZW06IGNyZWF0ZUl0ZW0sXG4gIHJlbW92ZUl0ZW06IHJlbW92ZUl0ZW0sXG4gIGdldEl0ZW06IGdldEl0ZW0sXG4gIHJlcGxhY2VJdGVtOiByZXBsYWNlSXRlbVxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhY3RpdmUsIGFzU2x1ZywgZGlhbG9nLCBkcm9wLCBsaW5ldXAsIGxpbmssIHBhZ2VIYW5kbGVyLCByZWZyZXNoLCBzdGF0ZSwgdGFyZ2V0O1xuXG5wYWdlSGFuZGxlciA9IHJlcXVpcmUoJy4vcGFnZUhhbmRsZXInKTtcblxuc3RhdGUgPSByZXF1aXJlKCcuL3N0YXRlJyk7XG5cbmFjdGl2ZSA9IHJlcXVpcmUoJy4vYWN0aXZlJyk7XG5cbnJlZnJlc2ggPSByZXF1aXJlKCcuL3JlZnJlc2gnKTtcblxubGluZXVwID0gcmVxdWlyZSgnLi9saW5ldXAnKTtcblxuZHJvcCA9IHJlcXVpcmUoJy4vZHJvcCcpO1xuXG5kaWFsb2cgPSByZXF1aXJlKCcuL2RpYWxvZycpO1xuXG5saW5rID0gcmVxdWlyZSgnLi9saW5rJyk7XG5cbnRhcmdldCA9IHJlcXVpcmUoJy4vdGFyZ2V0Jyk7XG5cbmFzU2x1ZyA9IHJlcXVpcmUoJy4vcGFnZScpLmFzU2x1ZztcblxuJChmdW5jdGlvbigpIHtcbiAgdmFyIExFRlRBUlJPVywgUklHSFRBUlJPVywgZmluaXNoQ2xpY2ssIGdldFRlbXBsYXRlLCBsaW5ldXBBY3Rpdml0eTtcbiAgZGlhbG9nLmVtaXQoKTtcbiAgTEVGVEFSUk9XID0gMzc7XG4gIFJJR0hUQVJST1cgPSAzOTtcbiAgJChkb2N1bWVudCkua2V5ZG93bihmdW5jdGlvbihldmVudCkge1xuICAgIHZhciBkaXJlY3Rpb24sIG5ld0luZGV4LCBwYWdlcztcbiAgICBkaXJlY3Rpb24gPSAoZnVuY3Rpb24oKSB7XG4gICAgICBzd2l0Y2ggKGV2ZW50LndoaWNoKSB7XG4gICAgICAgIGNhc2UgTEVGVEFSUk9XOlxuICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgY2FzZSBSSUdIVEFSUk9XOlxuICAgICAgICAgIHJldHVybiArMTtcbiAgICAgIH1cbiAgICB9KSgpO1xuICAgIGlmIChkaXJlY3Rpb24gJiYgIShldmVudC50YXJnZXQudGFnTmFtZSA9PT0gXCJURVhUQVJFQVwiKSkge1xuICAgICAgcGFnZXMgPSAkKCcucGFnZScpO1xuICAgICAgbmV3SW5kZXggPSBwYWdlcy5pbmRleCgkKCcuYWN0aXZlJykpICsgZGlyZWN0aW9uO1xuICAgICAgaWYgKCgwIDw9IG5ld0luZGV4ICYmIG5ld0luZGV4IDwgcGFnZXMubGVuZ3RoKSkge1xuICAgICAgICByZXR1cm4gYWN0aXZlLnNldChwYWdlcy5lcShuZXdJbmRleCkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gICQod2luZG93KS5vbigncG9wc3RhdGUnLCBzdGF0ZS5zaG93KTtcbiAgJChkb2N1bWVudCkuYWpheEVycm9yKGZ1bmN0aW9uKGV2ZW50LCByZXF1ZXN0LCBzZXR0aW5ncykge1xuICAgIGlmIChyZXF1ZXN0LnN0YXR1cyA9PT0gMCB8fCByZXF1ZXN0LnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJldHVybiBjb25zb2xlLmxvZygnYWpheCBlcnJvcicsIGV2ZW50LCByZXF1ZXN0LCBzZXR0aW5ncyk7XG4gIH0pO1xuICBnZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKHNsdWcsIGRvbmUpIHtcbiAgICBpZiAoIXNsdWcpIHtcbiAgICAgIHJldHVybiBkb25lKG51bGwpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnZ2V0VGVtcGxhdGUnLCBzbHVnKTtcbiAgICByZXR1cm4gcGFnZUhhbmRsZXIuZ2V0KHtcbiAgICAgIHdoZW5Hb3R0ZW46IGZ1bmN0aW9uKHBhZ2VPYmplY3QsIHNpdGVGb3VuZCkge1xuICAgICAgICByZXR1cm4gZG9uZShwYWdlT2JqZWN0KTtcbiAgICAgIH0sXG4gICAgICB3aGVuTm90R290dGVuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRvbmUobnVsbCk7XG4gICAgICB9LFxuICAgICAgcGFnZUluZm9ybWF0aW9uOiB7XG4gICAgICAgIHNsdWc6IHNsdWdcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgZmluaXNoQ2xpY2sgPSBmdW5jdGlvbihlLCBuYW1lKSB7XG4gICAgdmFyIHBhZ2U7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICghZS5zaGlmdEtleSkge1xuICAgICAgcGFnZSA9ICQoZS50YXJnZXQpLnBhcmVudHMoJy5wYWdlJyk7XG4gICAgfVxuICAgIGxpbmsuZG9JbnRlcm5hbExpbmsobmFtZSwgcGFnZSwgJChlLnRhcmdldCkuZGF0YSgnc2l0ZScpKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG4gICQoJy5tYWluJykuZGVsZWdhdGUoJy5zaG93LXBhZ2Utc291cmNlJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciAkcGFnZSwgcGFnZTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJHBhZ2UgPSAkKHRoaXMpLnBhcmVudCgpLnBhcmVudCgpO1xuICAgIHBhZ2UgPSBsaW5ldXAuYXRLZXkoJHBhZ2UuZGF0YSgna2V5JykpLmdldFJhd1BhZ2UoKTtcbiAgICByZXR1cm4gZGlhbG9nLm9wZW4oXCJKU09OIGZvciBcIiArIHBhZ2UudGl0bGUsICQoJzxwcmUvPicpLnRleHQoSlNPTi5zdHJpbmdpZnkocGFnZSwgbnVsbCwgMikpKTtcbiAgfSkuZGVsZWdhdGUoJy5wYWdlJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIGlmICghJChlLnRhcmdldCkuaXMoXCJhXCIpKSB7XG4gICAgICByZXR1cm4gYWN0aXZlLnNldCh0aGlzKTtcbiAgICB9XG4gIH0pLmRlbGVnYXRlKCcuaW50ZXJuYWwnLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyIG5hbWU7XG4gICAgbmFtZSA9ICQoZS50YXJnZXQpLmRhdGEoJ3BhZ2VOYW1lJyk7XG4gICAgbmFtZSA9IFwiXCIgKyBuYW1lO1xuICAgIHBhZ2VIYW5kbGVyLmNvbnRleHQgPSAkKGUudGFyZ2V0KS5hdHRyKCd0aXRsZScpLnNwbGl0KCcgPT4gJyk7XG4gICAgcmV0dXJuIGZpbmlzaENsaWNrKGUsIG5hbWUpO1xuICB9KS5kZWxlZ2F0ZSgnaW1nLnJlbW90ZScsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgbmFtZTtcbiAgICBuYW1lID0gJChlLnRhcmdldCkuZGF0YSgnc2x1ZycpO1xuICAgIHBhZ2VIYW5kbGVyLmNvbnRleHQgPSBbJChlLnRhcmdldCkuZGF0YSgnc2l0ZScpXTtcbiAgICByZXR1cm4gZmluaXNoQ2xpY2soZSwgbmFtZSk7XG4gIH0pLmRlbGVnYXRlKCcucmV2aXNpb24nLCAnZGJsY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyICRwYWdlLCBhY3Rpb24sIGpzb24sIHBhZ2UsIHJldjtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJHBhZ2UgPSAkKHRoaXMpLnBhcmVudHMoJy5wYWdlJyk7XG4gICAgcGFnZSA9IGxpbmV1cC5hdEtleSgkcGFnZS5kYXRhKCdrZXknKSkuZ2V0UmF3UGFnZSgpO1xuICAgIHJldiA9IHBhZ2Uuam91cm5hbC5sZW5ndGggLSAxO1xuICAgIGFjdGlvbiA9IHBhZ2Uuam91cm5hbFtyZXZdO1xuICAgIGpzb24gPSBKU09OLnN0cmluZ2lmeShhY3Rpb24sIG51bGwsIDIpO1xuICAgIHJldHVybiBkaWFsb2cub3BlbihcIlJldmlzaW9uIFwiICsgcmV2ICsgXCIsIFwiICsgYWN0aW9uLnR5cGUgKyBcIiBhY3Rpb25cIiwgJCgnPHByZS8+JykudGV4dChqc29uKSk7XG4gIH0pLmRlbGVnYXRlKCcuYWN0aW9uJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciAkYWN0aW9uLCAkcGFnZSwga2V5LCBuYW1lLCByZXYsIHNsdWc7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICRhY3Rpb24gPSAkKGUudGFyZ2V0KTtcbiAgICBpZiAoJGFjdGlvbi5pcygnLmZvcmsnKSAmJiAoKG5hbWUgPSAkYWN0aW9uLmRhdGEoJ3NsdWcnKSkgIT0gbnVsbCkpIHtcbiAgICAgIHBhZ2VIYW5kbGVyLmNvbnRleHQgPSBbJGFjdGlvbi5kYXRhKCdzaXRlJyldO1xuICAgICAgcmV0dXJuIGZpbmlzaENsaWNrKGUsIChuYW1lLnNwbGl0KCdfJykpWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHBhZ2UgPSAkKHRoaXMpLnBhcmVudHMoJy5wYWdlJyk7XG4gICAgICBrZXkgPSAkcGFnZS5kYXRhKCdrZXknKTtcbiAgICAgIHNsdWcgPSBsaW5ldXAuYXRLZXkoa2V5KS5nZXRTbHVnKCk7XG4gICAgICByZXYgPSAkKHRoaXMpLnBhcmVudCgpLmNoaWxkcmVuKCkubm90KCcuc2VwYXJhdG9yJykuaW5kZXgoJGFjdGlvbik7XG4gICAgICBpZiAocmV2IDwgMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgJHBhZ2UubmV4dEFsbCgpLnJlbW92ZSgpO1xuICAgICAgfVxuICAgICAgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICAgIGxpbmV1cC5yZW1vdmVBbGxBZnRlcktleShrZXkpO1xuICAgICAgfVxuICAgICAgbGluay5jcmVhdGVQYWdlKHNsdWcgKyBcIl9yZXZcIiArIHJldiwgJHBhZ2UuZGF0YSgnc2l0ZScpKS5hcHBlbmRUbygkKCcubWFpbicpKS5lYWNoKHJlZnJlc2guY3ljbGUpO1xuICAgICAgcmV0dXJuIGFjdGl2ZS5zZXQoJCgnLnBhZ2UnKS5sYXN0KCkpO1xuICAgIH1cbiAgfSkuZGVsZWdhdGUoJy5mb3JrLXBhZ2UnLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyICRwYWdlLCBhY3Rpb24sIHBhZ2VPYmplY3Q7XG4gICAgJHBhZ2UgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCcucGFnZScpO1xuICAgIHBhZ2VPYmplY3QgPSBsaW5ldXAuYXRLZXkoJHBhZ2UuZGF0YSgna2V5JykpO1xuICAgIGFjdGlvbiA9IHtcbiAgICAgIHR5cGU6ICdmb3JrJ1xuICAgIH07XG4gICAgaWYgKCRwYWdlLmhhc0NsYXNzKCdsb2NhbCcpKSB7XG4gICAgICBpZiAocGFnZUhhbmRsZXIudXNlTG9jYWxTdG9yYWdlKCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgJHBhZ2UucmVtb3ZlQ2xhc3MoJ2xvY2FsJyk7XG4gICAgfSBlbHNlIGlmIChwYWdlT2JqZWN0LmlzUmVtb3RlKCkpIHtcbiAgICAgIGFjdGlvbi5zaXRlID0gcGFnZU9iamVjdC5nZXRSZW1vdGVTaXRlKCk7XG4gICAgfVxuICAgIGlmICgkcGFnZS5kYXRhKCdyZXYnKSAhPSBudWxsKSB7XG4gICAgICAkcGFnZS5yZW1vdmVDbGFzcygnZ2hvc3QnKTtcbiAgICAgICRwYWdlLmZpbmQoJy5yZXZpc2lvbicpLnJlbW92ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gcGFnZUhhbmRsZXIucHV0KCRwYWdlLCBhY3Rpb24pO1xuICB9KS5kZWxlZ2F0ZSgnYnV0dG9uLmNyZWF0ZScsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4gZ2V0VGVtcGxhdGUoJChlLnRhcmdldCkuZGF0YSgnc2x1ZycpLCBmdW5jdGlvbih0ZW1wbGF0ZSkge1xuICAgICAgdmFyICRwYWdlLCBwYWdlLCBwYWdlT2JqZWN0O1xuICAgICAgJHBhZ2UgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICAgICAgJHBhZ2UucmVtb3ZlQ2xhc3MoJ2dob3N0Jyk7XG4gICAgICBwYWdlT2JqZWN0ID0gbGluZXVwLmF0S2V5KCRwYWdlLmRhdGEoJ2tleScpKTtcbiAgICAgIHBhZ2VPYmplY3QuYmVjb21lKHRlbXBsYXRlKTtcbiAgICAgIHBhZ2UgPSBwYWdlT2JqZWN0LmdldFJhd1BhZ2UoKTtcbiAgICAgIHJlZnJlc2gucmVidWlsZFBhZ2UocGFnZU9iamVjdCwgJHBhZ2UuZW1wdHkoKSk7XG4gICAgICByZXR1cm4gcGFnZUhhbmRsZXIucHV0KCRwYWdlLCB7XG4gICAgICAgIHR5cGU6ICdjcmVhdGUnLFxuICAgICAgICBpZDogcGFnZS5pZCxcbiAgICAgICAgaXRlbToge1xuICAgICAgICAgIHRpdGxlOiBwYWdlLnRpdGxlLFxuICAgICAgICAgIHN0b3J5OiBwYWdlLnN0b3J5XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KS5kZWxlZ2F0ZSgnLnNjb3JlJywgJ2hvdmVyJywgZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiAkKCcubWFpbicpLnRyaWdnZXIoJ3RodW1iJywgJChlLnRhcmdldCkuZGF0YSgndGh1bWInKSk7XG4gIH0pLmJpbmQoJ2RyYWdlbnRlcicsIGZ1bmN0aW9uKGV2dCkge1xuICAgIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKTtcbiAgfSkuYmluZCgnZHJhZ292ZXInLCBmdW5jdGlvbihldnQpIHtcbiAgICByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gIH0pLmJpbmQoXCJkcm9wXCIsIGRyb3AuZGlzcGF0Y2goe1xuICAgIHBhZ2U6IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiBsaW5rLmRvSW50ZXJuYWxMaW5rKGl0ZW0uc2x1ZywgbnVsbCwgaXRlbS5zaXRlKTtcbiAgICB9XG4gIH0pKTtcbiAgJChcIi5wcm92aWRlciBpbnB1dFwiKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAkKFwiZm9vdGVyIGlucHV0OmZpcnN0XCIpLnZhbCgkKHRoaXMpLmF0dHIoJ2RhdGEtcHJvdmlkZXInKSk7XG4gICAgcmV0dXJuICQoXCJmb290ZXIgZm9ybVwiKS5zdWJtaXQoKTtcbiAgfSk7XG4gICQoJ2JvZHknKS5vbignbmV3LW5laWdoYm9yLWRvbmUnLCBmdW5jdGlvbihlLCBuZWlnaGJvcikge1xuICAgIHJldHVybiAkKCcucGFnZScpLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgIHJldHVybiByZWZyZXNoLmVtaXRUd2lucygkKGVsZW1lbnQpKTtcbiAgICB9KTtcbiAgfSk7XG4gIGxpbmV1cEFjdGl2aXR5ID0gcmVxdWlyZSgnLi9saW5ldXBBY3Rpdml0eScpO1xuICAkKFwiPHNwYW4gY2xhc3M9bWVudT4gJm5ic3A7ICZlcXVpdjsgJm5ic3A7IDwvc3Bhbj5cIikuY3NzKHtcbiAgICBcImN1cnNvclwiOiBcInBvaW50ZXJcIixcbiAgICBcImZvbnQtc2l6ZVwiOiBcIjEyMCVcIlxuICB9KS5hcHBlbmRUbygnZm9vdGVyJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRpYWxvZy5vcGVuKFwiTGluZXVwIEFjdGl2aXR5XCIsIGxpbmV1cEFjdGl2aXR5LnNob3coKSk7XG4gIH0pO1xuICB0YXJnZXQuYmluZCgpO1xuICByZXR1cm4gJChmdW5jdGlvbigpIHtcbiAgICBzdGF0ZS5maXJzdCgpO1xuICAgICQoJy5wYWdlJykuZWFjaChyZWZyZXNoLmN5Y2xlKTtcbiAgICByZXR1cm4gYWN0aXZlLnNldCgkKCcucGFnZScpLmxhc3QoKSk7XG4gIH0pO1xufSk7XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYWRkUGFnZSwgYXRLZXksIGJlc3RUaXRsZSwgY3J1bWJzLCBkZWJ1Z0tleXMsIGRlYnVnUmVzZXQsIGRlYnVnU2VsZkNoZWNrLCBrZXlCeUluZGV4LCBsZWZ0S2V5LCBwYWdlQnlLZXksIHJhbmRvbSwgcmVtb3ZlQWxsQWZ0ZXJLZXksIHJlbW92ZUtleSwgdGl0bGVBdEtleSxcbiAgaW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24oaXRlbSkgeyBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7IGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7IH0gcmV0dXJuIC0xOyB9O1xuXG5yYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpO1xuXG5wYWdlQnlLZXkgPSB7fTtcblxua2V5QnlJbmRleCA9IFtdO1xuXG5hZGRQYWdlID0gZnVuY3Rpb24ocGFnZU9iamVjdCkge1xuICB2YXIga2V5O1xuICBrZXkgPSByYW5kb20ucmFuZG9tQnl0ZXMoNCk7XG4gIHBhZ2VCeUtleVtrZXldID0gcGFnZU9iamVjdDtcbiAga2V5QnlJbmRleC5wdXNoKGtleSk7XG4gIHJldHVybiBrZXk7XG59O1xuXG5yZW1vdmVLZXkgPSBmdW5jdGlvbihrZXkpIHtcbiAgaWYgKGluZGV4T2YuY2FsbChrZXlCeUluZGV4LCBrZXkpIDwgMCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGtleUJ5SW5kZXggPSBrZXlCeUluZGV4LmZpbHRlcihmdW5jdGlvbihlYWNoKSB7XG4gICAgcmV0dXJuIGtleSAhPT0gZWFjaDtcbiAgfSk7XG4gIGRlbGV0ZSBwYWdlQnlLZXlba2V5XTtcbiAgcmV0dXJuIGtleTtcbn07XG5cbnJlbW92ZUFsbEFmdGVyS2V5ID0gZnVuY3Rpb24oa2V5KSB7XG4gIHZhciByZXN1bHQsIHVud2FudGVkO1xuICByZXN1bHQgPSBbXTtcbiAgaWYgKGluZGV4T2YuY2FsbChrZXlCeUluZGV4LCBrZXkpIDwgMCkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgd2hpbGUgKGtleUJ5SW5kZXhba2V5QnlJbmRleC5sZW5ndGggLSAxXSAhPT0ga2V5KSB7XG4gICAgdW53YW50ZWQgPSBrZXlCeUluZGV4LnBvcCgpO1xuICAgIHJlc3VsdC51bnNoaWZ0KHVud2FudGVkKTtcbiAgICBkZWxldGUgcGFnZUJ5S2V5W3Vud2FudGVkXTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxuYXRLZXkgPSBmdW5jdGlvbihrZXkpIHtcbiAgcmV0dXJuIHBhZ2VCeUtleVtrZXldO1xufTtcblxudGl0bGVBdEtleSA9IGZ1bmN0aW9uKGtleSkge1xuICByZXR1cm4gYXRLZXkoa2V5KS5nZXRUaXRsZSgpO1xufTtcblxuYmVzdFRpdGxlID0gZnVuY3Rpb24oKSB7XG4gIGlmICgha2V5QnlJbmRleC5sZW5ndGgpIHtcbiAgICByZXR1cm4gXCJXaWtpXCI7XG4gIH1cbiAgcmV0dXJuIHRpdGxlQXRLZXkoa2V5QnlJbmRleFtrZXlCeUluZGV4Lmxlbmd0aCAtIDFdKTtcbn07XG5cbmRlYnVnS2V5cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4ga2V5QnlJbmRleDtcbn07XG5cbmRlYnVnUmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgcGFnZUJ5S2V5ID0ge307XG4gIHJldHVybiBrZXlCeUluZGV4ID0gW107XG59O1xuXG5kZWJ1Z1NlbGZDaGVjayA9IGZ1bmN0aW9uKGtleXMpIHtcbiAgdmFyIGhhdmUsIGtleXNCeUluZGV4LCB3YW50O1xuICBpZiAoKGhhdmUgPSBcIlwiICsga2V5QnlJbmRleCkgPT09ICh3YW50ID0gXCJcIiArIGtleXMpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnNvbGUubG9nKCdUaGUgbGluZXVwIGlzIG91dCBvZiBzeW5jIHdpdGggdGhlIGRvbS4nKTtcbiAgY29uc29sZS5sb2coXCIucGFnZXM6XCIsIGtleXMpO1xuICBjb25zb2xlLmxvZyhcImxpbmV1cDpcIiwga2V5QnlJbmRleCk7XG4gIGlmICgoXCJcIiArIChPYmplY3Qua2V5cyhrZXlCeUluZGV4KS5zb3J0KCkpKSAhPT0gKFwiXCIgKyAoT2JqZWN0LmtleXMoa2V5cykuc29ydCgpKSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc29sZS5sb2coJ0l0IGxvb2tzIGxpa2UgYW4gb3JkZXJpbmcgcHJvYmxlbSB3ZSBjYW4gZml4LicpO1xuICByZXR1cm4ga2V5c0J5SW5kZXggPSBrZXlzO1xufTtcblxubGVmdEtleSA9IGZ1bmN0aW9uKGtleSkge1xuICB2YXIgcG9zO1xuICBwb3MgPSBrZXlCeUluZGV4LmluZGV4T2Yoa2V5KTtcbiAgaWYgKHBvcyA8IDEpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ga2V5QnlJbmRleFtwb3MgLSAxXTtcbn07XG5cbmNydW1icyA9IGZ1bmN0aW9uKGtleSwgbG9jYXRpb24pIHtcbiAgdmFyIGFkamFjZW50LCBob3N0LCBsZWZ0LCBwYWdlLCByZXN1bHQsIHNsdWc7XG4gIHBhZ2UgPSBwYWdlQnlLZXlba2V5XTtcbiAgaG9zdCA9IHBhZ2UuZ2V0UmVtb3RlU2l0ZShsb2NhdGlvbik7XG4gIHJlc3VsdCA9IFsndmlldycsIHNsdWcgPSBwYWdlLmdldFNsdWcoKV07XG4gIGlmIChzbHVnICE9PSAnaW5kZXgnKSB7XG4gICAgcmVzdWx0LnVuc2hpZnQoJ3ZpZXcnLCAnaW5kZXgnKTtcbiAgfVxuICBpZiAoaG9zdCAhPT0gbG9jYXRpb24gJiYgKChsZWZ0ID0gbGVmdEtleShrZXkpKSAhPSBudWxsKSkge1xuICAgIGlmICghKGFkamFjZW50ID0gcGFnZUJ5S2V5W2xlZnRdKS5pc1JlbW90ZSgpKSB7XG4gICAgICByZXN1bHQucHVzaChsb2NhdGlvbiwgYWRqYWNlbnQuZ2V0U2x1ZygpKTtcbiAgICB9XG4gIH1cbiAgcmVzdWx0LnVuc2hpZnQoaG9zdCk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWRkUGFnZTogYWRkUGFnZSxcbiAgcmVtb3ZlS2V5OiByZW1vdmVLZXksXG4gIHJlbW92ZUFsbEFmdGVyS2V5OiByZW1vdmVBbGxBZnRlcktleSxcbiAgYXRLZXk6IGF0S2V5LFxuICB0aXRsZUF0S2V5OiB0aXRsZUF0S2V5LFxuICBiZXN0VGl0bGU6IGJlc3RUaXRsZSxcbiAgZGVidWdLZXlzOiBkZWJ1Z0tleXMsXG4gIGRlYnVnUmVzZXQ6IGRlYnVnUmVzZXQsXG4gIGNydW1iczogY3J1bWJzLFxuICBkZWJ1Z1NlbGZDaGVjazogZGVidWdTZWxmQ2hlY2tcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYWN0aXZpdHksIGRheSwgaG91ciwgbGluZXVwLCBtaW51dGUsIHJvdywgc2Vjb25kLCBzaG93LCBzcGFya3MsIHRhYmxlO1xuXG5saW5ldXAgPSByZXF1aXJlKCcuL2xpbmV1cCcpO1xuXG5kYXkgPSAyNCAqIChob3VyID0gNjAgKiAobWludXRlID0gNjAgKiAoc2Vjb25kID0gMTAwMCkpKTtcblxuYWN0aXZpdHkgPSBmdW5jdGlvbihqb3VybmFsLCBmcm9tLCB0bykge1xuICB2YXIgYWN0aW9uLCBpLCBsZW47XG4gIGZvciAoaSA9IDAsIGxlbiA9IGpvdXJuYWwubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBhY3Rpb24gPSBqb3VybmFsW2ldO1xuICAgIGlmICgoYWN0aW9uLmRhdGUgIT0gbnVsbCkgJiYgZnJvbSA8IGFjdGlvbi5kYXRlICYmIGFjdGlvbi5kYXRlIDw9IHRvKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuc3BhcmtzID0gZnVuY3Rpb24oam91cm5hbCkge1xuICB2YXIgZGF5cywgZnJvbSwgaSwgbGluZSwgcmVmO1xuICBsaW5lID0gJyc7XG4gIGRheXMgPSA2MDtcbiAgZnJvbSA9IChuZXcgRGF0ZSkuZ2V0VGltZSgpIC0gZGF5cyAqIGRheTtcbiAgZm9yIChpID0gMSwgcmVmID0gZGF5czsgMSA8PSByZWYgPyBpIDw9IHJlZiA6IGkgPj0gcmVmOyAxIDw9IHJlZiA/IGkrKyA6IGktLSkge1xuICAgIGxpbmUgKz0gYWN0aXZpdHkoam91cm5hbCwgZnJvbSwgZnJvbSArIGRheSkgPyAnfCcgOiAnLic7XG4gICAgaWYgKChuZXcgRGF0ZShmcm9tKSkuZ2V0RGF5KCkgPT09IDUpIHtcbiAgICAgIGxpbmUgKz0gJzx0ZD4nO1xuICAgIH1cbiAgICBmcm9tICs9IGRheTtcbiAgfVxuICByZXR1cm4gbGluZTtcbn07XG5cbnJvdyA9IGZ1bmN0aW9uKHBhZ2UpIHtcbiAgdmFyIHJlbW90ZSwgdGl0bGU7XG4gIHJlbW90ZSA9IHBhZ2UuZ2V0UmVtb3RlU2l0ZShsb2NhdGlvbi5ob3N0KTtcbiAgdGl0bGUgPSBwYWdlLmdldFRpdGxlKCk7XG4gIHJldHVybiBcIjx0cj48dGQgYWxpZ249cmlnaHQ+XFxuICBcIiArIChzcGFya3MocGFnZS5nZXRSYXdQYWdlKCkuam91cm5hbCkpICsgXCJcXG48dGQ+XFxuICA8aW1nIGNsYXNzPVxcXCJyZW1vdGVcXFwiIHNyYz1cXFwiLy9cIiArIHJlbW90ZSArIFwiL2Zhdmljb24ucG5nXFxcIj5cXG4gIFwiICsgdGl0bGU7XG59O1xuXG50YWJsZSA9IGZ1bmN0aW9uKGtleXMpIHtcbiAgdmFyIGtleTtcbiAgcmV0dXJuIFwiPHRhYmxlPlxcblwiICsgKCgoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGxlbiwgcmVzdWx0cztcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0ga2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIHJlc3VsdHMucHVzaChyb3cobGluZXVwLmF0S2V5KGtleSkpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH0pKCkpLmpvaW4oXCJcXG5cIikpICsgXCJcXG48L3RhYmxlPlxcbjxwIHN0eWxlPVxcXCJjb2xvcjogI2JiYlxcXCI+ZG90cyBhcmUgZGF5cywgYWR2YW5jaW5nIHRvIHRoZSByaWdodCwgd2l0aCBtYXJrcyBzaG93aW5nIGFjdGl2aXR5PC9wPlwiO1xufTtcblxuc2hvdyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGFibGUobGluZXVwLmRlYnVnS2V5cygpKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaG93OiBzaG93XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGFjdGl2ZSwgYXNTbHVnLCBjcmVhdGVQYWdlLCBkb0ludGVybmFsTGluaywgbGluZXVwLCBwYWdlRW1pdHRlciwgcmVmLCByZWZyZXNoLCBzaG93UGFnZSwgc2hvd1Jlc3VsdDtcblxubGluZXVwID0gcmVxdWlyZSgnLi9saW5ldXAnKTtcblxuYWN0aXZlID0gcmVxdWlyZSgnLi9hY3RpdmUnKTtcblxucmVmcmVzaCA9IHJlcXVpcmUoJy4vcmVmcmVzaCcpO1xuXG5yZWYgPSByZXF1aXJlKCcuL3BhZ2UnKSwgYXNTbHVnID0gcmVmLmFzU2x1ZywgcGFnZUVtaXR0ZXIgPSByZWYucGFnZUVtaXR0ZXI7XG5cbmNyZWF0ZVBhZ2UgPSBmdW5jdGlvbihuYW1lLCBsb2MpIHtcbiAgdmFyICRwYWdlLCBzaXRlO1xuICBpZiAobG9jICYmIGxvYyAhPT0gJ3ZpZXcnKSB7XG4gICAgc2l0ZSA9IGxvYztcbiAgfVxuICAkcGFnZSA9ICQoXCI8ZGl2IGNsYXNzPVxcXCJwYWdlXFxcIiBpZD1cXFwiXCIgKyBuYW1lICsgXCJcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwidHdpbnNcXFwiPiA8cD4gPC9wPiA8L2Rpdj5cXG4gIDxkaXYgY2xhc3M9XFxcImhlYWRlclxcXCI+XFxuICAgIDxoMT4gPGltZyBjbGFzcz1cXFwiZmF2aWNvblxcXCIgc3JjPVxcXCJcIiArIChzaXRlID8gXCIvL1wiICsgc2l0ZSA6IFwiXCIpICsgXCIvZmF2aWNvbi5wbmdcXFwiIGhlaWdodD1cXFwiMzJweFxcXCI+IFwiICsgbmFtZSArIFwiIDwvaDE+XFxuICA8L2Rpdj5cXG48L2Rpdj5cIik7XG4gIGlmIChzaXRlKSB7XG4gICAgJHBhZ2UuZGF0YSgnc2l0ZScsIHNpdGUpO1xuICB9XG4gIHJldHVybiAkcGFnZTtcbn07XG5cbnNob3dQYWdlID0gZnVuY3Rpb24obmFtZSwgbG9jKSB7XG4gIHJldHVybiBjcmVhdGVQYWdlKG5hbWUsIGxvYykuYXBwZW5kVG8oJy5tYWluJykuZWFjaChyZWZyZXNoLmN5Y2xlKTtcbn07XG5cbmRvSW50ZXJuYWxMaW5rID0gZnVuY3Rpb24obmFtZSwgJHBhZ2UsIHNpdGUpIHtcbiAgaWYgKHNpdGUgPT0gbnVsbCkge1xuICAgIHNpdGUgPSBudWxsO1xuICB9XG4gIG5hbWUgPSBhc1NsdWcobmFtZSk7XG4gIGlmICgkcGFnZSAhPSBudWxsKSB7XG4gICAgJCgkcGFnZSkubmV4dEFsbCgpLnJlbW92ZSgpO1xuICB9XG4gIGlmICgkcGFnZSAhPSBudWxsKSB7XG4gICAgbGluZXVwLnJlbW92ZUFsbEFmdGVyS2V5KCQoJHBhZ2UpLmRhdGEoJ2tleScpKTtcbiAgfVxuICBzaG93UGFnZShuYW1lLCBzaXRlKTtcbiAgcmV0dXJuIGFjdGl2ZS5zZXQoJCgnLnBhZ2UnKS5sYXN0KCkpO1xufTtcblxuc2hvd1Jlc3VsdCA9IGZ1bmN0aW9uKHBhZ2VPYmplY3QpIHtcbiAgdmFyICRwYWdlO1xuICAkcGFnZSA9IGNyZWF0ZVBhZ2UocGFnZU9iamVjdC5nZXRTbHVnKCkpLmFkZENsYXNzKCdnaG9zdCcpO1xuICAkcGFnZS5hcHBlbmRUbygkKCcubWFpbicpKTtcbiAgcmVmcmVzaC5idWlsZFBhZ2UocGFnZU9iamVjdCwgJHBhZ2UpO1xuICByZXR1cm4gYWN0aXZlLnNldCgkKCcucGFnZScpLmxhc3QoKSk7XG59O1xuXG5wYWdlRW1pdHRlci5vbignc2hvdycsIGZ1bmN0aW9uKHBhZ2UpIHtcbiAgY29uc29sZS5sb2coJ3BhZ2VFbWl0dGVyIGhhbmRsaW5nJywgcGFnZSk7XG4gIHJldHVybiBzaG93UmVzdWx0KHBhZ2UpO1xufSk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjcmVhdGVQYWdlOiBjcmVhdGVQYWdlLFxuICBkb0ludGVybmFsTGluazogZG9JbnRlcm5hbExpbmssXG4gIHNob3dQYWdlOiBzaG93UGFnZSxcbiAgc2hvd1Jlc3VsdDogc2hvd1Jlc3VsdFxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBfLCBuZWlnaGJvcmhvb2QsIG5leHRBdmFpbGFibGVGZXRjaCwgbmV4dEZldGNoSW50ZXJ2YWwsIHBvcHVsYXRlU2l0ZUluZm9Gb3IsXG4gIGhhc1Byb3AgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuZWlnaGJvcmhvb2QgPSB7fTtcblxubmVpZ2hib3Job29kLnNpdGVzID0ge307XG5cbm5leHRBdmFpbGFibGVGZXRjaCA9IDA7XG5cbm5leHRGZXRjaEludGVydmFsID0gMjAwMDtcblxucG9wdWxhdGVTaXRlSW5mb0ZvciA9IGZ1bmN0aW9uKHNpdGUsIG5laWdoYm9ySW5mbykge1xuICB2YXIgZmV0Y2hNYXAsIG5vdywgdHJhbnNpdGlvbjtcbiAgaWYgKG5laWdoYm9ySW5mby5zaXRlbWFwUmVxdWVzdEluZmxpZ2h0KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIG5laWdoYm9ySW5mby5zaXRlbWFwUmVxdWVzdEluZmxpZ2h0ID0gdHJ1ZTtcbiAgdHJhbnNpdGlvbiA9IGZ1bmN0aW9uKHNpdGUsIGZyb20sIHRvKSB7XG4gICAgcmV0dXJuICQoXCIubmVpZ2hib3JbZGF0YS1zaXRlPVxcXCJcIiArIHNpdGUgKyBcIlxcXCJdXCIpLmZpbmQoJ2RpdicpLnJlbW92ZUNsYXNzKGZyb20pLmFkZENsYXNzKHRvKTtcbiAgfTtcbiAgZmV0Y2hNYXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVxdWVzdCwgc2l0ZW1hcFVybDtcbiAgICBzaXRlbWFwVXJsID0gXCJodHRwOi8vXCIgKyBzaXRlICsgXCIvc3lzdGVtL3NpdGVtYXAuanNvblwiO1xuICAgIHRyYW5zaXRpb24oc2l0ZSwgJ3dhaXQnLCAnZmV0Y2gnKTtcbiAgICByZXF1ZXN0ID0gJC5hamF4KHtcbiAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgIHVybDogc2l0ZW1hcFVybFxuICAgIH0pO1xuICAgIHJldHVybiByZXF1ZXN0LmFsd2F5cyhmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZWlnaGJvckluZm8uc2l0ZW1hcFJlcXVlc3RJbmZsaWdodCA9IGZhbHNlO1xuICAgIH0pLmRvbmUoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgbmVpZ2hib3JJbmZvLnNpdGVtYXAgPSBkYXRhO1xuICAgICAgdHJhbnNpdGlvbihzaXRlLCAnZmV0Y2gnLCAnZG9uZScpO1xuICAgICAgcmV0dXJuICQoJ2JvZHknKS50cmlnZ2VyKCduZXctbmVpZ2hib3ItZG9uZScsIHNpdGUpO1xuICAgIH0pLmZhaWwoZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHRyYW5zaXRpb24oc2l0ZSwgJ2ZldGNoJywgJ2ZhaWwnKTtcbiAgICB9KTtcbiAgfTtcbiAgbm93ID0gRGF0ZS5ub3coKTtcbiAgaWYgKG5vdyA+IG5leHRBdmFpbGFibGVGZXRjaCkge1xuICAgIG5leHRBdmFpbGFibGVGZXRjaCA9IG5vdyArIG5leHRGZXRjaEludGVydmFsO1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZldGNoTWFwLCAxMDApO1xuICB9IGVsc2Uge1xuICAgIHNldFRpbWVvdXQoZmV0Y2hNYXAsIG5leHRBdmFpbGFibGVGZXRjaCAtIG5vdyk7XG4gICAgcmV0dXJuIG5leHRBdmFpbGFibGVGZXRjaCArPSBuZXh0RmV0Y2hJbnRlcnZhbDtcbiAgfVxufTtcblxubmVpZ2hib3Job29kLnJlZ2lzdGVyTmVpZ2hib3IgPSBmdW5jdGlvbihzaXRlKSB7XG4gIHZhciBuZWlnaGJvckluZm87XG4gIGlmIChuZWlnaGJvcmhvb2Quc2l0ZXNbc2l0ZV0gIT0gbnVsbCkge1xuICAgIHJldHVybjtcbiAgfVxuICBuZWlnaGJvckluZm8gPSB7fTtcbiAgbmVpZ2hib3Job29kLnNpdGVzW3NpdGVdID0gbmVpZ2hib3JJbmZvO1xuICBwb3B1bGF0ZVNpdGVJbmZvRm9yKHNpdGUsIG5laWdoYm9ySW5mbyk7XG4gIHJldHVybiAkKCdib2R5JykudHJpZ2dlcignbmV3LW5laWdoYm9yJywgc2l0ZSk7XG59O1xuXG5uZWlnaGJvcmhvb2QubGlzdE5laWdoYm9ycyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gXy5rZXlzKG5laWdoYm9yaG9vZC5zaXRlcyk7XG59O1xuXG5uZWlnaGJvcmhvb2Quc2VhcmNoID0gZnVuY3Rpb24oc2VhcmNoUXVlcnkpIHtcbiAgdmFyIGZpbmRzLCBtYXRjaCwgbWF0Y2hpbmdQYWdlcywgbmVpZ2hib3JJbmZvLCBuZWlnaGJvclNpdGUsIHJlZiwgc2l0ZW1hcCwgc3RhcnQsIHRhbGx5LCB0aWNrO1xuICBmaW5kcyA9IFtdO1xuICB0YWxseSA9IHt9O1xuICB0aWNrID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKHRhbGx5W2tleV0gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRhbGx5W2tleV0rKztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRhbGx5W2tleV0gPSAxO1xuICAgIH1cbiAgfTtcbiAgbWF0Y2ggPSBmdW5jdGlvbihrZXksIHRleHQpIHtcbiAgICB2YXIgaGl0O1xuICAgIGhpdCA9ICh0ZXh0ICE9IG51bGwpICYmIHRleHQudG9Mb3dlckNhc2UoKS5pbmRleE9mKHNlYXJjaFF1ZXJ5LnRvTG93ZXJDYXNlKCkpID49IDA7XG4gICAgaWYgKGhpdCkge1xuICAgICAgdGljayhrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gaGl0O1xuICB9O1xuICBzdGFydCA9IERhdGUubm93KCk7XG4gIHJlZiA9IG5laWdoYm9yaG9vZC5zaXRlcztcbiAgZm9yIChuZWlnaGJvclNpdGUgaW4gcmVmKSB7XG4gICAgaWYgKCFoYXNQcm9wLmNhbGwocmVmLCBuZWlnaGJvclNpdGUpKSBjb250aW51ZTtcbiAgICBuZWlnaGJvckluZm8gPSByZWZbbmVpZ2hib3JTaXRlXTtcbiAgICBzaXRlbWFwID0gbmVpZ2hib3JJbmZvLnNpdGVtYXA7XG4gICAgaWYgKHNpdGVtYXAgIT0gbnVsbCkge1xuICAgICAgdGljaygnc2l0ZXMnKTtcbiAgICB9XG4gICAgbWF0Y2hpbmdQYWdlcyA9IF8uZWFjaChzaXRlbWFwLCBmdW5jdGlvbihwYWdlKSB7XG4gICAgICB0aWNrKCdwYWdlcycpO1xuICAgICAgaWYgKCEobWF0Y2goJ3RpdGxlJywgcGFnZS50aXRsZSkgfHwgbWF0Y2goJ3RleHQnLCBwYWdlLnN5bm9wc2lzKSB8fCBtYXRjaCgnc2x1ZycsIHBhZ2Uuc2x1ZykpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRpY2soJ2ZpbmRzJyk7XG4gICAgICByZXR1cm4gZmluZHMucHVzaCh7XG4gICAgICAgIHBhZ2U6IHBhZ2UsXG4gICAgICAgIHNpdGU6IG5laWdoYm9yU2l0ZSxcbiAgICAgICAgcmFuazogMVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgdGFsbHlbJ21zZWMnXSA9IERhdGUubm93KCkgLSBzdGFydDtcbiAgcmV0dXJuIHtcbiAgICBmaW5kczogZmluZHMsXG4gICAgdGFsbHk6IHRhbGx5XG4gIH07XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGJpbmQsIGZsYWcsIGluamVjdCwgbGluaywgc2l0ZXMsIHRvdGFsUGFnZXM7XG5cbmxpbmsgPSByZXF1aXJlKCcuL2xpbmsnKTtcblxuc2l0ZXMgPSBudWxsO1xuXG50b3RhbFBhZ2VzID0gMDtcblxuZmxhZyA9IGZ1bmN0aW9uKHNpdGUpIHtcbiAgcmV0dXJuIFwiPHNwYW4gY2xhc3M9XFxcIm5laWdoYm9yXFxcIiBkYXRhLXNpdGU9XFxcIlwiICsgc2l0ZSArIFwiXFxcIj5cXG4gIDxkaXYgY2xhc3M9XFxcIndhaXRcXFwiPlxcbiAgICA8aW1nIHNyYz1cXFwiaHR0cDovL1wiICsgc2l0ZSArIFwiL2Zhdmljb24ucG5nXFxcIiB0aXRsZT1cXFwiXCIgKyBzaXRlICsgXCJcXFwiPlxcbiAgPC9kaXY+XFxuPC9zcGFuPlwiO1xufTtcblxuaW5qZWN0ID0gZnVuY3Rpb24obmVpZ2hib3Job29kKSB7XG4gIHJldHVybiBzaXRlcyA9IG5laWdoYm9yaG9vZC5zaXRlcztcbn07XG5cbmJpbmQgPSBmdW5jdGlvbigpIHtcbiAgdmFyICRuZWlnaGJvcmhvb2Q7XG4gICRuZWlnaGJvcmhvb2QgPSAkKCcubmVpZ2hib3Job29kJyk7XG4gIHJldHVybiAkKCdib2R5Jykub24oJ25ldy1uZWlnaGJvcicsIGZ1bmN0aW9uKGUsIHNpdGUpIHtcbiAgICByZXR1cm4gJG5laWdoYm9yaG9vZC5hcHBlbmQoZmxhZyhzaXRlKSk7XG4gIH0pLm9uKCduZXctbmVpZ2hib3ItZG9uZScsIGZ1bmN0aW9uKGUsIHNpdGUpIHtcbiAgICB2YXIgaW1nLCBwYWdlQ291bnQ7XG4gICAgcGFnZUNvdW50ID0gc2l0ZXNbc2l0ZV0uc2l0ZW1hcC5sZW5ndGg7XG4gICAgaW1nID0gJChcIi5uZWlnaGJvcmhvb2QgLm5laWdoYm9yW2RhdGEtc2l0ZT1cXFwiXCIgKyBzaXRlICsgXCJcXFwiXVwiKS5maW5kKCdpbWcnKTtcbiAgICBpbWcuYXR0cigndGl0bGUnLCBzaXRlICsgXCJcXG4gXCIgKyBwYWdlQ291bnQgKyBcIiBwYWdlc1wiKTtcbiAgICB0b3RhbFBhZ2VzICs9IHBhZ2VDb3VudDtcbiAgICByZXR1cm4gJCgnLnNlYXJjaGJveCAucGFnZXMnKS50ZXh0KHRvdGFsUGFnZXMgKyBcIiBwYWdlc1wiKTtcbiAgfSkuZGVsZWdhdGUoJy5uZWlnaGJvciBpbWcnLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGxpbmsuZG9JbnRlcm5hbExpbmsoJ2luZGV4JywgbnVsbCwgdGhpcy50aXRsZS5zcGxpdChcIlxcblwiKVswXSk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluamVjdDogaW5qZWN0LFxuICBiaW5kOiBiaW5kXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIEV2ZW50RW1pdHRlciwgXywgYXNTbHVnLCBmb3JtYXREYXRlLCBuZXdQYWdlLCBub3dTZWN0aW9ucywgcGFnZUVtaXR0ZXIsIHJhbmRvbSwgcmV2aXNpb247XG5cbmZvcm1hdERhdGUgPSByZXF1aXJlKCcuL3V0aWwnKS5mb3JtYXREYXRlO1xuXG5yYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpO1xuXG5yZXZpc2lvbiA9IHJlcXVpcmUoJy4vcmV2aXNpb24nKTtcblxuXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxuRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuXG5wYWdlRW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXI7XG5cbmFzU2x1ZyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUucmVwbGFjZSgvXFxzL2csICctJykucmVwbGFjZSgvW15BLVphLXowLTktXS9nLCAnJykudG9Mb3dlckNhc2UoKTtcbn07XG5cbm5vd1NlY3Rpb25zID0gZnVuY3Rpb24obm93KSB7XG4gIHJldHVybiBbXG4gICAge1xuICAgICAgc3ltYm9sOiAn4p2EJyxcbiAgICAgIGRhdGU6IG5vdyAtIDEwMDAgKiA2MCAqIDYwICogMjQgKiAzNjYsXG4gICAgICBwZXJpb2Q6ICdhIFllYXInXG4gICAgfSwge1xuICAgICAgc3ltYm9sOiAn4pqYJyxcbiAgICAgIGRhdGU6IG5vdyAtIDEwMDAgKiA2MCAqIDYwICogMjQgKiAzMSAqIDMsXG4gICAgICBwZXJpb2Q6ICdhIFNlYXNvbidcbiAgICB9LCB7XG4gICAgICBzeW1ib2w6ICfimqonLFxuICAgICAgZGF0ZTogbm93IC0gMTAwMCAqIDYwICogNjAgKiAyNCAqIDMxLFxuICAgICAgcGVyaW9kOiAnYSBNb250aCdcbiAgICB9LCB7XG4gICAgICBzeW1ib2w6ICfimL0nLFxuICAgICAgZGF0ZTogbm93IC0gMTAwMCAqIDYwICogNjAgKiAyNCAqIDcsXG4gICAgICBwZXJpb2Q6ICdhIFdlZWsnXG4gICAgfSwge1xuICAgICAgc3ltYm9sOiAn4piAJyxcbiAgICAgIGRhdGU6IG5vdyAtIDEwMDAgKiA2MCAqIDYwICogMjQsXG4gICAgICBwZXJpb2Q6ICdhIERheSdcbiAgICB9LCB7XG4gICAgICBzeW1ib2w6ICfijJonLFxuICAgICAgZGF0ZTogbm93IC0gMTAwMCAqIDYwICogNjAsXG4gICAgICBwZXJpb2Q6ICdhbiBIb3VyJ1xuICAgIH1cbiAgXTtcbn07XG5cbm5ld1BhZ2UgPSBmdW5jdGlvbihqc29uLCBzaXRlKSB7XG4gIHZhciBhZGRJdGVtLCBhZGRQYXJhZ3JhcGgsIGFwcGx5LCBiZWNvbWUsIGdldENvbnRleHQsIGdldEl0ZW0sIGdldE5laWdoYm9ycywgZ2V0UmF3UGFnZSwgZ2V0UmVtb3RlU2l0ZSwgZ2V0UmVtb3RlU2l0ZURldGFpbHMsIGdldFJldmlzaW9uLCBnZXRTbHVnLCBnZXRUaW1lc3RhbXAsIGdldFRpdGxlLCBpc0xvY2FsLCBpc1BsdWdpbiwgaXNSZW1vdGUsIG1lcmdlLCBub3REdXBsaWNhdGUsIHBhZ2UsIHNlcUFjdGlvbnMsIHNlcUl0ZW1zLCBzZXRUaXRsZSwgc2l0ZUxpbmV1cDtcbiAgcGFnZSA9IGpzb24gfHwge307XG4gIHBhZ2UudGl0bGUgfHwgKHBhZ2UudGl0bGUgPSAnZW1wdHknKTtcbiAgcGFnZS5zdG9yeSB8fCAocGFnZS5zdG9yeSA9IFtdKTtcbiAgcGFnZS5qb3VybmFsIHx8IChwYWdlLmpvdXJuYWwgPSBbXSk7XG4gIGdldFJhd1BhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcGFnZTtcbiAgfTtcbiAgZ2V0Q29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhY3Rpb24sIGFkZENvbnRleHQsIGNvbnRleHQsIGosIGxlbiwgcmVmO1xuICAgIGNvbnRleHQgPSBbJ3ZpZXcnXTtcbiAgICBpZiAoaXNSZW1vdGUoKSkge1xuICAgICAgY29udGV4dC5wdXNoKHNpdGUpO1xuICAgIH1cbiAgICBhZGRDb250ZXh0ID0gZnVuY3Rpb24oc2l0ZSkge1xuICAgICAgaWYgKChzaXRlICE9IG51bGwpICYmICFfLmluY2x1ZGUoY29udGV4dCwgc2l0ZSkpIHtcbiAgICAgICAgcmV0dXJuIGNvbnRleHQucHVzaChzaXRlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJlZiA9IHBhZ2Uuam91cm5hbC5zbGljZSgwKS5yZXZlcnNlKCk7XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBhY3Rpb24gPSByZWZbal07XG4gICAgICBhZGRDb250ZXh0KGFjdGlvbiAhPSBudWxsID8gYWN0aW9uLnNpdGUgOiB2b2lkIDApO1xuICAgIH1cbiAgICByZXR1cm4gY29udGV4dDtcbiAgfTtcbiAgaXNQbHVnaW4gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcGFnZS5wbHVnaW4gIT0gbnVsbDtcbiAgfTtcbiAgaXNSZW1vdGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gIShzaXRlID09PSAodm9pZCAwKSB8fCBzaXRlID09PSBudWxsIHx8IHNpdGUgPT09ICd2aWV3JyB8fCBzaXRlID09PSAnb3JpZ2luJyB8fCBzaXRlID09PSAnbG9jYWwnKTtcbiAgfTtcbiAgaXNMb2NhbCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzaXRlID09PSAnbG9jYWwnO1xuICB9O1xuICBnZXRSZW1vdGVTaXRlID0gZnVuY3Rpb24oaG9zdCkge1xuICAgIGlmIChob3N0ID09IG51bGwpIHtcbiAgICAgIGhvc3QgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoaXNSZW1vdGUoKSkge1xuICAgICAgcmV0dXJuIHNpdGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBob3N0O1xuICAgIH1cbiAgfTtcbiAgZ2V0UmVtb3RlU2l0ZURldGFpbHMgPSBmdW5jdGlvbihob3N0KSB7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBpZiAoaG9zdCA9PSBudWxsKSB7XG4gICAgICBob3N0ID0gbnVsbDtcbiAgICB9XG4gICAgcmVzdWx0ID0gW107XG4gICAgaWYgKGhvc3QgfHwgaXNSZW1vdGUoKSkge1xuICAgICAgcmVzdWx0LnB1c2goZ2V0UmVtb3RlU2l0ZShob3N0KSk7XG4gICAgfVxuICAgIGlmIChpc1BsdWdpbigpKSB7XG4gICAgICByZXN1bHQucHVzaChwYWdlLnBsdWdpbiArIFwiIHBsdWdpblwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdC5qb2luKFwiXFxuXCIpO1xuICB9O1xuICBnZXRTbHVnID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGFzU2x1ZyhwYWdlLnRpdGxlKTtcbiAgfTtcbiAgZ2V0TmVpZ2hib3JzID0gZnVuY3Rpb24oaG9zdCkge1xuICAgIHZhciBhY3Rpb24sIGl0ZW0sIGosIGssIGxlbiwgbGVuMSwgbmVpZ2hib3JzLCByZWYsIHJlZjE7XG4gICAgbmVpZ2hib3JzID0gW107XG4gICAgaWYgKGlzUmVtb3RlKCkpIHtcbiAgICAgIG5laWdoYm9ycy5wdXNoKHNpdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaG9zdCAhPSBudWxsKSB7XG4gICAgICAgIG5laWdoYm9ycy5wdXNoKGhvc3QpO1xuICAgICAgfVxuICAgIH1cbiAgICByZWYgPSBwYWdlLnN0b3J5O1xuICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgaXRlbSA9IHJlZltqXTtcbiAgICAgIGlmICgoaXRlbSAhPSBudWxsID8gaXRlbS5zaXRlIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgIG5laWdoYm9ycy5wdXNoKGl0ZW0uc2l0ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlZjEgPSBwYWdlLmpvdXJuYWw7XG4gICAgZm9yIChrID0gMCwgbGVuMSA9IHJlZjEubGVuZ3RoOyBrIDwgbGVuMTsgaysrKSB7XG4gICAgICBhY3Rpb24gPSByZWYxW2tdO1xuICAgICAgaWYgKChhY3Rpb24gIT0gbnVsbCA/IGFjdGlvbi5zaXRlIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgICAgIG5laWdoYm9ycy5wdXNoKGFjdGlvbi5zaXRlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF8udW5pcShuZWlnaGJvcnMpO1xuICB9O1xuICBnZXRUaXRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwYWdlLnRpdGxlO1xuICB9O1xuICBzZXRUaXRsZSA9IGZ1bmN0aW9uKHRpdGxlKSB7XG4gICAgcmV0dXJuIHBhZ2UudGl0bGUgPSB0aXRsZTtcbiAgfTtcbiAgZ2V0UmV2aXNpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcGFnZS5qb3VybmFsLmxlbmd0aCAtIDE7XG4gIH07XG4gIGdldFRpbWVzdGFtcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkYXRlO1xuICAgIGRhdGUgPSBwYWdlLmpvdXJuYWxbZ2V0UmV2aXNpb24oKV0uZGF0ZTtcbiAgICBpZiAoZGF0ZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RGF0ZShkYXRlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIFwiUmV2aXNpb24gXCIgKyAoZ2V0UmV2aXNpb24oKSk7XG4gICAgfVxuICB9O1xuICBhZGRJdGVtID0gZnVuY3Rpb24oaXRlbSkge1xuICAgIGl0ZW0gPSBfLmV4dGVuZCh7fSwge1xuICAgICAgaWQ6IHJhbmRvbS5pdGVtSWQoKVxuICAgIH0sIGl0ZW0pO1xuICAgIHJldHVybiBwYWdlLnN0b3J5LnB1c2goaXRlbSk7XG4gIH07XG4gIGdldEl0ZW0gPSBmdW5jdGlvbihpZCkge1xuICAgIHZhciBpdGVtLCBqLCBsZW4sIHJlZjtcbiAgICByZWYgPSBwYWdlLnN0b3J5O1xuICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgaXRlbSA9IHJlZltqXTtcbiAgICAgIGlmIChpdGVtLmlkID09PSBpZCkge1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIHNlcUl0ZW1zID0gZnVuY3Rpb24oZWFjaCkge1xuICAgIHZhciBlbWl0SXRlbTtcbiAgICBlbWl0SXRlbSA9IGZ1bmN0aW9uKGkpIHtcbiAgICAgIGlmIChpID49IHBhZ2Uuc3RvcnkubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlYWNoKHBhZ2Uuc3RvcnlbaV0gfHwge1xuICAgICAgICB0ZXh0OiAnbnVsbCdcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZW1pdEl0ZW0oaSArIDEpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gZW1pdEl0ZW0oMCk7XG4gIH07XG4gIGFkZFBhcmFncmFwaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICB2YXIgdHlwZTtcbiAgICB0eXBlID0gXCJwYXJhZ3JhcGhcIjtcbiAgICByZXR1cm4gYWRkSXRlbSh7XG4gICAgICB0eXBlOiB0eXBlLFxuICAgICAgdGV4dDogdGV4dFxuICAgIH0pO1xuICB9O1xuICBzZXFBY3Rpb25zID0gZnVuY3Rpb24oZWFjaCkge1xuICAgIHZhciBlbWl0QWN0aW9uLCBzZWN0aW9ucywgc21hbGxlcjtcbiAgICBzbWFsbGVyID0gMDtcbiAgICBzZWN0aW9ucyA9IG5vd1NlY3Rpb25zKChuZXcgRGF0ZSkuZ2V0VGltZSgpKTtcbiAgICBlbWl0QWN0aW9uID0gZnVuY3Rpb24oaSkge1xuICAgICAgdmFyIGFjdGlvbiwgYmlnZ2VyLCBqLCBsZW4sIHNlY3Rpb24sIHNlcGFyYXRvcjtcbiAgICAgIGlmIChpID49IHBhZ2Uuam91cm5hbC5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYWN0aW9uID0gcGFnZS5qb3VybmFsW2ldIHx8IHt9O1xuICAgICAgYmlnZ2VyID0gYWN0aW9uLmRhdGUgfHwgMDtcbiAgICAgIHNlcGFyYXRvciA9IG51bGw7XG4gICAgICBmb3IgKGogPSAwLCBsZW4gPSBzZWN0aW9ucy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBzZWN0aW9uID0gc2VjdGlvbnNbal07XG4gICAgICAgIGlmIChzZWN0aW9uLmRhdGUgPiBzbWFsbGVyICYmIHNlY3Rpb24uZGF0ZSA8IGJpZ2dlcikge1xuICAgICAgICAgIHNlcGFyYXRvciA9IHNlY3Rpb247XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNtYWxsZXIgPSBiaWdnZXI7XG4gICAgICByZXR1cm4gZWFjaCh7XG4gICAgICAgIGFjdGlvbjogYWN0aW9uLFxuICAgICAgICBzZXBhcmF0b3I6IHNlcGFyYXRvclxuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBlbWl0QWN0aW9uKGkgKyAxKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIGVtaXRBY3Rpb24oMCk7XG4gIH07XG4gIGJlY29tZSA9IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG4gICAgcmV0dXJuIHBhZ2Uuc3RvcnkgPSAodGVtcGxhdGUgIT0gbnVsbCA/IHRlbXBsYXRlLmdldFJhd1BhZ2UoKS5zdG9yeSA6IHZvaWQgMCkgfHwgW107XG4gIH07XG4gIHNpdGVMaW5ldXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcGF0aCwgc2x1ZztcbiAgICBzbHVnID0gZ2V0U2x1ZygpO1xuICAgIHBhdGggPSBzbHVnID09PSAnaW5kZXgnID8gXCJ2aWV3L2luZGV4XCIgOiBcInZpZXcvaW5kZXgvdmlldy9cIiArIHNsdWc7XG4gICAgaWYgKGlzUmVtb3RlKCkpIHtcbiAgICAgIHJldHVybiBcIi8vXCIgKyBzaXRlICsgXCIvXCIgKyBwYXRoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCIvXCIgKyBwYXRoO1xuICAgIH1cbiAgfTtcbiAgbm90RHVwbGljYXRlID0gZnVuY3Rpb24oam91cm5hbCwgYWN0aW9uKSB7XG4gICAgdmFyIGVhY2gsIGosIGxlbjtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSBqb3VybmFsLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBlYWNoID0gam91cm5hbFtqXTtcbiAgICAgIGlmIChlYWNoLmlkID09PSBhY3Rpb24uaWQgJiYgZWFjaC5kYXRlID09PSBhY3Rpb24uZGF0ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuICBtZXJnZSA9IGZ1bmN0aW9uKHVwZGF0ZSkge1xuICAgIHZhciBhY3Rpb24sIGosIGxlbiwgbWVyZ2VkLCByZWY7XG4gICAgbWVyZ2VkID0gKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGosIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgICAgcmVmID0gcGFnZS5qb3VybmFsO1xuICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgIGFjdGlvbiA9IHJlZltqXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGFjdGlvbik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9KSgpO1xuICAgIHJlZiA9IHVwZGF0ZS5nZXRSYXdQYWdlKCkuam91cm5hbDtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGFjdGlvbiA9IHJlZltqXTtcbiAgICAgIGlmIChub3REdXBsaWNhdGUocGFnZS5qb3VybmFsLCBhY3Rpb24pKSB7XG4gICAgICAgIG1lcmdlZC5wdXNoKGFjdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIG1lcmdlZC5wdXNoKHtcbiAgICAgIHR5cGU6ICdmb3JrJyxcbiAgICAgIHNpdGU6IHVwZGF0ZS5nZXRSZW1vdGVTaXRlKCksXG4gICAgICBkYXRlOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG4gICAgfSk7XG4gICAgcmV0dXJuIG5ld1BhZ2UocmV2aXNpb24uY3JlYXRlKDk5OSwge1xuICAgICAgdGl0bGU6IHBhZ2UudGl0bGUsXG4gICAgICBqb3VybmFsOiBtZXJnZWRcbiAgICB9KSwgc2l0ZSk7XG4gIH07XG4gIGFwcGx5ID0gZnVuY3Rpb24oYWN0aW9uKSB7XG4gICAgcmV2aXNpb24uYXBwbHkocGFnZSwgYWN0aW9uKTtcbiAgICBpZiAoYWN0aW9uLnNpdGUpIHtcbiAgICAgIHJldHVybiBzaXRlID0gbnVsbDtcbiAgICB9XG4gIH07XG4gIHJldHVybiB7XG4gICAgZ2V0UmF3UGFnZTogZ2V0UmF3UGFnZSxcbiAgICBnZXRDb250ZXh0OiBnZXRDb250ZXh0LFxuICAgIGlzUGx1Z2luOiBpc1BsdWdpbixcbiAgICBpc1JlbW90ZTogaXNSZW1vdGUsXG4gICAgaXNMb2NhbDogaXNMb2NhbCxcbiAgICBnZXRSZW1vdGVTaXRlOiBnZXRSZW1vdGVTaXRlLFxuICAgIGdldFJlbW90ZVNpdGVEZXRhaWxzOiBnZXRSZW1vdGVTaXRlRGV0YWlscyxcbiAgICBnZXRTbHVnOiBnZXRTbHVnLFxuICAgIGdldE5laWdoYm9yczogZ2V0TmVpZ2hib3JzLFxuICAgIGdldFRpdGxlOiBnZXRUaXRsZSxcbiAgICBzZXRUaXRsZTogc2V0VGl0bGUsXG4gICAgZ2V0UmV2aXNpb246IGdldFJldmlzaW9uLFxuICAgIGdldFRpbWVzdGFtcDogZ2V0VGltZXN0YW1wLFxuICAgIGFkZEl0ZW06IGFkZEl0ZW0sXG4gICAgZ2V0SXRlbTogZ2V0SXRlbSxcbiAgICBhZGRQYXJhZ3JhcGg6IGFkZFBhcmFncmFwaCxcbiAgICBzZXFJdGVtczogc2VxSXRlbXMsXG4gICAgc2VxQWN0aW9uczogc2VxQWN0aW9ucyxcbiAgICBiZWNvbWU6IGJlY29tZSxcbiAgICBzaXRlTGluZXVwOiBzaXRlTGluZXVwLFxuICAgIG1lcmdlOiBtZXJnZSxcbiAgICBhcHBseTogYXBwbHlcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBuZXdQYWdlOiBuZXdQYWdlLFxuICBhc1NsdWc6IGFzU2x1ZyxcbiAgcGFnZUVtaXR0ZXI6IHBhZ2VFbWl0dGVyXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIF8sIGFkZFRvSm91cm5hbCwgZGVlcENvcHksIGxpbmV1cCwgbmV3UGFnZSwgcGFnZUZyb21Mb2NhbFN0b3JhZ2UsIHBhZ2VIYW5kbGVyLCBwdXNoVG9Mb2NhbCwgcHVzaFRvU2VydmVyLCByYW5kb20sIHJlY3Vyc2l2ZUdldCwgcmV2aXNpb24sIHN0YXRlO1xuXG5fID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5zdGF0ZSA9IHJlcXVpcmUoJy4vc3RhdGUnKTtcblxucmV2aXNpb24gPSByZXF1aXJlKCcuL3JldmlzaW9uJyk7XG5cbmFkZFRvSm91cm5hbCA9IHJlcXVpcmUoJy4vYWRkVG9Kb3VybmFsJyk7XG5cbm5ld1BhZ2UgPSByZXF1aXJlKCcuL3BhZ2UnKS5uZXdQYWdlO1xuXG5yYW5kb20gPSByZXF1aXJlKCcuL3JhbmRvbScpO1xuXG5saW5ldXAgPSByZXF1aXJlKCcuL2xpbmV1cCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBhZ2VIYW5kbGVyID0ge307XG5cbmRlZXBDb3B5ID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iamVjdCkpO1xufTtcblxucGFnZUhhbmRsZXIudXNlTG9jYWxTdG9yYWdlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAkKFwiLmxvZ2luXCIpLmxlbmd0aCA+IDA7XG59O1xuXG5wYWdlRnJvbUxvY2FsU3RvcmFnZSA9IGZ1bmN0aW9uIChzbHVnKSB7XG4gICAgdmFyIGpzb247XG4gICAgaWYgKGpzb24gPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShzbHVnKSkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShqc29uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH1cbn07XG5cbnJlY3Vyc2l2ZUdldCA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICB2YXIgbG9jYWxDb250ZXh0LCBsb2NhbFBhZ2UsIHBhZ2VJbmZvcm1hdGlvbiwgcmV2LCBzaXRlLCBzbHVnLCB1cmwsIHdoZW5Hb3R0ZW4sIHdoZW5Ob3RHb3R0ZW47XG4gICAgcGFnZUluZm9ybWF0aW9uID0gYXJnLnBhZ2VJbmZvcm1hdGlvbiwgd2hlbkdvdHRlbiA9IGFyZy53aGVuR290dGVuLCB3aGVuTm90R290dGVuID0gYXJnLndoZW5Ob3RHb3R0ZW4sIGxvY2FsQ29udGV4dCA9IGFyZy5sb2NhbENvbnRleHQ7XG4gICAgc2x1ZyA9IHBhZ2VJbmZvcm1hdGlvbi5zbHVnLCByZXYgPSBwYWdlSW5mb3JtYXRpb24ucmV2LCBzaXRlID0gcGFnZUluZm9ybWF0aW9uLnNpdGU7XG4gICAgaWYgKHNpdGUpIHtcbiAgICAgICAgbG9jYWxDb250ZXh0ID0gW107XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2l0ZSA9IGxvY2FsQ29udGV4dC5zaGlmdCgpO1xuICAgIH1cbiAgICBpZiAoc2l0ZSA9PT0gd2luZG93LmxvY2F0aW9uLmhvc3QpIHtcbiAgICAgICAgc2l0ZSA9ICdvcmlnaW4nO1xuICAgIH1cbiAgICBpZiAoc2l0ZSA9PT0gJ3ZpZXcnKSB7XG4gICAgICAgIHNpdGUgPSBudWxsO1xuICAgIH1cbiAgICBpZiAoc2l0ZSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChzaXRlID09PSAnbG9jYWwnKSB7XG4gICAgICAgICAgICBpZiAobG9jYWxQYWdlID0gcGFnZUZyb21Mb2NhbFN0b3JhZ2UocGFnZUluZm9ybWF0aW9uLnNsdWcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdoZW5Hb3R0ZW4obmV3UGFnZShsb2NhbFBhZ2UsICdsb2NhbCcpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdoZW5Ob3RHb3R0ZW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChzaXRlID09PSAnb3JpZ2luJykge1xuICAgICAgICAgICAgICAgIHVybCA9IFwiL1wiICsgc2x1ZyArIFwiLmpzb25cIjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdXJsID0gXCJodHRwOi8vXCIgKyBzaXRlICsgXCIvXCIgKyBzbHVnICsgXCIuanNvblwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdXJsID0gXCIvXCIgKyBzbHVnICsgXCIuanNvblwiO1xuICAgIH1cbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgIHVybDogdXJsICsgKFwiP3JhbmRvbT1cIiArIChyYW5kb20ucmFuZG9tQnl0ZXMoNCkpKSxcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHBhZ2UpIHtcbiAgICAgICAgICAgIGlmIChyZXYpIHtcbiAgICAgICAgICAgICAgICBwYWdlID0gcmV2aXNpb24uY3JlYXRlKHJldiwgcGFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gd2hlbkdvdHRlbihuZXdQYWdlKHBhZ2UsIHNpdGUpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uICh4aHIsIHR5cGUsIG1zZykge1xuICAgICAgICAgICAgdmFyIHRyb3VibGVQYWdlT2JqZWN0O1xuICAgICAgICAgICAgaWYgKCh4aHIuc3RhdHVzICE9PSA0MDQpICYmICh4aHIuc3RhdHVzICE9PSAwKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwYWdlSGFuZGxlci5nZXQgZXJyb3InLCB4aHIsIHhoci5zdGF0dXMsIHR5cGUsIG1zZyk7XG4gICAgICAgICAgICAgICAgdHJvdWJsZVBhZ2VPYmplY3QgPSBuZXdQYWdlKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwiVHJvdWJsZTogQ2FuJ3QgR2V0IFBhZ2VcIlxuICAgICAgICAgICAgICAgIH0sIG51bGwpO1xuICAgICAgICAgICAgICAgIHRyb3VibGVQYWdlT2JqZWN0LmFkZFBhcmFncmFwaChcIlRoZSBwYWdlIGhhbmRsZXIgaGFzIHJ1biBpbnRvIHByb2JsZW1zIHdpdGggdGhpcyAgIHJlcXVlc3QuXFxuPHByZSBjbGFzcz1lcnJvcj5cIiArIChKU09OLnN0cmluZ2lmeShwYWdlSW5mb3JtYXRpb24pKSArIFwiPC9wcmU+XFxuVGhlIHJlcXVlc3RlZCB1cmwuXFxuPHByZSBjbGFzcz1lcnJvcj5cIiArIHVybCArIFwiPC9wcmU+XFxuVGhlIHNlcnZlciByZXBvcnRlZCBzdGF0dXMuXFxuPHByZSBjbGFzcz1lcnJvcj5cIiArIHhoci5zdGF0dXMgKyBcIjwvcHJlPlxcblRoZSBlcnJvciB0eXBlLlxcbjxwcmUgY2xhc3M9ZXJyb3I+XCIgKyB0eXBlICsgXCI8L3ByZT5cXG5UaGUgZXJyb3IgbWVzc2FnZS5cXG48cHJlIGNsYXNzPWVycm9yPlwiICsgbXNnICsgXCI8L3ByZT5cXG5UaGVzZSBwcm9ibGVtcyBhcmUgcmFyZWx5IHNvbHZlZCBieSByZXBvcnRpbmcgaXNzdWVzLlxcblRoZXJlIGNvdWxkIGJlIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gcmVwb3J0ZWQgaW4gdGhlIGJyb3dzZXIncyBjb25zb2xlLmxvZy5cXG5Nb3JlIGluZm9ybWF0aW9uIG1pZ2h0IGJlIGFjY2Vzc2libGUgYnkgZmV0Y2hpbmcgdGhlIHBhZ2Ugb3V0c2lkZSBvZiB3aWtpLlxcbjxhIGhyZWY9XFxcIlwiICsgdXJsICsgXCJcXFwiIHRhcmdldD1cXFwiX2JsYW5rXFxcIj50cnktbm93PC9hPlwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2hlbkdvdHRlbih0cm91YmxlUGFnZU9iamVjdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobG9jYWxDb250ZXh0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjdXJzaXZlR2V0KHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZUluZm9ybWF0aW9uOiBwYWdlSW5mb3JtYXRpb24sXG4gICAgICAgICAgICAgICAgICAgIHdoZW5Hb3R0ZW46IHdoZW5Hb3R0ZW4sXG4gICAgICAgICAgICAgICAgICAgIHdoZW5Ob3RHb3R0ZW46IHdoZW5Ob3RHb3R0ZW4sXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsQ29udGV4dDogbG9jYWxDb250ZXh0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuTm90R290dGVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnBhZ2VIYW5kbGVyLmdldCA9IGZ1bmN0aW9uIChhcmcpIHtcbiAgICB2YXIgbG9jYWxQYWdlLCBwYWdlSW5mb3JtYXRpb24sIHdoZW5Hb3R0ZW4sIHdoZW5Ob3RHb3R0ZW47XG4gICAgd2hlbkdvdHRlbiA9IGFyZy53aGVuR290dGVuLCB3aGVuTm90R290dGVuID0gYXJnLndoZW5Ob3RHb3R0ZW4sIHBhZ2VJbmZvcm1hdGlvbiA9IGFyZy5wYWdlSW5mb3JtYXRpb247XG4gICAgaWYgKCFwYWdlSW5mb3JtYXRpb24uc2l0ZSkge1xuICAgICAgICBpZiAobG9jYWxQYWdlID0gcGFnZUZyb21Mb2NhbFN0b3JhZ2UocGFnZUluZm9ybWF0aW9uLnNsdWcpKSB7XG4gICAgICAgICAgICBpZiAocGFnZUluZm9ybWF0aW9uLnJldikge1xuICAgICAgICAgICAgICAgIGxvY2FsUGFnZSA9IHJldmlzaW9uLmNyZWF0ZShwYWdlSW5mb3JtYXRpb24ucmV2LCBsb2NhbFBhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHdoZW5Hb3R0ZW4obmV3UGFnZShsb2NhbFBhZ2UsICdsb2NhbCcpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXBhZ2VIYW5kbGVyLmNvbnRleHQubGVuZ3RoKSB7XG4gICAgICAgIHBhZ2VIYW5kbGVyLmNvbnRleHQgPSBbJ3ZpZXcnXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlY3Vyc2l2ZUdldCh7XG4gICAgICAgIHBhZ2VJbmZvcm1hdGlvbjogcGFnZUluZm9ybWF0aW9uLFxuICAgICAgICB3aGVuR290dGVuOiB3aGVuR290dGVuLFxuICAgICAgICB3aGVuTm90R290dGVuOiB3aGVuTm90R290dGVuLFxuICAgICAgICBsb2NhbENvbnRleHQ6IF8uY2xvbmUocGFnZUhhbmRsZXIuY29udGV4dClcbiAgICB9KTtcbn07XG5cbnBhZ2VIYW5kbGVyLmNvbnRleHQgPSBbXTtcblxucHVzaFRvTG9jYWwgPSBmdW5jdGlvbiAoJHBhZ2UsIHBhZ2VQdXRJbmZvLCBhY3Rpb24pIHtcbiAgICB2YXIgcGFnZSwgc2l0ZTtcbiAgICBpZiAoYWN0aW9uLnR5cGUgPT09ICdjcmVhdGUnKSB7XG4gICAgICAgIHBhZ2UgPSB7XG4gICAgICAgICAgICB0aXRsZTogYWN0aW9uLml0ZW0udGl0bGUsXG4gICAgICAgICAgICBzdG9yeTogW10sXG4gICAgICAgICAgICBqb3VybmFsOiBbXVxuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2UgPSBwYWdlRnJvbUxvY2FsU3RvcmFnZShwYWdlUHV0SW5mby5zbHVnKTtcbiAgICAgICAgcGFnZSB8fCAocGFnZSA9IGxpbmV1cC5hdEtleSgkcGFnZS5kYXRhKCdrZXknKSkuZ2V0UmF3UGFnZSgpKTtcbiAgICAgICAgaWYgKHBhZ2Uuam91cm5hbCA9PSBudWxsKSB7XG4gICAgICAgICAgICBwYWdlLmpvdXJuYWwgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHNpdGUgPSBhY3Rpb25bJ2ZvcmsnXSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgcGFnZS5qb3VybmFsID0gcGFnZS5qb3VybmFsLmNvbmNhdCh7XG4gICAgICAgICAgICAgICAgJ3R5cGUnOiAnZm9yaycsXG4gICAgICAgICAgICAgICAgJ3NpdGUnOiBzaXRlLFxuICAgICAgICAgICAgICAgICdkYXRlJzogKG5ldyBEYXRlKCkpLmdldFRpbWUoKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkZWxldGUgYWN0aW9uWydmb3JrJ107XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV2aXNpb24uYXBwbHkocGFnZSwgYWN0aW9uKTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShwYWdlUHV0SW5mby5zbHVnLCBKU09OLnN0cmluZ2lmeShwYWdlKSk7XG4gICAgYWRkVG9Kb3VybmFsKCRwYWdlLmZpbmQoJy5qb3VybmFsJyksIGFjdGlvbik7XG4gICAgcmV0dXJuICRwYWdlLmFkZENsYXNzKFwibG9jYWxcIik7XG59O1xuXG5wdXNoVG9TZXJ2ZXIgPSBmdW5jdGlvbiAoJHBhZ2UsIHBhZ2VQdXRJbmZvLCBhY3Rpb24pIHtcbiAgICB2YXIgYnVuZGxlLCBwYWdlT2JqZWN0O1xuICAgIGJ1bmRsZSA9IGRlZXBDb3B5KGFjdGlvbik7XG4gICAgcGFnZU9iamVjdCA9IGxpbmV1cC5hdEtleSgkcGFnZS5kYXRhKCdrZXknKSk7XG4gICAgaWYgKGFjdGlvbi50eXBlID09PSAnZm9yaycpIHtcbiAgICAgICAgYnVuZGxlLml0ZW0gPSBkZWVwQ29weShwYWdlT2JqZWN0LmdldFJhd1BhZ2UoKSk7XG4gICAgfVxuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICB0eXBlOiAnUFVUJyxcbiAgICAgICAgdXJsOiBcIi9wYWdlL1wiICsgcGFnZVB1dEluZm8uc2x1ZyArIFwiL2FjdGlvblwiLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAnYWN0aW9uJzogSlNPTi5zdHJpbmdpZnkoYnVuZGxlKVxuICAgICAgICB9LFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAocGFnZU9iamVjdCAhPSBudWxsID8gcGFnZU9iamVjdC5hcHBseSA6IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgIHBhZ2VPYmplY3QuYXBwbHkoYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGFkZFRvSm91cm5hbCgkcGFnZS5maW5kKCcuam91cm5hbCcpLCBhY3Rpb24pO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi50eXBlID09PSAnZm9yaycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJHBhZ2UuYXR0cignaWQnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbiAoeGhyLCB0eXBlLCBtc2cpIHtcbiAgICAgICAgICAgIGFjdGlvbi5lcnJvciA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgICAgIG1zZzogbXNnLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNlOiB4aHIucmVzcG9uc2VUZXh0XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIHB1c2hUb0xvY2FsKCRwYWdlLCBwYWdlUHV0SW5mbywgYWN0aW9uKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxucGFnZUhhbmRsZXIucHV0ID0gZnVuY3Rpb24gKCRwYWdlLCBhY3Rpb24pIHtcbiAgICB2YXIgY2hlY2tlZFNpdGUsIGZvcmtGcm9tLCBwYWdlUHV0SW5mbztcbiAgICBjaGVja2VkU2l0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNpdGU7XG4gICAgICAgIHN3aXRjaCAoc2l0ZSA9ICRwYWdlLmRhdGEoJ3NpdGUnKSkge1xuICAgICAgICAgICAgY2FzZSAnb3JpZ2luJzpcbiAgICAgICAgICAgIGNhc2UgJ2xvY2FsJzpcbiAgICAgICAgICAgIGNhc2UgJ3ZpZXcnOlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgY2FzZSBsb2NhdGlvbi5ob3N0OlxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gc2l0ZTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcGFnZVB1dEluZm8gPSB7XG4gICAgICAgIHNsdWc6ICRwYWdlLmF0dHIoJ2lkJykuc3BsaXQoJ19yZXYnKVswXSxcbiAgICAgICAgcmV2OiAkcGFnZS5hdHRyKCdpZCcpLnNwbGl0KCdfcmV2JylbMV0sXG4gICAgICAgIHNpdGU6IGNoZWNrZWRTaXRlKCksXG4gICAgICAgIGxvY2FsOiAkcGFnZS5oYXNDbGFzcygnbG9jYWwnKVxuICAgIH07XG4gICAgZm9ya0Zyb20gPSBwYWdlUHV0SW5mby5zaXRlO1xuICAgIGNvbnNvbGUubG9nKCdwYWdlSGFuZGxlci5wdXQnLCBhY3Rpb24sIHBhZ2VQdXRJbmZvKTtcbiAgICBpZiAocGFnZUhhbmRsZXIudXNlTG9jYWxTdG9yYWdlKCkpIHtcbiAgICAgICAgaWYgKHBhZ2VQdXRJbmZvLnNpdGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3JlbW90ZSA9PiBsb2NhbCcpO1xuICAgICAgICB9IGVsc2UgaWYgKCFwYWdlUHV0SW5mby5sb2NhbCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ29yaWdpbiA9PiBsb2NhbCcpO1xuICAgICAgICAgICAgYWN0aW9uLnNpdGUgPSBmb3JrRnJvbSA9IGxvY2F0aW9uLmhvc3Q7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYWN0aW9uLmRhdGUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICAgIGlmIChhY3Rpb24uc2l0ZSA9PT0gJ29yaWdpbicpIHtcbiAgICAgICAgZGVsZXRlIGFjdGlvbi5zaXRlO1xuICAgIH1cbiAgICBpZiAoZm9ya0Zyb20pIHtcbiAgICAgICAgJHBhZ2UuZmluZCgnaDEnKS5wcm9wKCd0aXRsZScsIGxvY2F0aW9uLmhvc3QpO1xuICAgICAgICAkcGFnZS5maW5kKCdoMSBpbWcnKS5hdHRyKCdzcmMnLCAnL2Zhdmljb24ucG5nJyk7XG4gICAgICAgICRwYWdlLmZpbmQoJ2gxIGEnKS5hdHRyKCdocmVmJywgXCIvdmlldy9pbmRleC92aWV3L1wiICsgcGFnZVB1dEluZm8uc2x1ZykuYXR0cigndGFyZ2V0JywgbG9jYXRpb24uaG9zdCk7XG4gICAgICAgICRwYWdlLmRhdGEoJ3NpdGUnLCBudWxsKTtcbiAgICAgICAgJHBhZ2UucmVtb3ZlQ2xhc3MoJ3JlbW90ZScpO1xuICAgICAgICBzdGF0ZS5zZXRVcmwoKTtcbiAgICAgICAgaWYgKGFjdGlvbi50eXBlICE9PSAnZm9yaycpIHtcbiAgICAgICAgICAgIGFjdGlvbi5mb3JrID0gZm9ya0Zyb207XG4gICAgICAgICAgICBhZGRUb0pvdXJuYWwoJHBhZ2UuZmluZCgnLmpvdXJuYWwnKSwge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdmb3JrJyxcbiAgICAgICAgICAgICAgICBzaXRlOiBmb3JrRnJvbSxcbiAgICAgICAgICAgICAgICBkYXRlOiBhY3Rpb24uZGF0ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhZ2VIYW5kbGVyLnVzZUxvY2FsU3RvcmFnZSgpIHx8IHBhZ2VQdXRJbmZvLnNpdGUgPT09ICdsb2NhbCcpIHtcbiAgICAgICAgcmV0dXJuIHB1c2hUb0xvY2FsKCRwYWdlLCBwYWdlUHV0SW5mbywgYWN0aW9uKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcHVzaFRvU2VydmVyKCRwYWdlLCBwYWdlUHV0SW5mbywgYWN0aW9uKTtcbiAgICB9XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGJpbmQsIGVkaXRvciwgZW1pdCwgaXRlbXosIHJlc29sdmU7XG5cbmVkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbnJlc29sdmUgPSByZXF1aXJlKCcuL3Jlc29sdmUnKTtcblxuaXRlbXogPSByZXF1aXJlKCcuL2l0ZW16Jyk7XG5cbmVtaXQgPSBmdW5jdGlvbigkaXRlbSwgaXRlbSkge1xuICB2YXIgaSwgbGVuLCByZWYsIHJlc3VsdHMsIHRleHQ7XG4gIHJlZiA9IGl0ZW0udGV4dC5zcGxpdCgvXFxuXFxuKy8pO1xuICByZXN1bHRzID0gW107XG4gIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHRleHQgPSByZWZbaV07XG4gICAgaWYgKHRleHQubWF0Y2goL1xcUy8pKSB7XG4gICAgICByZXN1bHRzLnB1c2goJGl0ZW0uYXBwZW5kKFwiPHA+XCIgKyAocmVzb2x2ZS5yZXNvbHZlTGlua3ModGV4dCkpICsgXCI8L3A+XCIpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHRzO1xufTtcblxuYmluZCA9IGZ1bmN0aW9uKCRpdGVtLCBpdGVtKSB7XG4gIHJldHVybiAkaXRlbS5kYmxjbGljayhmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUuc2hpZnRLZXkpIHtcbiAgICAgIGl0ZW0udHlwZSA9ICdodG1sJztcbiAgICAgIHJldHVybiBpdGVtei5yZXBsYWNlSXRlbSgkaXRlbSwgJ3BhcmFncmFwaCcsIGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZWRpdG9yLnRleHRFZGl0b3IoJGl0ZW0sIGl0ZW0sIHtcbiAgICAgICAgJ2FwcGVuZCc6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZW1pdDogZW1pdCxcbiAgYmluZDogYmluZFxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob3duZXIpIHtcbiAgdmFyIGZhaWx1cmVEbGc7XG4gICQoXCIjdXNlci1lbWFpbFwiKS5oaWRlKCk7XG4gICQoXCIjcGVyc29uYS1sb2dpbi1idG5cIikuaGlkZSgpO1xuICAkKFwiI3BlcnNvbmEtbG9nb3V0LWJ0blwiKS5oaWRlKCk7XG4gIGZhaWx1cmVEbGcgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgcmV0dXJuICQoXCI8ZGl2PjwvZGl2PlwiKS5kaWFsb2coe1xuICAgICAgb3BlbjogZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG4gICAgICAgIHJldHVybiAkKFwiLnVpLWRpYWxvZy10aXRsZWJhci1jbG9zZVwiKS5oaWRlKCk7XG4gICAgICB9LFxuICAgICAgYnV0dG9uczoge1xuICAgICAgICBcIk9rXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQodGhpcykuZGlhbG9nKFwiY2xvc2VcIik7XG4gICAgICAgICAgcmV0dXJuIG5hdmlnYXRvci5pZC5sb2dvdXQoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNsb3NlOiBmdW5jdGlvbihldmVudCwgdWkpIHtcbiAgICAgICAgcmV0dXJuICQodGhpcykucmVtb3ZlKCk7XG4gICAgICB9LFxuICAgICAgcmVzaXphYmxlOiBmYWxzZSxcbiAgICAgIHRpdGxlOiBcIkxvZ2luIEZhaWx1cmVcIixcbiAgICAgIG1vZGFsOiB0cnVlXG4gICAgfSkuaHRtbChtZXNzYWdlKTtcbiAgfTtcbiAgbmF2aWdhdG9yLmlkLndhdGNoKHtcbiAgICBsb2dnZWRJblVzZXI6IG93bmVyLFxuICAgIG9ubG9naW46IGZ1bmN0aW9uKGFzc2VydGlvbikge1xuICAgICAgcmV0dXJuICQucG9zdChcIi9wZXJzb25hX2xvZ2luXCIsIHtcbiAgICAgICAgYXNzZXJ0aW9uOiBhc3NlcnRpb25cbiAgICAgIH0sIGZ1bmN0aW9uKHZlcmlmaWVkKSB7XG4gICAgICAgIHZhciBmYWlsdXJlTXNnO1xuICAgICAgICB2ZXJpZmllZCA9IEpTT04ucGFyc2UodmVyaWZpZWQpO1xuICAgICAgICBpZiAoXCJva2F5XCIgPT09IHZlcmlmaWVkLnN0YXR1cykge1xuICAgICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24gPSBcIi9cIjtcbiAgICAgICAgfSBlbHNlIGlmIChcIndyb25nLWFkZHJlc3NcIiA9PT0gdmVyaWZpZWQuc3RhdHVzKSB7XG4gICAgICAgICAgcmV0dXJuIGZhaWx1cmVEbGcoXCI8cD5TaWduIGluIGlzIGN1cnJlbnRseSBvbmx5IGF2YWlsYWJsZSBmb3IgdGhlIHNpdGUgb3duZXIuPC9wPlwiKTtcbiAgICAgICAgfSBlbHNlIGlmIChcImZhaWx1cmVcIiA9PT0gdmVyaWZpZWQuc3RhdHVzKSB7XG4gICAgICAgICAgaWYgKC9kb21haW4gbWlzbWF0Y2gvLnRlc3QodmVyaWZpZWQucmVhc29uKSkge1xuICAgICAgICAgICAgZmFpbHVyZU1zZyA9IFwiPHA+SXQgbG9va3MgYXMgaWYgeW91IGFyZSBhY2Nlc3NpbmcgdGhlIHNpdGUgdXNpbmcgYW4gYWx0ZXJuYXRpdmUgYWRkcmVzcy48L3A+XCIgKyBcIjxwPlBsZWFzZSBjaGVjayB0aGF0IHlvdSBhcmUgdXNpbmcgdGhlIGNvcnJlY3QgYWRkcmVzcyB0byBhY2Nlc3MgdGhpcyBzaXRlLjwvcD5cIjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmFpbHVyZU1zZyA9IFwiPHA+VW5hYmxlIHRvIGxvZyB5b3UgaW4uPC9wPlwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFpbHVyZURsZyhmYWlsdXJlTXNnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmF2aWdhdG9yLmlkLmxvZ291dCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LFxuICAgIG9ubG9nb3V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAkLnBvc3QoXCIvcGVyc29uYV9sb2dvdXRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24gPSBcIi9cIjtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgb25yZWFkeTogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAob3duZXIpIHtcbiAgICAgICAgJChcIiNwZXJzb25hLWxvZ2luLWJ0blwiKS5oaWRlKCk7XG4gICAgICAgIHJldHVybiAkKFwiI3BlcnNvbmEtbG9nb3V0LWJ0blwiKS5zaG93KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkKFwiI3BlcnNvbmEtbG9naW4tYnRuXCIpLnNob3coKTtcbiAgICAgICAgcmV0dXJuICQoXCIjcGVyc29uYS1sb2dvdXQtYnRuXCIpLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICAkKFwiI3BlcnNvbmEtbG9naW4tYnRuXCIpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5pZC5yZXF1ZXN0KHt9KTtcbiAgfSk7XG4gIHJldHVybiAkKFwiI3BlcnNvbmEtbG9nb3V0LWJ0blwiKS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHJldHVybiBuYXZpZ2F0b3IuaWQubG9nb3V0KCk7XG4gIH0pO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBjYWNoZWRTY3JpcHQsIGVzY2FwZSwgZ2V0U2NyaXB0LCBwbHVnaW4sIHNjcmlwdHMsXG4gICAgaW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBsdWdpbiA9IHt9O1xuXG5lc2NhcGUgPSBmdW5jdGlvbiAocykge1xuICAgIHJldHVybiAoJycgKyBzKS5yZXBsYWNlKC8mL2csICcmYW1wOycpLnJlcGxhY2UoLzwvZywgJyZsdDsnKS5yZXBsYWNlKC8+L2csICcmZ3Q7JykucmVwbGFjZSgvXCIvZywgJyZxdW90OycpLnJlcGxhY2UoLycvZywgJyYjeDI3OycpLnJlcGxhY2UoL1xcLy9nLCAnJiN4MkY7Jyk7XG59O1xuXG5jYWNoZWRTY3JpcHQgPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9ICQuZXh0ZW5kKG9wdGlvbnMgfHwge30sIHtcbiAgICAgICAgZGF0YVR5cGU6IFwic2NyaXB0XCIsXG4gICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICB1cmw6IHVybFxuICAgIH0pO1xuICAgIHJldHVybiAkLmFqYXgob3B0aW9ucyk7XG59O1xuXG5zY3JpcHRzID0gW107XG5cbmdldFNjcmlwdCA9IHBsdWdpbi5nZXRTY3JpcHQgPSBmdW5jdGlvbiAodXJsLCBjYWxsYmFjaykge1xuICAgIGlmIChjYWxsYmFjayA9PSBudWxsKSB7XG4gICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB9O1xuICAgIH1cbiAgICBpZiAoaW5kZXhPZi5jYWxsKHNjcmlwdHMsIHVybCkgPj0gMCkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY2FjaGVkU2NyaXB0KHVybCkuZG9uZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzY3JpcHRzLnB1c2godXJsKTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5wbHVnaW4uZ2V0ID0gcGx1Z2luLmdldFBsdWdpbiA9IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaykge1xuICAgIGlmICh3aW5kb3cucGx1Z2luc1tuYW1lXSkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2sod2luZG93LnBsdWdpbnNbbmFtZV0pO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0U2NyaXB0KFwiL3BsdWdpbnMvXCIgKyBuYW1lICsgXCIvXCIgKyBuYW1lICsgXCIuanNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAod2luZG93LnBsdWdpbnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh3aW5kb3cucGx1Z2luc1tuYW1lXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldFNjcmlwdChcIi9wbHVnaW5zL1wiICsgbmFtZSArIFwiLmpzXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayh3aW5kb3cucGx1Z2luc1tuYW1lXSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxucGx1Z2luW1wiZG9cIl0gPSBwbHVnaW4uZG9QbHVnaW4gPSBmdW5jdGlvbiAoZGl2LCBpdGVtLCBkb25lKSB7XG4gICAgdmFyIGVycm9yO1xuICAgIGlmIChkb25lID09IG51bGwpIHtcbiAgICAgICAgZG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZXJyb3IgPSBmdW5jdGlvbiAoZXgsIHNjcmlwdCkge1xuICAgICAgICBkaXYuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwiZXJyb3JcXFwiPlxcbiAgXCIgKyAoZXNjYXBlKGl0ZW0udGV4dCB8fCBcIlwiKSkgKyBcIlxcbiAgPGJ1dHRvbj5oZWxwPC9idXR0b24+PGJyPlxcbjwvZGl2PlwiKTtcbiAgICAgICAgcmV0dXJuIGRpdi5maW5kKCdidXR0b24nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB3aWtpLmRpYWxvZyhleC50b1N0cmluZygpLCBcIjxwPiBUaGlzIFxcXCJcIiArIGl0ZW0udHlwZSArIFwiXFxcIiBwbHVnaW4gd29uJ3Qgc2hvdy48L3A+XFxuPGxpPiBJcyBpdCBhdmFpbGFibGUgb24gdGhpcyBzZXJ2ZXI/XFxuPGxpPiBJcyBpdHMgbWFya3VwIGNvcnJlY3Q/XFxuPGxpPiBDYW4gaXQgZmluZCBuZWNlc3NhcnkgZGF0YT9cXG48bGk+IEhhcyBuZXR3b3JrIGFjY2VzcyBiZWVuIGludGVycnVwdGVkP1xcbjxsaT4gSGFzIGl0cyBjb2RlIGJlZW4gdGVzdGVkP1xcbjxwPiBEZXZlbG9wZXJzIG1heSBvcGVuIGRlYnVnZ2luZyB0b29scyBhbmQgcmV0cnkgdGhlIHBsdWdpbi48L3A+XFxuPGJ1dHRvbiBjbGFzcz1cXFwicmV0cnlcXFwiPnJldHJ5PC9idXR0b24+XFxuPHA+IExlYXJuIG1vcmVcXG4gIDxhIGNsYXNzPVxcXCJleHRlcm5hbFxcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIHJlbD1cXFwibm9mb2xsb3dcXFwiXFxuICBocmVmPVxcXCJodHRwOi8vcGx1Z2lucy5mZWQud2lraS5vcmcvYWJvdXQtcGx1Z2lucy5odG1sXFxcIlxcbiAgdGl0bGU9XFxcImh0dHA6Ly9wbHVnaW5zLmZlZC53aWtpLm9yZy9hYm91dC1wbHVnaW5zLmh0bWxcXFwiPlxcbiAgICBBYm91dCBQbHVnaW5zXFxuICAgIDxpbWcgc3JjPVxcXCIvaW1hZ2VzL2V4dGVybmFsLWxpbmstbHRyLWljb24ucG5nXFxcIj5cXG4gIDwvYT5cXG48L3A+XCIpO1xuICAgICAgICAgICAgcmV0dXJuICQoJy5yZXRyeScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2NyaXB0LmVtaXQubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2NyaXB0LmVtaXQoZGl2LCBpdGVtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY3JpcHQuYmluZChkaXYsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0LmVtaXQoZGl2LCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgc2NyaXB0LmJpbmQoZGl2LCBpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBkaXYuZGF0YSgncGFnZUVsZW1lbnQnLCBkaXYucGFyZW50cyhcIi5wYWdlXCIpKTtcbiAgICBkaXYuZGF0YSgnaXRlbScsIGl0ZW0pO1xuICAgIHJldHVybiBwbHVnaW4uZ2V0KGl0ZW0udHlwZSwgZnVuY3Rpb24gKHNjcmlwdCkge1xuICAgICAgICB2YXIgZXJyO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHNjcmlwdCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgZmluZCBwbHVnaW4gZm9yICdcIiArIGl0ZW0udHlwZSArIFwiJ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzY3JpcHQuZW1pdC5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNjcmlwdC5lbWl0KGRpdiwgaXRlbSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzY3JpcHQuYmluZChkaXYsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY3JpcHQuZW1pdChkaXYsIGl0ZW0pO1xuICAgICAgICAgICAgICAgIHNjcmlwdC5iaW5kKGRpdiwgaXRlbSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoX2Vycm9yKSB7XG4gICAgICAgICAgICBlcnIgPSBfZXJyb3I7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncGx1Z2luIGVycm9yJywgZXJyKTtcbiAgICAgICAgICAgIGVycm9yKGVyciwgc2NyaXB0KTtcbiAgICAgICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnBsdWdpbi5yZWdpc3RlclBsdWdpbiA9IGZ1bmN0aW9uIChwbHVnaW5OYW1lLCBwbHVnaW5Gbikge1xuICAgIHJldHVybiB3aW5kb3cucGx1Z2luc1twbHVnaW5OYW1lXSA9IHBsdWdpbkZuKCQpO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbndpbmRvdy5wbHVnaW5zID0ge1xuICByZWZlcmVuY2U6IHJlcXVpcmUoJy4vcmVmZXJlbmNlJyksXG4gIGZhY3Rvcnk6IHJlcXVpcmUoJy4vZmFjdG9yeScpLFxuICBwYXJhZ3JhcGg6IHJlcXVpcmUoJy4vcGFyYWdyYXBoJyksXG4gIGltYWdlOiByZXF1aXJlKCcuL2ltYWdlJyksXG4gIGZ1dHVyZTogcmVxdWlyZSgnLi9mdXR1cmUnKVxufTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgaXRlbUlkLCByYW5kb21CeXRlLCByYW5kb21CeXRlcztcblxudmFyIHJjaGFycyA9IFwiMDEyMzQ1Njc4OUFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFRaYWJjZGVmZ2hpa2xtbm9wcXJzdHV2d3h5el9cIjtcbnJhbmRvbUJ5dGVzID0gZnVuY3Rpb24gKG4pIHtcbiAgICB2YXIgciA9ICcnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIHIgKz0gcmNoYXJzWyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiByY2hhcnMubGVuZ3RoKSBdO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbn1cblxucmFuZG9tQnl0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcmFuZG9tQnl0ZXMoMSk7XG4gICAgLy9yZXR1cm4gKCgoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDApIHwgMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbn07XG5cbi8vXG4vL3JhbmRvbUJ5dGVzID0gZnVuY3Rpb24obikge1xuLy8gIHJldHVybiAoKGZ1bmN0aW9uKCkge1xuLy8gICAgdmFyIGksIHJlZiwgcmVzdWx0cztcbi8vICAgIHJlc3VsdHMgPSBbXTtcbi8vICAgIGZvciAoaSA9IDEsIHJlZiA9IG47IDEgPD0gcmVmID8gaSA8PSByZWYgOiBpID49IHJlZjsgMSA8PSByZWYgPyBpKysgOiBpLS0pIHtcbi8vICAgICAgcmVzdWx0cy5wdXNoKHJhbmRvbUJ5dGUoKSk7XG4vLyAgICB9XG4vLyAgICByZXR1cm4gcmVzdWx0cztcbi8vICB9KSgpKS5qb2luKCcnKTtcbi8vfTtcblxuaXRlbUlkID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByYW5kb21CeXRlcyg4KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHJhbmRvbUJ5dGU6IHJhbmRvbUJ5dGUsXG4gICAgcmFuZG9tQnl0ZXM6IHJhbmRvbUJ5dGVzLFxuICAgIGl0ZW1JZDogaXRlbUlkXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGJpbmQsIGVkaXRvciwgZW1pdCwgcGFnZSwgcmVzb2x2ZTtcblxuZWRpdG9yID0gcmVxdWlyZSgnLi9lZGl0b3InKTtcblxucmVzb2x2ZSA9IHJlcXVpcmUoJy4vcmVzb2x2ZScpO1xuXG5wYWdlID0gcmVxdWlyZSgnLi9wYWdlJyk7XG5cbmVtaXQgPSBmdW5jdGlvbigkaXRlbSwgaXRlbSkge1xuICB2YXIgc2l0ZSwgc2x1ZztcbiAgc2x1ZyA9IGl0ZW0uc2x1ZztcbiAgaWYgKGl0ZW0udGl0bGUgIT0gbnVsbCkge1xuICAgIHNsdWcgfHwgKHNsdWcgPSBwYWdlLmFzU2x1ZyhpdGVtLnRpdGxlKSk7XG4gIH1cbiAgc2x1ZyB8fCAoc2x1ZyA9ICdpbmRleCcpO1xuICBzaXRlID0gaXRlbS5zaXRlO1xuICByZXR1cm4gcmVzb2x2ZS5yZXNvbHZlRnJvbShzaXRlLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJGl0ZW0uYXBwZW5kKFwiPHAgc3R5bGU9J21hcmdpbi1ib3R0b206M3B4Oyc+XFxuICA8aW1nIGNsYXNzPSdyZW1vdGUnXFxuICAgIHNyYz0nLy9cIiArIHNpdGUgKyBcIi9mYXZpY29uLnBuZydcXG4gICAgdGl0bGU9J1wiICsgc2l0ZSArIFwiJ1xcbiAgICBkYXRhLXNpdGU9XFxcIlwiICsgc2l0ZSArIFwiXFxcIlxcbiAgICBkYXRhLXNsdWc9XFxcIlwiICsgc2x1ZyArIFwiXFxcIlxcbiAgPlxcbiAgXCIgKyAocmVzb2x2ZS5yZXNvbHZlTGlua3MoXCJbW1wiICsgKGl0ZW0udGl0bGUgfHwgc2x1ZykgKyBcIl1dXCIpKSArIFwiXFxuPC9wPlxcbjxkaXY+XFxuICBcIiArIChyZXNvbHZlLnJlc29sdmVMaW5rcyhpdGVtLnRleHQpKSArIFwiXFxuPC9kaXY+XCIpO1xuICB9KTtcbn07XG5cbmJpbmQgPSBmdW5jdGlvbigkaXRlbSwgaXRlbSkge1xuICByZXR1cm4gJGl0ZW0uZGJsY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGVkaXRvci50ZXh0RWRpdG9yKCRpdGVtLCBpdGVtKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZW1pdDogZW1pdCxcbiAgYmluZDogYmluZFxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBfLCBhY3Rpb25TeW1ib2xzLCBhZGRUb0pvdXJuYWwsIGFsaWFzSXRlbSwgYXNTbHVnLCBidWlsZFBhZ2UsIGNyZWF0ZUZhY3RvcnksIGNyZWF0ZU1pc3NpbmdGbGFnLCBjeWNsZSwgZWRpdERhdGUsIGVtaXRDb250cm9scywgZW1pdEZvb3RlciwgZW1pdEhlYWRlciwgZW1pdFRpbWVzdGFtcCwgZW1pdFR3aW5zLCBnZXRJdGVtLCBnZXRQYWdlT2JqZWN0LCBoYW5kbGVEcmFnZ2luZywgaGFuZGxlSGVhZGVyQ2xpY2ssIGhhbmRsZU1lcmdpbmcsIGluaXRBZGRCdXR0b24sIGluaXREcmFnZ2luZywgaW5pdE1lcmdpbmcsIGxpbmV1cCwgbmVpZ2hib3Job29kLCBuZXdQYWdlLCBwYWdlRW1pdHRlciwgcGFnZUhhbmRsZXIsIHBhZ2VNb2R1bGUsIHBsdWdpbiwgcmFuZG9tLCByZWJ1aWxkUGFnZSwgcmVuZGVyUGFnZUludG9QYWdlRWxlbWVudCwgcmVzb2x2ZSwgc3RhdGU7XG5cbl8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbnBhZ2VIYW5kbGVyID0gcmVxdWlyZSgnLi9wYWdlSGFuZGxlcicpO1xuXG5wbHVnaW4gPSByZXF1aXJlKCcuL3BsdWdpbicpO1xuXG5zdGF0ZSA9IHJlcXVpcmUoJy4vc3RhdGUnKTtcblxubmVpZ2hib3Job29kID0gcmVxdWlyZSgnLi9uZWlnaGJvcmhvb2QnKTtcblxuYWRkVG9Kb3VybmFsID0gcmVxdWlyZSgnLi9hZGRUb0pvdXJuYWwnKTtcblxuYWN0aW9uU3ltYm9scyA9IHJlcXVpcmUoJy4vYWN0aW9uU3ltYm9scycpO1xuXG5saW5ldXAgPSByZXF1aXJlKCcuL2xpbmV1cCcpO1xuXG5yZXNvbHZlID0gcmVxdWlyZSgnLi9yZXNvbHZlJyk7XG5cbnJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyk7XG5cbnBhZ2VNb2R1bGUgPSByZXF1aXJlKCcuL3BhZ2UnKTtcblxubmV3UGFnZSA9IHBhZ2VNb2R1bGUubmV3UGFnZTtcblxuYXNTbHVnID0gcGFnZU1vZHVsZS5hc1NsdWc7XG5cbnBhZ2VFbWl0dGVyID0gcGFnZU1vZHVsZS5wYWdlRW1pdHRlcjtcblxuZ2V0SXRlbSA9IGZ1bmN0aW9uKCRpdGVtKSB7XG4gIGlmICgkKCRpdGVtKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuICQoJGl0ZW0pLmRhdGEoXCJpdGVtXCIpIHx8ICQoJGl0ZW0pLmRhdGEoJ3N0YXRpY0l0ZW0nKTtcbiAgfVxufTtcblxuYWxpYXNJdGVtID0gZnVuY3Rpb24oJHBhZ2UsICRpdGVtLCBvbGRJdGVtKSB7XG4gIHZhciBpdGVtLCBwYWdlT2JqZWN0O1xuICBpdGVtID0gJC5leHRlbmQoe30sIG9sZEl0ZW0pO1xuICBwYWdlT2JqZWN0ID0gbGluZXVwLmF0S2V5KCRwYWdlLmRhdGEoJ2tleScpKTtcbiAgaWYgKHBhZ2VPYmplY3QuZ2V0SXRlbShpdGVtLmlkKSAhPSBudWxsKSB7XG4gICAgaXRlbS5hbGlhcyB8fCAoaXRlbS5hbGlhcyA9IGl0ZW0uaWQpO1xuICAgIGl0ZW0uaWQgPSByYW5kb20uaXRlbUlkKCk7XG4gICAgJGl0ZW0uYXR0cignZGF0YS1pZCcsIGl0ZW0uaWQpO1xuICB9IGVsc2UgaWYgKGl0ZW0uYWxpYXMgIT0gbnVsbCkge1xuICAgIGlmIChwYWdlT2JqZWN0LmdldEl0ZW0oaXRlbS5hbGlhcykgPT0gbnVsbCkge1xuICAgICAgaXRlbS5pZCA9IGl0ZW0uYWxpYXM7XG4gICAgICBkZWxldGUgaXRlbS5hbGlhcztcbiAgICAgICRpdGVtLmF0dHIoJ2RhdGEtaWQnLCBpdGVtLmlkKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGl0ZW07XG59O1xuXG5oYW5kbGVEcmFnZ2luZyA9IGZ1bmN0aW9uKGV2dCwgdWkpIHtcbiAgdmFyICRiZWZvcmUsICRkZXN0aW5hdGlvblBhZ2UsICRpdGVtLCAkc291cmNlUGFnZSwgJHRoaXNQYWdlLCBhY3Rpb24sIGJlZm9yZSwgZXF1YWxzLCBpdGVtLCBtb3ZlRnJvbVBhZ2UsIG1vdmVUb1BhZ2UsIG1vdmVXaXRoaW5QYWdlLCBvcmRlciwgc291cmNlU2l0ZTtcbiAgJGl0ZW0gPSB1aS5pdGVtO1xuICBpdGVtID0gZ2V0SXRlbSgkaXRlbSk7XG4gICR0aGlzUGFnZSA9ICQodGhpcykucGFyZW50cygnLnBhZ2U6Zmlyc3QnKTtcbiAgJHNvdXJjZVBhZ2UgPSAkaXRlbS5kYXRhKCdwYWdlRWxlbWVudCcpO1xuICBzb3VyY2VTaXRlID0gJHNvdXJjZVBhZ2UuZGF0YSgnc2l0ZScpO1xuICAkZGVzdGluYXRpb25QYWdlID0gJGl0ZW0ucGFyZW50cygnLnBhZ2U6Zmlyc3QnKTtcbiAgZXF1YWxzID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBhICYmIGIgJiYgYS5nZXQoMCkgPT09IGIuZ2V0KDApO1xuICB9O1xuICBtb3ZlV2l0aGluUGFnZSA9ICEkc291cmNlUGFnZSB8fCBlcXVhbHMoJHNvdXJjZVBhZ2UsICRkZXN0aW5hdGlvblBhZ2UpO1xuICBtb3ZlRnJvbVBhZ2UgPSAhbW92ZVdpdGhpblBhZ2UgJiYgZXF1YWxzKCR0aGlzUGFnZSwgJHNvdXJjZVBhZ2UpO1xuICBtb3ZlVG9QYWdlID0gIW1vdmVXaXRoaW5QYWdlICYmIGVxdWFscygkdGhpc1BhZ2UsICRkZXN0aW5hdGlvblBhZ2UpO1xuICBpZiAobW92ZUZyb21QYWdlKSB7XG4gICAgaWYgKCRzb3VyY2VQYWdlLmhhc0NsYXNzKCdnaG9zdCcpIHx8ICRzb3VyY2VQYWdlLmF0dHIoJ2lkJykgPT09ICRkZXN0aW5hdGlvblBhZ2UuYXR0cignaWQnKSB8fCBldnQuc2hpZnRLZXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cbiAgYWN0aW9uID0gbW92ZVdpdGhpblBhZ2UgPyAob3JkZXIgPSAkKHRoaXMpLmNoaWxkcmVuKCkubWFwKGZ1bmN0aW9uKF8sIHZhbHVlKSB7XG4gICAgcmV0dXJuICQodmFsdWUpLmF0dHIoJ2RhdGEtaWQnKTtcbiAgfSkuZ2V0KCksIHtcbiAgICB0eXBlOiAnbW92ZScsXG4gICAgb3JkZXI6IG9yZGVyXG4gIH0pIDogbW92ZUZyb21QYWdlID8gKGNvbnNvbGUubG9nKCdkcmFnIGZyb20nLCAkc291cmNlUGFnZS5maW5kKCdoMScpLnRleHQoKSksIHtcbiAgICB0eXBlOiAncmVtb3ZlJ1xuICB9KSA6IG1vdmVUb1BhZ2UgPyAoJGl0ZW0uZGF0YSgncGFnZUVsZW1lbnQnLCAkdGhpc1BhZ2UpLCAkYmVmb3JlID0gJGl0ZW0ucHJldignLml0ZW0nKSwgYmVmb3JlID0gZ2V0SXRlbSgkYmVmb3JlKSwgaXRlbSA9IGFsaWFzSXRlbSgkdGhpc1BhZ2UsICRpdGVtLCBpdGVtKSwge1xuICAgIHR5cGU6ICdhZGQnLFxuICAgIGl0ZW06IGl0ZW0sXG4gICAgYWZ0ZXI6IGJlZm9yZSAhPSBudWxsID8gYmVmb3JlLmlkIDogdm9pZCAwXG4gIH0pIDogdm9pZCAwO1xuICBhY3Rpb24uaWQgPSBpdGVtLmlkO1xuICByZXR1cm4gcGFnZUhhbmRsZXIucHV0KCR0aGlzUGFnZSwgYWN0aW9uKTtcbn07XG5cbmluaXREcmFnZ2luZyA9IGZ1bmN0aW9uKCRwYWdlKSB7XG4gIHZhciAkc3RvcnksIG9wdGlvbnM7XG4gIG9wdGlvbnMgPSB7XG4gICAgY29ubmVjdFdpdGg6ICcucGFnZSAuc3RvcnknLFxuICAgIHBsYWNlaG9sZGVyOiAnaXRlbS1wbGFjZWhvbGRlcicsXG4gICAgZm9yY2VQbGFjZWhvbGRlclNpemU6IHRydWVcbiAgfTtcbiAgJHN0b3J5ID0gJHBhZ2UuZmluZCgnLnN0b3J5Jyk7XG4gIHJldHVybiAkc3Rvcnkuc29ydGFibGUob3B0aW9ucykub24oJ3NvcnR1cGRhdGUnLCBoYW5kbGVEcmFnZ2luZyk7XG59O1xuXG5nZXRQYWdlT2JqZWN0ID0gZnVuY3Rpb24oJGpvdXJuYWwpIHtcbiAgdmFyICRwYWdlO1xuICAkcGFnZSA9ICQoJGpvdXJuYWwpLnBhcmVudHMoJy5wYWdlOmZpcnN0Jyk7XG4gIHJldHVybiBsaW5ldXAuYXRLZXkoJHBhZ2UuZGF0YSgna2V5JykpO1xufTtcblxuaGFuZGxlTWVyZ2luZyA9IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuICB2YXIgZHJhZywgZHJvcDtcbiAgZHJhZyA9IGdldFBhZ2VPYmplY3QodWkuZHJhZ2dhYmxlKTtcbiAgZHJvcCA9IGdldFBhZ2VPYmplY3QoZXZlbnQudGFyZ2V0KTtcbiAgcmV0dXJuIHBhZ2VFbWl0dGVyLmVtaXQoJ3Nob3cnLCBkcm9wLm1lcmdlKGRyYWcpKTtcbn07XG5cbmluaXRNZXJnaW5nID0gZnVuY3Rpb24oJHBhZ2UpIHtcbiAgdmFyICRqb3VybmFsO1xuICAkam91cm5hbCA9ICRwYWdlLmZpbmQoJy5qb3VybmFsJyk7XG4gICRqb3VybmFsLmRyYWdnYWJsZSh7XG4gICAgcmV2ZXJ0OiB0cnVlLFxuICAgIGFwcGVuZFRvOiAnLm1haW4nLFxuICAgIHNjcm9sbDogZmFsc2UsXG4gICAgaGVscGVyOiAnY2xvbmUnXG4gIH0pO1xuICByZXR1cm4gJGpvdXJuYWwuZHJvcHBhYmxlKHtcbiAgICBob3ZlckNsYXNzOiBcInVpLXN0YXRlLWhvdmVyXCIsXG4gICAgZHJvcDogaGFuZGxlTWVyZ2luZ1xuICB9KTtcbn07XG5cbmluaXRBZGRCdXR0b24gPSBmdW5jdGlvbigkcGFnZSkge1xuICByZXR1cm4gJHBhZ2UuZmluZChcIi5hZGQtZmFjdG9yeVwiKS5vbihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2dCkge1xuICAgIGlmICgkcGFnZS5oYXNDbGFzcygnZ2hvc3QnKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICByZXR1cm4gY3JlYXRlRmFjdG9yeSgkcGFnZSk7XG4gIH0pO1xufTtcblxuY3JlYXRlRmFjdG9yeSA9IGZ1bmN0aW9uKCRwYWdlKSB7XG4gIHZhciAkYmVmb3JlLCAkaXRlbSwgYmVmb3JlLCBpdGVtO1xuICBpdGVtID0ge1xuICAgIHR5cGU6IFwiZmFjdG9yeVwiLFxuICAgIGlkOiByYW5kb20uaXRlbUlkKClcbiAgfTtcbiAgJGl0ZW0gPSAkKFwiPGRpdiAvPlwiLCB7XG4gICAgXCJjbGFzc1wiOiBcIml0ZW0gZmFjdG9yeVwiXG4gIH0pLmRhdGEoJ2l0ZW0nLCBpdGVtKS5hdHRyKCdkYXRhLWlkJywgaXRlbS5pZCk7XG4gICRpdGVtLmRhdGEoJ3BhZ2VFbGVtZW50JywgJHBhZ2UpO1xuICAkcGFnZS5maW5kKFwiLnN0b3J5XCIpLmFwcGVuZCgkaXRlbSk7XG4gIHBsdWdpbltcImRvXCJdKCRpdGVtLCBpdGVtKTtcbiAgJGJlZm9yZSA9ICRpdGVtLnByZXYoJy5pdGVtJyk7XG4gIGJlZm9yZSA9IGdldEl0ZW0oJGJlZm9yZSk7XG4gIHJldHVybiBwYWdlSGFuZGxlci5wdXQoJHBhZ2UsIHtcbiAgICBpdGVtOiBpdGVtLFxuICAgIGlkOiBpdGVtLmlkLFxuICAgIHR5cGU6IFwiYWRkXCIsXG4gICAgYWZ0ZXI6IGJlZm9yZSAhPSBudWxsID8gYmVmb3JlLmlkIDogdm9pZCAwXG4gIH0pO1xufTtcblxuaGFuZGxlSGVhZGVyQ2xpY2sgPSBmdW5jdGlvbihlKSB7XG4gIHZhciAkcGFnZSwgY3J1bWJzLCBlYWNoLCBuZXdXaW5kb3csIHRhcmdldDtcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICBsaW5ldXAuZGVidWdTZWxmQ2hlY2soKGZ1bmN0aW9uKCkge1xuICAgIHZhciBqLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSAkKCcucGFnZScpO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGVhY2ggPSByZWZbal07XG4gICAgICByZXN1bHRzLnB1c2goJChlYWNoKS5kYXRhKCdrZXknKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9KSgpKTtcbiAgJHBhZ2UgPSAkKGUudGFyZ2V0KS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICBjcnVtYnMgPSBsaW5ldXAuY3J1bWJzKCRwYWdlLmRhdGEoJ2tleScpLCBsb2NhdGlvbi5ob3N0KTtcbiAgdGFyZ2V0ID0gY3J1bWJzWzBdO1xuICBuZXdXaW5kb3cgPSB3aW5kb3cub3BlbihcIi8vXCIgKyAoY3J1bWJzLmpvaW4oJy8nKSksIHRhcmdldCk7XG4gIHJldHVybiBuZXdXaW5kb3cuZm9jdXMoKTtcbn07XG5cbmVtaXRIZWFkZXIgPSBmdW5jdGlvbigkaGVhZGVyLCAkcGFnZSwgcGFnZU9iamVjdCkge1xuICB2YXIgcmVtb3RlLCB0b29sdGlwO1xuICByZW1vdGUgPSBwYWdlT2JqZWN0LmdldFJlbW90ZVNpdGUobG9jYXRpb24uaG9zdCk7XG4gIHRvb2x0aXAgPSBwYWdlT2JqZWN0LmdldFJlbW90ZVNpdGVEZXRhaWxzKGxvY2F0aW9uLmhvc3QpO1xuICAkaGVhZGVyLmFwcGVuZChcIjxoMSB0aXRsZT1cXFwiXCIgKyB0b29sdGlwICsgXCJcXFwiPlxcbiAgPGEgaHJlZj1cXFwiXCIgKyAocGFnZU9iamVjdC5zaXRlTGluZXVwKCkpICsgXCJcXFwiIHRhcmdldD1cXFwiXCIgKyByZW1vdGUgKyBcIlxcXCI+XFxuICAgIDxpbWcgc3JjPVxcXCIvL1wiICsgcmVtb3RlICsgXCIvZmF2aWNvbi5wbmdcXFwiIGhlaWdodD1cXFwiMzJweFxcXCIgY2xhc3M9XFxcImZhdmljb25cXFwiPlxcbiAgPC9hPiBcIiArIChyZXNvbHZlLmVzY2FwZShwYWdlT2JqZWN0LmdldFRpdGxlKCkpKSArIFwiXFxuPC9oMT5cIik7XG4gIHJldHVybiAkaGVhZGVyLmZpbmQoJ2EnKS5vbignY2xpY2snLCBoYW5kbGVIZWFkZXJDbGljayk7XG59O1xuXG5lbWl0VGltZXN0YW1wID0gZnVuY3Rpb24oJGhlYWRlciwgJHBhZ2UsIHBhZ2VPYmplY3QpIHtcbiAgaWYgKCRwYWdlLmF0dHIoJ2lkJykubWF0Y2goL19yZXYvKSkge1xuICAgICRwYWdlLmFkZENsYXNzKCdnaG9zdCcpO1xuICAgICRwYWdlLmRhdGEoJ3JldicsIHBhZ2VPYmplY3QuZ2V0UmV2aXNpb24oKSk7XG4gICAgcmV0dXJuICRoZWFkZXIuYXBwZW5kKCQoXCI8aDIgY2xhc3M9XFxcInJldmlzaW9uXFxcIj5cXG4gIDxzcGFuPlxcbiAgICBcIiArIChwYWdlT2JqZWN0LmdldFRpbWVzdGFtcCgpKSArIFwiXFxuICA8L3NwYW4+XFxuPC9oMj5cIikpO1xuICB9XG59O1xuXG5lbWl0Q29udHJvbHMgPSBmdW5jdGlvbigkam91cm5hbCkge1xuICByZXR1cm4gJGpvdXJuYWwuYXBwZW5kKFwiPGRpdiBjbGFzcz1cXFwiY29udHJvbC1idXR0b25zXFxcIj5cXG4gIDxhIGhyZWY9XFxcIiNcXFwiIGNsYXNzPVxcXCJidXR0b24gZm9yay1wYWdlXFxcIiB0aXRsZT1cXFwiZm9yayB0aGlzIHBhZ2VcXFwiPlwiICsgYWN0aW9uU3ltYm9scy5mb3JrICsgXCI8L2E+XFxuICA8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwiYnV0dG9uIGFkZC1mYWN0b3J5XFxcIiB0aXRsZT1cXFwiYWRkIHBhcmFncmFwaFxcXCI+XCIgKyBhY3Rpb25TeW1ib2xzLmFkZCArIFwiPC9hPlxcbjwvZGl2PlwiKTtcbn07XG5cbmVtaXRGb290ZXIgPSBmdW5jdGlvbigkZm9vdGVyLCBwYWdlT2JqZWN0KSB7XG4gIHZhciBob3N0LCBzbHVnO1xuICBob3N0ID0gcGFnZU9iamVjdC5nZXRSZW1vdGVTaXRlKGxvY2F0aW9uLmhvc3QpO1xuICBzbHVnID0gcGFnZU9iamVjdC5nZXRTbHVnKCk7XG4gIHJldHVybiAkZm9vdGVyLmFwcGVuZChcbiAgICAgIC8vXCI8YSBpZD1cXFwibGljZW5zZVxcXCIgaHJlZj1cXFwiaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbGljZW5zZXMvYnktc2EvNC4wL1xcXCI+Q0MgQlktU0EgNC4wPC9hPiAuXFxuJyBcIiArXG4gICAgICBcIjxhIGNsYXNzPVxcXCJzaG93LXBhZ2Utc291cmNlXFxcIiBocmVmPVxcXCIvXCIgKyBzbHVnICsgXCIuanNvblwiICtcbiAgICAgICAgICBcIj9yYW5kb209XCIgKyAocmFuZG9tLnJhbmRvbUJ5dGVzKDQpKSArXG4gICAgICBcIlxcXCIgdGl0bGU9XFxcInNvdXJjZVxcXCI+SlNPTjwvYT4gPGEgaHJlZj0gXFxcIi8vXCIgKyBob3N0ICsgXCIvXCIgKyBzbHVnICsgXCIuaHRtbFxcXCIgdGFyZ2V0PVxcXCJcIiArIGhvc3QgKyBcIlxcXCI+XCIgKyBob3N0ICsgXCIgPC9hPlwiKTtcbn07XG5cbmVkaXREYXRlID0gZnVuY3Rpb24oam91cm5hbCkge1xuICB2YXIgYWN0aW9uLCBqLCByZWY7XG4gIHJlZiA9IGpvdXJuYWwgfHwgW107XG4gIGZvciAoaiA9IHJlZi5sZW5ndGggLSAxOyBqID49IDA7IGogKz0gLTEpIHtcbiAgICBhY3Rpb24gPSByZWZbal07XG4gICAgaWYgKGFjdGlvbi5kYXRlICYmIGFjdGlvbi50eXBlICE9PSAnZm9yaycpIHtcbiAgICAgIHJldHVybiBhY3Rpb24uZGF0ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZvaWQgMDtcbn07XG5cbmVtaXRUd2lucyA9IGZ1bmN0aW9uKCRwYWdlKSB7XG4gIHZhciBiaW4sIGJpbnMsIGZsYWdzLCBpLCBpbmZvLCBpdGVtLCBqLCBsZWdlbmQsIGxlbiwgcGFnZSwgcmVmLCByZWYxLCByZW1vdGVTaXRlLCBzaXRlLCBzbHVnLCB0d2lucywgdmlld2luZztcbiAgcGFnZSA9ICRwYWdlLmRhdGEoJ2RhdGEnKTtcbiAgaWYgKCFwYWdlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHNpdGUgPSAkcGFnZS5kYXRhKCdzaXRlJykgfHwgd2luZG93LmxvY2F0aW9uLmhvc3Q7XG4gIGlmIChzaXRlID09PSAndmlldycgfHwgc2l0ZSA9PT0gJ29yaWdpbicpIHtcbiAgICBzaXRlID0gd2luZG93LmxvY2F0aW9uLmhvc3Q7XG4gIH1cbiAgc2x1ZyA9IGFzU2x1ZyhwYWdlLnRpdGxlKTtcbiAgaWYgKHZpZXdpbmcgPSBlZGl0RGF0ZShwYWdlLmpvdXJuYWwpKSB7XG4gICAgYmlucyA9IHtcbiAgICAgIG5ld2VyOiBbXSxcbiAgICAgIHNhbWU6IFtdLFxuICAgICAgb2xkZXI6IFtdXG4gICAgfTtcbiAgICByZWYgPSBuZWlnaGJvcmhvb2Quc2l0ZXM7XG4gICAgZm9yIChyZW1vdGVTaXRlIGluIHJlZikge1xuICAgICAgaW5mbyA9IHJlZltyZW1vdGVTaXRlXTtcbiAgICAgIGlmIChyZW1vdGVTaXRlICE9PSBzaXRlICYmIChpbmZvLnNpdGVtYXAgIT0gbnVsbCkpIHtcbiAgICAgICAgcmVmMSA9IGluZm8uc2l0ZW1hcDtcbiAgICAgICAgZm9yIChqID0gMCwgbGVuID0gcmVmMS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICAgIGl0ZW0gPSByZWYxW2pdO1xuICAgICAgICAgIGlmIChpdGVtLnNsdWcgPT09IHNsdWcpIHtcbiAgICAgICAgICAgIGJpbiA9IGl0ZW0uZGF0ZSA+IHZpZXdpbmcgPyBiaW5zLm5ld2VyIDogaXRlbS5kYXRlIDwgdmlld2luZyA/IGJpbnMub2xkZXIgOiBiaW5zLnNhbWU7XG4gICAgICAgICAgICBiaW4ucHVzaCh7XG4gICAgICAgICAgICAgIHJlbW90ZVNpdGU6IHJlbW90ZVNpdGUsXG4gICAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0d2lucyA9IFtdO1xuICAgIGZvciAobGVnZW5kIGluIGJpbnMpIHtcbiAgICAgIGJpbiA9IGJpbnNbbGVnZW5kXTtcbiAgICAgIGlmICghYmluLmxlbmd0aCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGJpbi5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEuaXRlbS5kYXRlIDwgYi5pdGVtLmRhdGU7XG4gICAgICB9KTtcbiAgICAgIGZsYWdzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaywgbGVuMSwgcmVmMiwgcmVzdWx0cztcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGkgPSBrID0gMCwgbGVuMSA9IGJpbi5sZW5ndGg7IGsgPCBsZW4xOyBpID0gKytrKSB7XG4gICAgICAgICAgcmVmMiA9IGJpbltpXSwgcmVtb3RlU2l0ZSA9IHJlZjIucmVtb3RlU2l0ZSwgaXRlbSA9IHJlZjIuaXRlbTtcbiAgICAgICAgICBpZiAoaSA+PSA4KSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKFwiPGltZyBjbGFzcz1cXFwicmVtb3RlXFxcIlxcbnNyYz1cXFwiaHR0cDovL1wiICsgcmVtb3RlU2l0ZSArIFwiL2Zhdmljb24ucG5nXFxcIlxcbmRhdGEtc2x1Zz1cXFwiXCIgKyBzbHVnICsgXCJcXFwiXFxuZGF0YS1zaXRlPVxcXCJcIiArIHJlbW90ZVNpdGUgKyBcIlxcXCJcXG50aXRsZT1cXFwiXCIgKyByZW1vdGVTaXRlICsgXCJcXFwiPlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0pKCk7XG4gICAgICB0d2lucy5wdXNoKChmbGFncy5qb2luKCcmbmJzcDsnKSkgKyBcIiBcIiArIGxlZ2VuZCk7XG4gICAgfVxuICAgIGlmICh0d2lucyAmJiB0d2lucy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gJHBhZ2UuZmluZCgnLnR3aW5zJykuaHRtbChcIjxwPlwiICsgKHR3aW5zLmpvaW4oXCIsIFwiKSkgKyBcIjwvcD5cIik7XG4gICAgfVxuICB9XG59O1xuXG5yZW5kZXJQYWdlSW50b1BhZ2VFbGVtZW50ID0gZnVuY3Rpb24ocGFnZU9iamVjdCwgJHBhZ2UpIHtcbiAgdmFyICRmb290ZXIsICRoZWFkZXIsICRqb3VybmFsLCAkc3RvcnksICR0d2lucywgZWFjaCwgcmVmO1xuICAkcGFnZS5kYXRhKFwiZGF0YVwiLCBwYWdlT2JqZWN0LmdldFJhd1BhZ2UoKSk7XG4gIGlmIChwYWdlT2JqZWN0LmlzUmVtb3RlKCkpIHtcbiAgICAkcGFnZS5kYXRhKFwic2l0ZVwiLCBwYWdlT2JqZWN0LmdldFJlbW90ZVNpdGUoKSk7XG4gIH1cbiAgY29uc29sZS5sb2coJy5wYWdlIGtleXMgJywgKGZ1bmN0aW9uKCkge1xuICAgIHZhciBqLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSAkKCcucGFnZScpO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGVhY2ggPSByZWZbal07XG4gICAgICByZXN1bHRzLnB1c2goJChlYWNoKS5kYXRhKCdrZXknKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9KSgpKTtcbiAgY29uc29sZS5sb2coJ2xpbmV1cCBrZXlzJywgbGluZXVwLmRlYnVnS2V5cygpKTtcbiAgcmVzb2x2ZS5yZXNvbHV0aW9uQ29udGV4dCA9IHBhZ2VPYmplY3QuZ2V0Q29udGV4dCgpO1xuICAkcGFnZS5lbXB0eSgpO1xuICByZWYgPSBbJ3R3aW5zJywgJ2hlYWRlcicsICdzdG9yeScsICdqb3VybmFsJywgJ2Zvb3RlciddLm1hcChmdW5jdGlvbihjbGFzc05hbWUpIHtcbiAgICByZXR1cm4gJChcIjxkaXYgLz5cIikuYWRkQ2xhc3MoY2xhc3NOYW1lKS5hcHBlbmRUbygkcGFnZSk7XG4gIH0pLCAkdHdpbnMgPSByZWZbMF0sICRoZWFkZXIgPSByZWZbMV0sICRzdG9yeSA9IHJlZlsyXSwgJGpvdXJuYWwgPSByZWZbM10sICRmb290ZXIgPSByZWZbNF07XG4gIGVtaXRIZWFkZXIoJGhlYWRlciwgJHBhZ2UsIHBhZ2VPYmplY3QpO1xuICBlbWl0VGltZXN0YW1wKCRoZWFkZXIsICRwYWdlLCBwYWdlT2JqZWN0KTtcbiAgcGFnZU9iamVjdC5zZXFJdGVtcyhmdW5jdGlvbihpdGVtLCBkb25lKSB7XG4gICAgdmFyICRpdGVtO1xuICAgICRpdGVtID0gJChcIjxkaXYgY2xhc3M9XFxcIml0ZW0gXCIgKyBpdGVtLnR5cGUgKyBcIlxcXCIgZGF0YS1pZD1cXFwiXCIgKyBpdGVtLmlkICsgXCJcXFwiPlwiKTtcbiAgICAkc3RvcnkuYXBwZW5kKCRpdGVtKTtcbiAgICByZXR1cm4gcGx1Z2luW1wiZG9cIl0oJGl0ZW0sIGl0ZW0sIGRvbmUpO1xuICB9KTtcbiAgcGFnZU9iamVjdC5zZXFBY3Rpb25zKGZ1bmN0aW9uKGVhY2gsIGRvbmUpIHtcbiAgICBpZiAoZWFjaC5zZXBhcmF0b3IpIHtcbiAgICAgIGFkZFRvSm91cm5hbCgkam91cm5hbCwgZWFjaC5zZXBhcmF0b3IpO1xuICAgIH1cbiAgICBhZGRUb0pvdXJuYWwoJGpvdXJuYWwsIGVhY2guYWN0aW9uKTtcbiAgICByZXR1cm4gZG9uZSgpO1xuICB9KTtcbiAgZW1pdFR3aW5zKCRwYWdlKTtcbiAgZW1pdENvbnRyb2xzKCRqb3VybmFsKTtcbiAgcmV0dXJuIGVtaXRGb290ZXIoJGZvb3RlciwgcGFnZU9iamVjdCk7XG59O1xuXG5jcmVhdGVNaXNzaW5nRmxhZyA9IGZ1bmN0aW9uKCRwYWdlLCBwYWdlT2JqZWN0KSB7XG4gIGlmICghcGFnZU9iamVjdC5pc1JlbW90ZSgpKSB7XG4gICAgcmV0dXJuICQoJ2ltZy5mYXZpY29uJywgJHBhZ2UpLmVycm9yKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHBsdWdpbi5nZXQoJ2Zhdmljb24nLCBmdW5jdGlvbihmYXZpY29uKSB7XG4gICAgICAgIHJldHVybiBmYXZpY29uLmNyZWF0ZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn07XG5cbnJlYnVpbGRQYWdlID0gZnVuY3Rpb24ocGFnZU9iamVjdCwgJHBhZ2UpIHtcbiAgaWYgKHBhZ2VPYmplY3QuaXNMb2NhbCgpKSB7XG4gICAgJHBhZ2UuYWRkQ2xhc3MoJ2xvY2FsJyk7XG4gIH1cbiAgaWYgKHBhZ2VPYmplY3QuaXNSZW1vdGUoKSkge1xuICAgICRwYWdlLmFkZENsYXNzKCdyZW1vdGUnKTtcbiAgfVxuICBpZiAocGFnZU9iamVjdC5pc1BsdWdpbigpKSB7XG4gICAgJHBhZ2UuYWRkQ2xhc3MoJ3BsdWdpbicpO1xuICB9XG4gIHJlbmRlclBhZ2VJbnRvUGFnZUVsZW1lbnQocGFnZU9iamVjdCwgJHBhZ2UpO1xuICBjcmVhdGVNaXNzaW5nRmxhZygkcGFnZSwgcGFnZU9iamVjdCk7XG4gIHN0YXRlLnNldFVybCgpO1xuICBpbml0RHJhZ2dpbmcoJHBhZ2UpO1xuICBpbml0TWVyZ2luZygkcGFnZSk7XG4gIGluaXRBZGRCdXR0b24oJHBhZ2UpO1xuICByZXR1cm4gJHBhZ2U7XG59O1xuXG5idWlsZFBhZ2UgPSBmdW5jdGlvbihwYWdlT2JqZWN0LCAkcGFnZSkge1xuICAkcGFnZS5kYXRhKCdrZXknLCBsaW5ldXAuYWRkUGFnZShwYWdlT2JqZWN0KSk7XG4gIHJldHVybiByZWJ1aWxkUGFnZShwYWdlT2JqZWN0LCAkcGFnZSk7XG59O1xuXG5jeWNsZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgJHBhZ2UsIGNyZWF0ZUdob3N0UGFnZSwgcGFnZUluZm9ybWF0aW9uLCByZWYsIHJldiwgc2x1Zywgd2hlbkdvdHRlbjtcbiAgJHBhZ2UgPSAkKHRoaXMpO1xuICByZWYgPSAkcGFnZS5hdHRyKCdpZCcpLnNwbGl0KCdfcmV2JyksIHNsdWcgPSByZWZbMF0sIHJldiA9IHJlZlsxXTtcbiAgcGFnZUluZm9ybWF0aW9uID0ge1xuICAgIHNsdWc6IHNsdWcsXG4gICAgcmV2OiByZXYsXG4gICAgc2l0ZTogJHBhZ2UuZGF0YSgnc2l0ZScpXG4gIH07XG4gIGNyZWF0ZUdob3N0UGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBoaXQsIGhpdHMsIGluZm8sIGosIGxlbiwgcGFnZU9iamVjdCwgcmVmMSwgcmVzdWx0LCBzaXRlLCB0aXRsZTtcbiAgICB0aXRsZSA9ICQoXCJhW2hyZWY9XFxcIi9cIiArIHNsdWcgKyBcIi5odG1sXFxcIl06bGFzdFwiKS50ZXh0KCkgfHwgc2x1ZztcbiAgICBwYWdlT2JqZWN0ID0gbmV3UGFnZSgpO1xuICAgIHBhZ2VPYmplY3Quc2V0VGl0bGUodGl0bGUpO1xuICAgIGhpdHMgPSBbXTtcbiAgICByZWYxID0gbmVpZ2hib3Job29kLnNpdGVzO1xuICAgIGZvciAoc2l0ZSBpbiByZWYxKSB7XG4gICAgICBpbmZvID0gcmVmMVtzaXRlXTtcbiAgICAgIGlmIChpbmZvLnNpdGVtYXAgIT0gbnVsbCkge1xuICAgICAgICByZXN1bHQgPSBfLmZpbmQoaW5mby5zaXRlbWFwLCBmdW5jdGlvbihlYWNoKSB7XG4gICAgICAgICAgcmV0dXJuIGVhY2guc2x1ZyA9PT0gc2x1ZztcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQgIT0gbnVsbCkge1xuICAgICAgICAgIGhpdHMucHVzaCh7XG4gICAgICAgICAgICBcInR5cGVcIjogXCJyZWZlcmVuY2VcIixcbiAgICAgICAgICAgIFwic2l0ZVwiOiBzaXRlLFxuICAgICAgICAgICAgXCJzbHVnXCI6IHNsdWcsXG4gICAgICAgICAgICBcInRpdGxlXCI6IHJlc3VsdC50aXRsZSB8fCBzbHVnLFxuICAgICAgICAgICAgXCJ0ZXh0XCI6IHJlc3VsdC5zeW5vcHNpcyB8fCAnJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChoaXRzLmxlbmd0aCA+IDApIHtcbiAgICAgIHBhZ2VPYmplY3QuYWRkSXRlbSh7XG4gICAgICAgICd0eXBlJzogJ2Z1dHVyZScsXG4gICAgICAgICd0ZXh0JzogJ1dlIGNvdWxkIG5vdCBmaW5kIHRoaXMgcGFnZSBpbiB0aGUgZXhwZWN0ZWQgY29udGV4dC4nLFxuICAgICAgICAndGl0bGUnOiB0aXRsZVxuICAgICAgfSk7XG4gICAgICBwYWdlT2JqZWN0LmFkZEl0ZW0oe1xuICAgICAgICAndHlwZSc6ICdwYXJhZ3JhcGgnLFxuICAgICAgICAndGV4dCc6IFwiV2UgZGlkIGZpbmQgdGhlIHBhZ2UgaW4geW91ciBjdXJyZW50IG5laWdoYm9yaG9vZC5cIlxuICAgICAgfSk7XG4gICAgICBmb3IgKGogPSAwLCBsZW4gPSBoaXRzLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgIGhpdCA9IGhpdHNbal07XG4gICAgICAgIHBhZ2VPYmplY3QuYWRkSXRlbShoaXQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBwYWdlT2JqZWN0LmFkZEl0ZW0oe1xuICAgICAgICAndHlwZSc6ICdmdXR1cmUnLFxuICAgICAgICAndGV4dCc6ICdXZSBjb3VsZCBub3QgZmluZCB0aGlzIHBhZ2UuJyxcbiAgICAgICAgJ3RpdGxlJzogdGl0bGVcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYnVpbGRQYWdlKHBhZ2VPYmplY3QsICRwYWdlKS5hZGRDbGFzcygnZ2hvc3QnKTtcbiAgfTtcbiAgd2hlbkdvdHRlbiA9IGZ1bmN0aW9uKHBhZ2VPYmplY3QpIHtcbiAgICB2YXIgaiwgbGVuLCByZWYxLCByZXN1bHRzLCBzaXRlO1xuICAgIGJ1aWxkUGFnZShwYWdlT2JqZWN0LCAkcGFnZSk7XG4gICAgcmVmMSA9IHBhZ2VPYmplY3QuZ2V0TmVpZ2hib3JzKGxvY2F0aW9uLmhvc3QpO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYxLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBzaXRlID0gcmVmMVtqXTtcbiAgICAgIHJlc3VsdHMucHVzaChuZWlnaGJvcmhvb2QucmVnaXN0ZXJOZWlnaGJvcihzaXRlKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuICByZXR1cm4gcGFnZUhhbmRsZXIuZ2V0KHtcbiAgICB3aGVuR290dGVuOiB3aGVuR290dGVuLFxuICAgIHdoZW5Ob3RHb3R0ZW46IGNyZWF0ZUdob3N0UGFnZSxcbiAgICBwYWdlSW5mb3JtYXRpb246IHBhZ2VJbmZvcm1hdGlvblxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjeWNsZTogY3ljbGUsXG4gIGVtaXRUd2luczogZW1pdFR3aW5zLFxuICBidWlsZFBhZ2U6IGJ1aWxkUGFnZSxcbiAgcmVidWlsZFBhZ2U6IHJlYnVpbGRQYWdlXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGFzU2x1ZywgZXNjYXBlLCByZXNvbHZlO1xuXG5hc1NsdWcgPSByZXF1aXJlKCcuL3BhZ2UnKS5hc1NsdWc7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVzb2x2ZSA9IHt9O1xuXG5yZXNvbHZlLnJlc29sdXRpb25Db250ZXh0ID0gW107XG5cbnJlc29sdmUuZXNjYXBlID0gZXNjYXBlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gIHJldHVybiBzdHJpbmcucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufTtcblxucmVzb2x2ZS5yZXNvbHZlRnJvbSA9IGZ1bmN0aW9uKGFkZGl0aW9uLCBjYWxsYmFjaykge1xuICByZXNvbHZlLnJlc29sdXRpb25Db250ZXh0LnB1c2goYWRkaXRpb24pO1xuICB0cnkge1xuICAgIHJldHVybiBjYWxsYmFjaygpO1xuICB9IGZpbmFsbHkge1xuICAgIHJlc29sdmUucmVzb2x1dGlvbkNvbnRleHQucG9wKCk7XG4gIH1cbn07XG5cbnJlc29sdmUucmVzb2x2ZUxpbmtzID0gZnVuY3Rpb24oc3RyaW5nLCBzYW5pdGl6ZSkge1xuICB2YXIgZXh0ZXJuYWwsIGludGVybmFsLCBzdGFzaCwgc3Rhc2hlZCwgdW5zdGFzaDtcbiAgaWYgKHNhbml0aXplID09IG51bGwpIHtcbiAgICBzYW5pdGl6ZSA9IGVzY2FwZTtcbiAgfVxuICBzdGFzaGVkID0gW107XG4gIHN0YXNoID0gZnVuY3Rpb24odGV4dCkge1xuICAgIHZhciBoZXJlO1xuICAgIGhlcmUgPSBzdGFzaGVkLmxlbmd0aDtcbiAgICBzdGFzaGVkLnB1c2godGV4dCk7XG4gICAgcmV0dXJuIFwi44CWXCIgKyBoZXJlICsgXCLjgJdcIjtcbiAgfTtcbiAgdW5zdGFzaCA9IGZ1bmN0aW9uKG1hdGNoLCBkaWdpdHMpIHtcbiAgICByZXR1cm4gc3Rhc2hlZFsrZGlnaXRzXTtcbiAgfTtcbiAgaW50ZXJuYWwgPSBmdW5jdGlvbihtYXRjaCwgbmFtZSkge1xuICAgIHZhciBzbHVnO1xuICAgIHNsdWcgPSBhc1NsdWcobmFtZSk7XG4gICAgcmV0dXJuIHN0YXNoKFwiPGEgY2xhc3M9XFxcImludGVybmFsXFxcIiBocmVmPVxcXCIvXCIgKyBzbHVnICsgXCIuaHRtbFxcXCIgZGF0YS1wYWdlLW5hbWU9XFxcIlwiICsgc2x1ZyArIFwiXFxcIiB0aXRsZT1cXFwiXCIgKyAocmVzb2x2ZS5yZXNvbHV0aW9uQ29udGV4dC5qb2luKCcgPT4gJykpICsgXCJcXFwiPlwiICsgKGVzY2FwZShuYW1lKSkgKyBcIjwvYT5cIik7XG4gIH07XG4gIGV4dGVybmFsID0gZnVuY3Rpb24obWF0Y2gsIGhyZWYsIHByb3RvY29sLCByZXN0KSB7XG4gICAgcmV0dXJuIHN0YXNoKFwiPGEgY2xhc3M9XFxcImV4dGVybmFsXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgaHJlZj1cXFwiXCIgKyBocmVmICsgXCJcXFwiIHRpdGxlPVxcXCJcIiArIGhyZWYgKyBcIlxcXCIgcmVsPVxcXCJub2ZvbGxvd1xcXCI+XCIgKyAoZXNjYXBlKHJlc3QpKSArIFwiIDxpbWcgc3JjPVxcXCIvaW1hZ2VzL2V4dGVybmFsLWxpbmstbHRyLWljb24ucG5nXFxcIj48L2E+XCIpO1xuICB9O1xuICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgv44CWKFxcZCsp44CXL2csIFwi44CWICQxIOOAl1wiKS5yZXBsYWNlKC9cXFtcXFsoW15cXF1dKylcXF1cXF0vZ2ksIGludGVybmFsKS5yZXBsYWNlKC9cXFsoKGh0dHB8aHR0cHN8ZnRwKTouKj8pICguKj8pXFxdL2dpLCBleHRlcm5hbCk7XG4gIHJldHVybiBzYW5pdGl6ZShzdHJpbmcpLnJlcGxhY2UoL+OAlihcXGQrKeOAly9nLCB1bnN0YXNoKTtcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYXBwbHksIGNyZWF0ZTtcblxuYXBwbHkgPSBmdW5jdGlvbihwYWdlLCBhY3Rpb24pIHtcbiAgdmFyIGFkZCwgYWZ0ZXIsIGluZGV4LCBpdGVtLCBvcmRlciwgcmVtb3ZlO1xuICBvcmRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpLCBpdGVtLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSBwYWdlLnN0b3J5IHx8IFtdO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICByZXN1bHRzLnB1c2goaXRlbSAhPSBudWxsID8gaXRlbS5pZCA6IHZvaWQgMCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuICBhZGQgPSBmdW5jdGlvbihhZnRlciwgaXRlbSkge1xuICAgIHZhciBpbmRleDtcbiAgICBpbmRleCA9IG9yZGVyKCkuaW5kZXhPZihhZnRlcikgKyAxO1xuICAgIHJldHVybiBwYWdlLnN0b3J5LnNwbGljZShpbmRleCwgMCwgaXRlbSk7XG4gIH07XG4gIHJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbmRleDtcbiAgICBpZiAoKGluZGV4ID0gb3JkZXIoKS5pbmRleE9mKGFjdGlvbi5pZCkpICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHBhZ2Uuc3Rvcnkuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH07XG4gIHBhZ2Uuc3RvcnkgfHwgKHBhZ2Uuc3RvcnkgPSBbXSk7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlICdjcmVhdGUnOlxuICAgICAgaWYgKGFjdGlvbi5pdGVtICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGFjdGlvbi5pdGVtLnRpdGxlICE9IG51bGwpIHtcbiAgICAgICAgICBwYWdlLnRpdGxlID0gYWN0aW9uLml0ZW0udGl0bGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFjdGlvbi5pdGVtLnN0b3J5ICE9IG51bGwpIHtcbiAgICAgICAgICBwYWdlLnN0b3J5ID0gYWN0aW9uLml0ZW0uc3Rvcnkuc2xpY2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYWRkJzpcbiAgICAgIGFkZChhY3Rpb24uYWZ0ZXIsIGFjdGlvbi5pdGVtKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VkaXQnOlxuICAgICAgaWYgKChpbmRleCA9IG9yZGVyKCkuaW5kZXhPZihhY3Rpb24uaWQpKSAhPT0gLTEpIHtcbiAgICAgICAgcGFnZS5zdG9yeS5zcGxpY2UoaW5kZXgsIDEsIGFjdGlvbi5pdGVtKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2Uuc3RvcnkucHVzaChhY3Rpb24uaXRlbSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtb3ZlJzpcbiAgICAgIGluZGV4ID0gYWN0aW9uLm9yZGVyLmluZGV4T2YoYWN0aW9uLmlkKTtcbiAgICAgIGFmdGVyID0gYWN0aW9uLm9yZGVyW2luZGV4IC0gMV07XG4gICAgICBpdGVtID0gcGFnZS5zdG9yeVtvcmRlcigpLmluZGV4T2YoYWN0aW9uLmlkKV07XG4gICAgICByZW1vdmUoKTtcbiAgICAgIGFkZChhZnRlciwgaXRlbSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZW1vdmUnOlxuICAgICAgcmVtb3ZlKCk7XG4gIH1cbiAgcGFnZS5qb3VybmFsIHx8IChwYWdlLmpvdXJuYWwgPSBbXSk7XG4gIHJldHVybiBwYWdlLmpvdXJuYWwucHVzaChhY3Rpb24pO1xufTtcblxuY3JlYXRlID0gZnVuY3Rpb24ocmV2SW5kZXgsIGRhdGEpIHtcbiAgdmFyIGFjdGlvbiwgaSwgbGVuLCByZXZKb3VybmFsLCByZXZQYWdlO1xuICByZXZJbmRleCA9ICtyZXZJbmRleDtcbiAgcmV2Sm91cm5hbCA9IGRhdGEuam91cm5hbC5zbGljZSgwLCArcmV2SW5kZXggKyAxIHx8IDllOSk7XG4gIHJldlBhZ2UgPSB7XG4gICAgdGl0bGU6IGRhdGEudGl0bGUsXG4gICAgc3Rvcnk6IFtdXG4gIH07XG4gIGZvciAoaSA9IDAsIGxlbiA9IHJldkpvdXJuYWwubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBhY3Rpb24gPSByZXZKb3VybmFsW2ldO1xuICAgIGFwcGx5KHJldlBhZ2UsIGFjdGlvbiB8fCB7fSk7XG4gIH1cbiAgcmV0dXJuIHJldlBhZ2U7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiBjcmVhdGUsXG4gIGFwcGx5OiBhcHBseVxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhY3RpdmUsIGNyZWF0ZVNlYXJjaCwgbGluaywgbmV3UGFnZTtcblxubGluayA9IHJlcXVpcmUoJy4vbGluaycpO1xuXG5hY3RpdmUgPSByZXF1aXJlKCcuL2FjdGl2ZScpO1xuXG5uZXdQYWdlID0gcmVxdWlyZSgnLi9wYWdlJykubmV3UGFnZTtcblxuY3JlYXRlU2VhcmNoID0gZnVuY3Rpb24oYXJnKSB7XG4gIHZhciBuZWlnaGJvcmhvb2QsIHBlcmZvcm1TZWFyY2g7XG4gIG5laWdoYm9yaG9vZCA9IGFyZy5uZWlnaGJvcmhvb2Q7XG4gIHBlcmZvcm1TZWFyY2ggPSBmdW5jdGlvbihzZWFyY2hRdWVyeSkge1xuICAgIHZhciBpLCBsZW4sIHJlZiwgcmVzdWx0LCByZXN1bHRQYWdlLCBzZWFyY2hSZXN1bHRzLCB0YWxseTtcbiAgICBzZWFyY2hSZXN1bHRzID0gbmVpZ2hib3Job29kLnNlYXJjaChzZWFyY2hRdWVyeSk7XG4gICAgdGFsbHkgPSBzZWFyY2hSZXN1bHRzLnRhbGx5O1xuICAgIHJlc3VsdFBhZ2UgPSBuZXdQYWdlKCk7XG4gICAgcmVzdWx0UGFnZS5zZXRUaXRsZShcIlNlYXJjaCBmb3IgJ1wiICsgc2VhcmNoUXVlcnkgKyBcIidcIik7XG4gICAgcmVzdWx0UGFnZS5hZGRQYXJhZ3JhcGgoXCJTdHJpbmcgJ1wiICsgc2VhcmNoUXVlcnkgKyBcIicgZm91bmQgb24gXCIgKyAodGFsbHkuZmluZHMgfHwgJ25vbmUnKSArIFwiIG9mIFwiICsgKHRhbGx5LnBhZ2VzIHx8ICdubycpICsgXCIgcGFnZXMgZnJvbSBcIiArICh0YWxseS5zaXRlcyB8fCAnbm8nKSArIFwiIHNpdGVzLlxcblRleHQgbWF0Y2hlZCBvbiBcIiArICh0YWxseS50aXRsZSB8fCAnbm8nKSArIFwiIHRpdGxlcywgXCIgKyAodGFsbHkudGV4dCB8fCAnbm8nKSArIFwiIHBhcmFncmFwaHMsIGFuZCBcIiArICh0YWxseS5zbHVnIHx8ICdubycpICsgXCIgc2x1Z3MuXFxuRWxhcHNlZCB0aW1lIFwiICsgdGFsbHkubXNlYyArIFwiIG1pbGxpc2Vjb25kcy5cIik7XG4gICAgcmVmID0gc2VhcmNoUmVzdWx0cy5maW5kcztcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHJlc3VsdCA9IHJlZltpXTtcbiAgICAgIHJlc3VsdFBhZ2UuYWRkSXRlbSh7XG4gICAgICAgIFwidHlwZVwiOiBcInJlZmVyZW5jZVwiLFxuICAgICAgICBcInNpdGVcIjogcmVzdWx0LnNpdGUsXG4gICAgICAgIFwic2x1Z1wiOiByZXN1bHQucGFnZS5zbHVnLFxuICAgICAgICBcInRpdGxlXCI6IHJlc3VsdC5wYWdlLnRpdGxlLFxuICAgICAgICBcInRleHRcIjogcmVzdWx0LnBhZ2Uuc3lub3BzaXMgfHwgJydcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gbGluay5zaG93UmVzdWx0KHJlc3VsdFBhZ2UpO1xuICB9O1xuICByZXR1cm4ge1xuICAgIHBlcmZvcm1TZWFyY2g6IHBlcmZvcm1TZWFyY2hcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlU2VhcmNoO1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGJpbmQsIGNyZWF0ZVNlYXJjaCwgaW5qZWN0LCBzZWFyY2g7XG5cbmNyZWF0ZVNlYXJjaCA9IHJlcXVpcmUoJy4vc2VhcmNoJyk7XG5cbnNlYXJjaCA9IG51bGw7XG5cbmluamVjdCA9IGZ1bmN0aW9uKG5laWdoYm9yaG9vZCkge1xuICByZXR1cm4gc2VhcmNoID0gY3JlYXRlU2VhcmNoKHtcbiAgICBuZWlnaGJvcmhvb2Q6IG5laWdoYm9yaG9vZFxuICB9KTtcbn07XG5cbmJpbmQgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICQoJ2lucHV0LnNlYXJjaCcpLm9uKCdrZXlwcmVzcycsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgc2VhcmNoUXVlcnk7XG4gICAgaWYgKGUua2V5Q29kZSAhPT0gMTMpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2VhcmNoUXVlcnkgPSAkKHRoaXMpLnZhbCgpO1xuICAgIHNlYXJjaC5wZXJmb3JtU2VhcmNoKHNlYXJjaFF1ZXJ5KTtcbiAgICByZXR1cm4gJCh0aGlzKS52YWwoXCJcIik7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGluamVjdDogaW5qZWN0LFxuICBiaW5kOiBiaW5kXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGFjdGl2ZSwgbGluZXVwLCBsaW5rLCBzdGF0ZSxcbiAgICBpbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH07XG5cbmFjdGl2ZSA9IHJlcXVpcmUoJy4vYWN0aXZlJyk7XG5cbmxpbmV1cCA9IHJlcXVpcmUoJy4vbGluZXVwJyk7XG5cbmxpbmsgPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXRlID0ge307XG5cbnN0YXRlLmluamVjdCA9IGZ1bmN0aW9uIChsaW5rXykge1xuICAgIHJldHVybiBsaW5rID0gbGlua187XG59O1xuXG5zdGF0ZS5wYWdlc0luRG9tID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAkLm1ha2VBcnJheSgkKFwiLnBhZ2VcIikubWFwKGZ1bmN0aW9uIChfLCBlbCkge1xuICAgICAgICByZXR1cm4gZWwuaWQ7XG4gICAgfSkpO1xufTtcblxuc3RhdGUudXJsUGFnZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGk7XG4gICAgcmV0dXJuICgoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaywgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICAgIHJlZiA9ICQobG9jYXRpb24pLmF0dHIoJ3BhdGhuYW1lJykuc3BsaXQoJy8nKTtcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGsgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBrIDwgbGVuOyBrICs9IDIpIHtcbiAgICAgICAgICAgIGkgPSByZWZba107XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSkoKSkuc2xpY2UoMSk7XG59O1xuXG5zdGF0ZS5sb2NzSW5Eb20gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICQubWFrZUFycmF5KCQoXCIucGFnZVwiKS5tYXAoZnVuY3Rpb24gKF8sIGVsKSB7XG4gICAgICAgIHJldHVybiAkKGVsKS5kYXRhKCdzaXRlJykgfHwgJ3ZpZXcnO1xuICAgIH0pKTtcbn07XG5cbnN0YXRlLnVybExvY3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGosIGssIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgIHJlZiA9ICQobG9jYXRpb24pLmF0dHIoJ3BhdGhuYW1lJykuc3BsaXQoJy8nKS5zbGljZSgxKTtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgayArPSAyKSB7XG4gICAgICAgIGogPSByZWZba107XG4gICAgICAgIHJlc3VsdHMucHVzaChqKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG5zdGF0ZS5zZXRVcmwgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkeCwgbG9jcywgcGFnZSwgcGFnZXMsIHVybDtcbiAgICBkb2N1bWVudC50aXRsZSA9IGxpbmV1cC5iZXN0VGl0bGUoKTtcbiAgICBpZiAoaGlzdG9yeSAmJiBoaXN0b3J5LnB1c2hTdGF0ZSkge1xuICAgICAgICBsb2NzID0gc3RhdGUubG9jc0luRG9tKCk7XG4gICAgICAgIHBhZ2VzID0gc3RhdGUucGFnZXNJbkRvbSgpO1xuICAgICAgICB1cmwgPSAoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBrLCBsZW4sIHJlc3VsdHM7XG4gICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb3IgKGlkeCA9IGsgPSAwLCBsZW4gPSBwYWdlcy5sZW5ndGg7IGsgPCBsZW47IGlkeCA9ICsraykge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSBwYWdlc1tpZHhdO1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChcIi9cIiArICgobG9jcyAhPSBudWxsID8gbG9jc1tpZHhdIDogdm9pZCAwKSB8fCAndmlldycpICsgXCIvXCIgKyBwYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9KSgpKS5qb2luKCcnKTtcbiAgICAgICAgaWYgKHVybCAhPT0gJChsb2NhdGlvbikuYXR0cigncGF0aG5hbWUnKSkge1xuICAgICAgICAgICAgcmV0dXJuIGhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIHVybCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5zdGF0ZS5zaG93ID0gZnVuY3Rpb24gKGUpIHtcbiAgICB2YXIgZWFjaCwgaWR4LCBrLCBsLCBsZW4sIGxlbjEsIG1hdGNoaW5nLCBuYW1lLCBuZXdMb2NzLCBuZXdQYWdlcywgb2xkLCBvbGRMb2NzLCBvbGRQYWdlcztcbiAgICBvbGRQYWdlcyA9IHN0YXRlLnBhZ2VzSW5Eb20oKTtcbiAgICBuZXdQYWdlcyA9IHN0YXRlLnVybFBhZ2VzKCk7XG4gICAgb2xkTG9jcyA9IHN0YXRlLmxvY3NJbkRvbSgpO1xuICAgIG5ld0xvY3MgPSBzdGF0ZS51cmxMb2NzKCk7XG4gICAgaWYgKCFsb2NhdGlvbi5wYXRobmFtZSB8fCBsb2NhdGlvbi5wYXRobmFtZSA9PT0gJy8nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbWF0Y2hpbmcgPSB0cnVlO1xuICAgIGZvciAoaWR4ID0gayA9IDAsIGxlbiA9IG9sZFBhZ2VzLmxlbmd0aDsgayA8IGxlbjsgaWR4ID0gKytrKSB7XG4gICAgICAgIG5hbWUgPSBvbGRQYWdlc1tpZHhdO1xuICAgICAgICBpZiAobWF0Y2hpbmcgJiYgKG1hdGNoaW5nID0gbmFtZSA9PT0gbmV3UGFnZXNbaWR4XSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIG9sZCA9ICQoJy5wYWdlOmxhc3QnKTtcbiAgICAgICAgbGluZXVwLnJlbW92ZUtleShvbGQuZGF0YSgna2V5JykpO1xuICAgICAgICBvbGQucmVtb3ZlKCk7XG4gICAgfVxuICAgIG1hdGNoaW5nID0gdHJ1ZTtcbiAgICBmb3IgKGlkeCA9IGwgPSAwLCBsZW4xID0gbmV3UGFnZXMubGVuZ3RoOyBsIDwgbGVuMTsgaWR4ID0gKytsKSB7XG4gICAgICAgIG5hbWUgPSBuZXdQYWdlc1tpZHhdO1xuICAgICAgICBpZiAobWF0Y2hpbmcgJiYgKG1hdGNoaW5nID0gbmFtZSA9PT0gb2xkUGFnZXNbaWR4XSkpIHtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKCdwdXNoJywgaWR4LCBuYW1lKTtcbiAgICAgICAgbGluay5zaG93UGFnZShuYW1lLCBuZXdMb2NzW2lkeF0pO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygnYSAucGFnZSBrZXlzICcsIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsZW4yLCBtLCByZWYsIHJlc3VsdHM7XG4gICAgICAgIHJlZiA9ICQoJy5wYWdlJyk7XG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChtID0gMCwgbGVuMiA9IHJlZi5sZW5ndGg7IG0gPCBsZW4yOyBtKyspIHtcbiAgICAgICAgICAgIGVhY2ggPSByZWZbbV07XG4gICAgICAgICAgICByZXN1bHRzLnB1c2goJChlYWNoKS5kYXRhKCdrZXknKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSkoKSk7XG4gICAgY29uc29sZS5sb2coJ2EgbGluZXVwIGtleXMnLCBsaW5ldXAuZGVidWdLZXlzKCkpO1xuICAgIGFjdGl2ZS5zZXQoJCgnLnBhZ2UnKS5sYXN0KCkpO1xuICAgIHJldHVybiBkb2N1bWVudC50aXRsZSA9IGxpbmV1cC5iZXN0VGl0bGUoKTtcbn07XG5cbnN0YXRlLmZpcnN0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmaXJzdFVybExvY3MsIGZpcnN0VXJsUGFnZXMsIGlkeCwgaywgbGVuLCBvbGRQYWdlcywgcmVzdWx0cywgdXJsUGFnZTtcbiAgICBzdGF0ZS5zZXRVcmwoKTtcbiAgICBmaXJzdFVybFBhZ2VzID0gc3RhdGUudXJsUGFnZXMoKTtcbiAgICBmaXJzdFVybExvY3MgPSBzdGF0ZS51cmxMb2NzKCk7XG4gICAgb2xkUGFnZXMgPSBzdGF0ZS5wYWdlc0luRG9tKCk7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaWR4ID0gayA9IDAsIGxlbiA9IGZpcnN0VXJsUGFnZXMubGVuZ3RoOyBrIDwgbGVuOyBpZHggPSArK2spIHtcbiAgICAgICAgdXJsUGFnZSA9IGZpcnN0VXJsUGFnZXNbaWR4XTtcbiAgICAgICAgaWYgKGluZGV4T2YuY2FsbChvbGRQYWdlcywgdXJsUGFnZSkgPCAwKSB7XG4gICAgICAgICAgICBpZiAodXJsUGFnZSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gobGluay5jcmVhdGVQYWdlKHVybFBhZ2UsIGZpcnN0VXJsTG9jc1tpZHhdKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh2b2lkIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ocGFnZSkge1xuICB2YXIgcDEsIHAyLCBzeW5vcHNpcztcbiAgc3lub3BzaXMgPSBwYWdlLnN5bm9wc2lzO1xuICBpZiAoKHBhZ2UgIT0gbnVsbCkgJiYgKHBhZ2Uuc3RvcnkgIT0gbnVsbCkpIHtcbiAgICBwMSA9IHBhZ2Uuc3RvcnlbMF07XG4gICAgcDIgPSBwYWdlLnN0b3J5WzFdO1xuICAgIGlmIChwMSAmJiBwMS50eXBlID09PSAncGFyYWdyYXBoJykge1xuICAgICAgc3lub3BzaXMgfHwgKHN5bm9wc2lzID0gcDEudGV4dCk7XG4gICAgfVxuICAgIGlmIChwMiAmJiBwMi50eXBlID09PSAncGFyYWdyYXBoJykge1xuICAgICAgc3lub3BzaXMgfHwgKHN5bm9wc2lzID0gcDIudGV4dCk7XG4gICAgfVxuICAgIGlmIChwMSAmJiAocDEudGV4dCAhPSBudWxsKSkge1xuICAgICAgc3lub3BzaXMgfHwgKHN5bm9wc2lzID0gcDEudGV4dCk7XG4gICAgfVxuICAgIGlmIChwMiAmJiAocDIudGV4dCAhPSBudWxsKSkge1xuICAgICAgc3lub3BzaXMgfHwgKHN5bm9wc2lzID0gcDIudGV4dCk7XG4gICAgfVxuICAgIHN5bm9wc2lzIHx8IChzeW5vcHNpcyA9IChwYWdlLnN0b3J5ICE9IG51bGwpICYmIChcIkEgcGFnZSB3aXRoIFwiICsgcGFnZS5zdG9yeS5sZW5ndGggKyBcIiBpdGVtcy5cIikpO1xuICB9IGVsc2Uge1xuICAgIHN5bm9wc2lzID0gJ0EgcGFnZSB3aXRoIG5vIHN0b3J5Lic7XG4gIH1cbiAgcmV0dXJuIHN5bm9wc2lzO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhY3Rpb24sIGFsaWduSXRlbSwgYmluZCwgZW50ZXJBY3Rpb24sIGVudGVySXRlbSwgaXRlbSwgbGVhdmVBY3Rpb24sIGxlYXZlSXRlbSwgc3RhcnRUYXJnZXRpbmcsIHN0b3BUYXJnZXRpbmcsIHRhcmdldGluZztcblxudGFyZ2V0aW5nID0gZmFsc2U7XG5cbml0ZW0gPSBudWxsO1xuXG5hY3Rpb24gPSBudWxsO1xuXG5iaW5kID0gZnVuY3Rpb24oKSB7XG4gICQoZG9jdW1lbnQpLmtleWRvd24oZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLmtleUNvZGUgPT09IDE2KSB7XG4gICAgICByZXR1cm4gc3RhcnRUYXJnZXRpbmcoZSk7XG4gICAgfVxuICB9KS5rZXl1cChmdW5jdGlvbihlKSB7XG4gICAgaWYgKGUua2V5Q29kZSA9PT0gMTYpIHtcbiAgICAgIHJldHVybiBzdG9wVGFyZ2V0aW5nKGUpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiAkKCcubWFpbicpLmRlbGVnYXRlKCcuaXRlbScsICdtb3VzZWVudGVyJywgZW50ZXJJdGVtKS5kZWxlZ2F0ZSgnLml0ZW0nLCAnbW91c2VsZWF2ZScsIGxlYXZlSXRlbSkuZGVsZWdhdGUoJy5hY3Rpb24nLCAnbW91c2VlbnRlcicsIGVudGVyQWN0aW9uKS5kZWxlZ2F0ZSgnLmFjdGlvbicsICdtb3VzZWxlYXZlJywgbGVhdmVBY3Rpb24pLmRlbGVnYXRlKCcucGFnZScsICdhbGlnbi1pdGVtJywgYWxpZ25JdGVtKTtcbn07XG5cbnN0YXJ0VGFyZ2V0aW5nID0gZnVuY3Rpb24oZSkge1xuICB2YXIgaWQ7XG4gIHRhcmdldGluZyA9IGUuc2hpZnRLZXk7XG4gIGlmICh0YXJnZXRpbmcpIHtcbiAgICBpZiAoaWQgPSBpdGVtIHx8IGFjdGlvbikge1xuICAgICAgcmV0dXJuICQoXCJbZGF0YS1pZD1cIiArIGlkICsgXCJdXCIpLmFkZENsYXNzKCd0YXJnZXQnKTtcbiAgICB9XG4gIH1cbn07XG5cbnN0b3BUYXJnZXRpbmcgPSBmdW5jdGlvbihlKSB7XG4gIHRhcmdldGluZyA9IGUuc2hpZnRLZXk7XG4gIGlmICghdGFyZ2V0aW5nKSB7XG4gICAgcmV0dXJuICQoJy5pdGVtLCAuYWN0aW9uJykucmVtb3ZlQ2xhc3MoJ3RhcmdldCcpO1xuICB9XG59O1xuXG5lbnRlckl0ZW0gPSBmdW5jdGlvbihlKSB7XG4gIHZhciAkaXRlbSwgJHBhZ2UsIGtleSwgcGxhY2U7XG4gIGl0ZW0gPSAoJGl0ZW0gPSAkKHRoaXMpKS5hdHRyKCdkYXRhLWlkJyk7XG4gIGlmICh0YXJnZXRpbmcpIHtcbiAgICAkKFwiW2RhdGEtaWQ9XCIgKyBpdGVtICsgXCJdXCIpLmFkZENsYXNzKCd0YXJnZXQnKTtcbiAgICBrZXkgPSAoJHBhZ2UgPSAkKHRoaXMpLnBhcmVudHMoJy5wYWdlOmZpcnN0JykpLmRhdGEoJ2tleScpO1xuICAgIHBsYWNlID0gJGl0ZW0ub2Zmc2V0KCkudG9wO1xuICAgIHJldHVybiAkKCcucGFnZScpLnRyaWdnZXIoJ2FsaWduLWl0ZW0nLCB7XG4gICAgICBrZXk6IGtleSxcbiAgICAgIGlkOiBpdGVtLFxuICAgICAgcGxhY2U6IHBsYWNlXG4gICAgfSk7XG4gIH1cbn07XG5cbmxlYXZlSXRlbSA9IGZ1bmN0aW9uKGUpIHtcbiAgaWYgKHRhcmdldGluZykge1xuICAgICQoJy5pdGVtLCAuYWN0aW9uJykucmVtb3ZlQ2xhc3MoJ3RhcmdldCcpO1xuICB9XG4gIHJldHVybiBpdGVtID0gbnVsbDtcbn07XG5cbmVudGVyQWN0aW9uID0gZnVuY3Rpb24oZSkge1xuICB2YXIga2V5O1xuICBhY3Rpb24gPSAkKHRoaXMpLmRhdGEoJ2lkJyk7XG4gIGlmICh0YXJnZXRpbmcpIHtcbiAgICAkKFwiW2RhdGEtaWQ9XCIgKyBhY3Rpb24gKyBcIl1cIikuYWRkQ2xhc3MoJ3RhcmdldCcpO1xuICAgIGtleSA9ICQodGhpcykucGFyZW50cygnLnBhZ2U6Zmlyc3QnKS5kYXRhKCdrZXknKTtcbiAgICByZXR1cm4gJCgnLnBhZ2UnKS50cmlnZ2VyKCdhbGlnbi1pdGVtJywge1xuICAgICAga2V5OiBrZXksXG4gICAgICBpZDogYWN0aW9uXG4gICAgfSk7XG4gIH1cbn07XG5cbmxlYXZlQWN0aW9uID0gZnVuY3Rpb24oZSkge1xuICBpZiAodGFyZ2V0aW5nKSB7XG4gICAgJChcIltkYXRhLWlkPVwiICsgYWN0aW9uICsgXCJdXCIpLnJlbW92ZUNsYXNzKCd0YXJnZXQnKTtcbiAgfVxuICByZXR1cm4gYWN0aW9uID0gbnVsbDtcbn07XG5cbmFsaWduSXRlbSA9IGZ1bmN0aW9uKGUsIGFsaWduKSB7XG4gIHZhciAkaXRlbSwgJHBhZ2UsIG9mZnNldCwgcGxhY2U7XG4gICRwYWdlID0gJCh0aGlzKTtcbiAgaWYgKCRwYWdlLmRhdGEoJ2tleScpID09PSBhbGlnbi5rZXkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgJGl0ZW0gPSAkcGFnZS5maW5kKFwiLml0ZW1bZGF0YS1pZD1cIiArIGFsaWduLmlkICsgXCJdXCIpO1xuICBpZiAoISRpdGVtLmxlbmd0aCkge1xuICAgIHJldHVybjtcbiAgfVxuICBwbGFjZSA9IGFsaWduLnBsYWNlIHx8ICRwYWdlLmhlaWdodCgpIC8gMjtcbiAgb2Zmc2V0ID0gJGl0ZW0ub2Zmc2V0KCkudG9wICsgJHBhZ2Uuc2Nyb2xsVG9wKCkgLSBwbGFjZTtcbiAgcmV0dXJuICRwYWdlLnN0b3AoKS5hbmltYXRlKHtcbiAgICBzY3JvbGxUb3A6IG9mZnNldFxuICB9LCAnc2xvdycpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGJpbmQ6IGJpbmRcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgdXRpbDtcblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsID0ge307XG5cbnV0aWwuZm9ybWF0VGltZSA9IGZ1bmN0aW9uKHRpbWUpIHtcbiAgdmFyIGFtLCBkLCBoLCBtaSwgbW87XG4gIGQgPSBuZXcgRGF0ZSgodGltZSA+IDEwMDAwMDAwMDAwID8gdGltZSA6IHRpbWUgKiAxMDAwKSk7XG4gIG1vID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddW2QuZ2V0TW9udGgoKV07XG4gIGggPSBkLmdldEhvdXJzKCk7XG4gIGFtID0gaCA8IDEyID8gJ0FNJyA6ICdQTSc7XG4gIGggPSBoID09PSAwID8gMTIgOiBoID4gMTIgPyBoIC0gMTIgOiBoO1xuICBtaSA9IChkLmdldE1pbnV0ZXMoKSA8IDEwID8gXCIwXCIgOiBcIlwiKSArIGQuZ2V0TWludXRlcygpO1xuICByZXR1cm4gaCArIFwiOlwiICsgbWkgKyBcIiBcIiArIGFtICsgXCI8YnI+XCIgKyAoZC5nZXREYXRlKCkpICsgXCIgXCIgKyBtbyArIFwiIFwiICsgKGQuZ2V0RnVsbFllYXIoKSk7XG59O1xuXG51dGlsLmZvcm1hdERhdGUgPSBmdW5jdGlvbihtc1NpbmNlRXBvY2gpIHtcbiAgdmFyIGFtLCBkLCBkYXksIGgsIG1pLCBtbywgc2VjLCB3aywgeXI7XG4gIGQgPSBuZXcgRGF0ZShtc1NpbmNlRXBvY2gpO1xuICB3ayA9IFsnU3VuJywgJ01vbicsICdUdWUnLCAnV2VkJywgJ1RodScsICdGcmknLCAnU2F0J11bZC5nZXREYXkoKV07XG4gIG1vID0gWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddW2QuZ2V0TW9udGgoKV07XG4gIGRheSA9IGQuZ2V0RGF0ZSgpO1xuICB5ciA9IGQuZ2V0RnVsbFllYXIoKTtcbiAgaCA9IGQuZ2V0SG91cnMoKTtcbiAgYW0gPSBoIDwgMTIgPyAnQU0nIDogJ1BNJztcbiAgaCA9IGggPT09IDAgPyAxMiA6IGggPiAxMiA/IGggLSAxMiA6IGg7XG4gIG1pID0gKGQuZ2V0TWludXRlcygpIDwgMTAgPyBcIjBcIiA6IFwiXCIpICsgZC5nZXRNaW51dGVzKCk7XG4gIHNlYyA9IChkLmdldFNlY29uZHMoKSA8IDEwID8gXCIwXCIgOiBcIlwiKSArIGQuZ2V0U2Vjb25kcygpO1xuICByZXR1cm4gd2sgKyBcIiBcIiArIG1vICsgXCIgXCIgKyBkYXkgKyBcIiwgXCIgKyB5ciArIFwiPGJyPlwiICsgaCArIFwiOlwiICsgbWkgKyBcIjpcIiArIHNlYyArIFwiIFwiICsgYW07XG59O1xuXG51dGlsLmZvcm1hdEVsYXBzZWRUaW1lID0gZnVuY3Rpb24obXNTaW5jZUVwb2NoKSB7XG4gIHZhciBkYXlzLCBocnMsIG1pbnMsIG1vbnRocywgbXNlY3MsIHNlY3MsIHdlZWtzLCB5ZWFycztcbiAgbXNlY3MgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIG1zU2luY2VFcG9jaDtcbiAgaWYgKChzZWNzID0gbXNlY3MgLyAxMDAwKSA8IDIpIHtcbiAgICByZXR1cm4gKE1hdGguZmxvb3IobXNlY3MpKSArIFwiIG1pbGxpc2Vjb25kcyBhZ29cIjtcbiAgfVxuICBpZiAoKG1pbnMgPSBzZWNzIC8gNjApIDwgMikge1xuICAgIHJldHVybiAoTWF0aC5mbG9vcihzZWNzKSkgKyBcIiBzZWNvbmRzIGFnb1wiO1xuICB9XG4gIGlmICgoaHJzID0gbWlucyAvIDYwKSA8IDIpIHtcbiAgICByZXR1cm4gKE1hdGguZmxvb3IobWlucykpICsgXCIgbWludXRlcyBhZ29cIjtcbiAgfVxuICBpZiAoKGRheXMgPSBocnMgLyAyNCkgPCAyKSB7XG4gICAgcmV0dXJuIChNYXRoLmZsb29yKGhycykpICsgXCIgaG91cnMgYWdvXCI7XG4gIH1cbiAgaWYgKCh3ZWVrcyA9IGRheXMgLyA3KSA8IDIpIHtcbiAgICByZXR1cm4gKE1hdGguZmxvb3IoZGF5cykpICsgXCIgZGF5cyBhZ29cIjtcbiAgfVxuICBpZiAoKG1vbnRocyA9IGRheXMgLyAzMSkgPCAyKSB7XG4gICAgcmV0dXJuIChNYXRoLmZsb29yKHdlZWtzKSkgKyBcIiB3ZWVrcyBhZ29cIjtcbiAgfVxuICBpZiAoKHllYXJzID0gZGF5cyAvIDM2NSkgPCAyKSB7XG4gICAgcmV0dXJuIChNYXRoLmZsb29yKG1vbnRocykpICsgXCIgbW9udGhzIGFnb1wiO1xuICB9XG4gIHJldHVybiAoTWF0aC5mbG9vcih5ZWFycykpICsgXCIgeWVhcnMgYWdvXCI7XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGRpYWxvZywgZWRpdG9yLCBpdGVteiwgbGluaywgcGFnZUhhbmRsZXIsIHBsdWdpbiwgcmVzb2x2ZSwgd2lraSxcbiAgc2xpY2UgPSBbXS5zbGljZTtcblxud2lraSA9IHt9O1xuXG53aWtpLmFzU2x1ZyA9IHJlcXVpcmUoJy4vcGFnZScpLmFzU2x1ZztcblxuaXRlbXogPSByZXF1aXJlKCcuL2l0ZW16Jyk7XG5cbndpa2kucmVtb3ZlSXRlbSA9IGl0ZW16LnJlbW92ZUl0ZW07XG5cbndpa2kuY3JlYXRlSXRlbSA9IGl0ZW16LmNyZWF0ZUl0ZW07XG5cbndpa2kuZ2V0SXRlbSA9IGl0ZW16LmdldEl0ZW07XG5cbmRpYWxvZyA9IHJlcXVpcmUoJy4vZGlhbG9nJyk7XG5cbndpa2kuZGlhbG9nID0gZGlhbG9nLm9wZW47XG5cbmxpbmsgPSByZXF1aXJlKCcuL2xpbmsnKTtcblxud2lraS5jcmVhdGVQYWdlID0gbGluay5jcmVhdGVQYWdlO1xuXG53aWtpLmRvSW50ZXJuYWxMaW5rID0gbGluay5kb0ludGVybmFsTGluaztcblxucGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKTtcblxud2lraS5nZXRTY3JpcHQgPSBwbHVnaW4uZ2V0U2NyaXB0O1xuXG53aWtpLmdldFBsdWdpbiA9IHBsdWdpbi5nZXRQbHVnaW47XG5cbndpa2kuZG9QbHVnaW4gPSBwbHVnaW4uZG9QbHVnaW47XG5cbndpa2kucmVnaXN0ZXJQbHVnaW4gPSBwbHVnaW4ucmVnaXN0ZXJQbHVnaW47XG5cbndpa2kuZ2V0RGF0YSA9IGZ1bmN0aW9uKHZpcykge1xuICB2YXIgaWR4LCB3aG87XG4gIGlmICh2aXMpIHtcbiAgICBpZHggPSAkKCcuaXRlbScpLmluZGV4KHZpcyk7XG4gICAgd2hvID0gJChcIi5pdGVtOmx0KFwiICsgaWR4ICsgXCIpXCIpLmZpbHRlcignLmNoYXJ0LC5kYXRhLC5jYWxjdWxhdG9yJykubGFzdCgpO1xuICAgIGlmICh3aG8gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHdoby5kYXRhKCdpdGVtJykuZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB3aG8gPSAkKCcuY2hhcnQsLmRhdGEsLmNhbGN1bGF0b3InKS5sYXN0KCk7XG4gICAgaWYgKHdobyAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gd2hvLmRhdGEoJ2l0ZW0nKS5kYXRhO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICB9XG59O1xuXG53aWtpLmdldERhdGFOb2RlcyA9IGZ1bmN0aW9uKHZpcykge1xuICB2YXIgaWR4LCB3aG87XG4gIGlmICh2aXMpIHtcbiAgICBpZHggPSAkKCcuaXRlbScpLmluZGV4KHZpcyk7XG4gICAgd2hvID0gJChcIi5pdGVtOmx0KFwiICsgaWR4ICsgXCIpXCIpLmZpbHRlcignLmNoYXJ0LC5kYXRhLC5jYWxjdWxhdG9yJykudG9BcnJheSgpLnJldmVyc2UoKTtcbiAgICByZXR1cm4gJCh3aG8pO1xuICB9IGVsc2Uge1xuICAgIHdobyA9ICQoJy5jaGFydCwuZGF0YSwuY2FsY3VsYXRvcicpLnRvQXJyYXkoKS5yZXZlcnNlKCk7XG4gICAgcmV0dXJuICQod2hvKTtcbiAgfVxufTtcblxud2lraS5sb2cgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHRoaW5ncztcbiAgdGhpbmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gIGlmICgodHlwZW9mIGNvbnNvbGUgIT09IFwidW5kZWZpbmVkXCIgJiYgY29uc29sZSAhPT0gbnVsbCA/IGNvbnNvbGUubG9nIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIHRoaW5ncyk7XG4gIH1cbn07XG5cbndpa2kubmVpZ2hib3Job29kID0gcmVxdWlyZSgnLi9uZWlnaGJvcmhvb2QnKS5zaXRlcztcblxud2lraS5uZWlnaGJvcmhvb2RPYmplY3QgPSByZXF1aXJlKCcuL25laWdoYm9yaG9vZCcpO1xuXG5wYWdlSGFuZGxlciA9IHJlcXVpcmUoJy4vcGFnZUhhbmRsZXInKTtcblxud2lraS5wYWdlSGFuZGxlciA9IHBhZ2VIYW5kbGVyO1xuXG53aWtpLnVzZUxvY2FsU3RvcmFnZSA9IHBhZ2VIYW5kbGVyLnVzZUxvY2FsU3RvcmFnZTtcblxucmVzb2x2ZSA9IHJlcXVpcmUoJy4vcmVzb2x2ZScpO1xuXG53aWtpLnJlc29sdmVGcm9tID0gcmVzb2x2ZS5yZXNvbHZlRnJvbTtcblxud2lraS5yZXNvbHZlTGlua3MgPSByZXNvbHZlLnJlc29sdmVMaW5rcztcblxud2lraS5yZXNvbHV0aW9uQ29udGV4dCA9IHJlc29sdmUucmVzb2x1dGlvbkNvbnRleHQ7XG5cbmVkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbndpa2kudGV4dEVkaXRvciA9IGVkaXRvci50ZXh0RWRpdG9yO1xuXG53aWtpLnV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxud2lraS5wZXJzb25hID0gcmVxdWlyZSgnLi9wZXJzb25hJyk7XG5cbndpa2kuY3JlYXRlU3lub3BzaXMgPSByZXF1aXJlKCcuL3N5bm9wc2lzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gd2lraTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiJdfQ==
