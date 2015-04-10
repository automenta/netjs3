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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvbWUvbm9kZV9tb2R1bGVzL3VuZGVyc2NvcmUvdW5kZXJzY29yZS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvZmFrZV85NWM1OWViLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvYWN0aW9uU3ltYm9scy5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL2FjdGl2ZS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL2FkZFRvSm91cm5hbC5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL2JpbmQuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9kaWFsb2cuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9kcm9wLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvZWRpdG9yLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvZmFjdG9yeS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL2Z1dHVyZS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL2ltYWdlLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvaXRlbXouanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9sZWdhY3kuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9saW5ldXAuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9saW5ldXBBY3Rpdml0eS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL2xpbmsuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9uZWlnaGJvcmhvb2QuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9uZWlnaGJvcnMuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9wYWdlLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvcGFnZUhhbmRsZXIuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9wYXJhZ3JhcGguanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9wZXJzb25hLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvcGx1Z2luLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvcGx1Z2lucy5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3JhbmRvbS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3JlZmVyZW5jZS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3JlZnJlc2guanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9yZXNvbHZlLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvcmV2aXNpb24uanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9zZWFyY2guanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9zZWFyY2hib3guanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L2xpYi9zdGF0ZS5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3N5bm9wc2lzLmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvdGFyZ2V0LmpzIiwiL2hvbWUvbWUvc2hhcmUvbmV0anMzL2NsaWVudC9saWIvdXRpbC5qcyIsIi9ob21lL21lL3NoYXJlL25ldGpzMy9jbGllbnQvbGliL3dpa2kuanMiLCIvaG9tZS9tZS9zaGFyZS9uZXRqczMvY2xpZW50L25vZGVfbW9kdWxlcy9ndWxwLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN01BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuNi4wXG4vLyAgICAgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbi8vICAgICAoYykgMjAwOS0yMDE0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJhc2VsaW5lIHNldHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgaW4gdGhlIGJyb3dzZXIsIG9yIGBleHBvcnRzYCBvbiB0aGUgc2VydmVyLlxuICB2YXIgcm9vdCA9IHRoaXM7XG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBfYCB2YXJpYWJsZS5cbiAgdmFyIHByZXZpb3VzVW5kZXJzY29yZSA9IHJvb3QuXztcblxuICAvLyBFc3RhYmxpc2ggdGhlIG9iamVjdCB0aGF0IGdldHMgcmV0dXJuZWQgdG8gYnJlYWsgb3V0IG9mIGEgbG9vcCBpdGVyYXRpb24uXG4gIHZhciBicmVha2VyID0ge307XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgIGNvbmNhdCAgICAgICAgICAgPSBBcnJheVByb3RvLmNvbmNhdCxcbiAgICB0b1N0cmluZyAgICAgICAgID0gT2JqUHJvdG8udG9TdHJpbmcsXG4gICAgaGFzT3duUHJvcGVydHkgICA9IE9ialByb3RvLmhhc093blByb3BlcnR5O1xuXG4gIC8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxuICAvLyBhcmUgZGVjbGFyZWQgaGVyZS5cbiAgdmFyXG4gICAgbmF0aXZlRm9yRWFjaCAgICAgID0gQXJyYXlQcm90by5mb3JFYWNoLFxuICAgIG5hdGl2ZU1hcCAgICAgICAgICA9IEFycmF5UHJvdG8ubWFwLFxuICAgIG5hdGl2ZVJlZHVjZSAgICAgICA9IEFycmF5UHJvdG8ucmVkdWNlLFxuICAgIG5hdGl2ZVJlZHVjZVJpZ2h0ICA9IEFycmF5UHJvdG8ucmVkdWNlUmlnaHQsXG4gICAgbmF0aXZlRmlsdGVyICAgICAgID0gQXJyYXlQcm90by5maWx0ZXIsXG4gICAgbmF0aXZlRXZlcnkgICAgICAgID0gQXJyYXlQcm90by5ldmVyeSxcbiAgICBuYXRpdmVTb21lICAgICAgICAgPSBBcnJheVByb3RvLnNvbWUsXG4gICAgbmF0aXZlSW5kZXhPZiAgICAgID0gQXJyYXlQcm90by5pbmRleE9mLFxuICAgIG5hdGl2ZUxhc3RJbmRleE9mICA9IEFycmF5UHJvdG8ubGFzdEluZGV4T2YsXG4gICAgbmF0aXZlSXNBcnJheSAgICAgID0gQXJyYXkuaXNBcnJheSxcbiAgICBuYXRpdmVLZXlzICAgICAgICAgPSBPYmplY3Qua2V5cyxcbiAgICBuYXRpdmVCaW5kICAgICAgICAgPSBGdW5jUHJvdG8uYmluZDtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QgdmlhIGEgc3RyaW5nIGlkZW50aWZpZXIsXG4gIC8vIGZvciBDbG9zdXJlIENvbXBpbGVyIFwiYWR2YW5jZWRcIiBtb2RlLlxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjYuMCc7XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyBvYmplY3RzIHdpdGggdGhlIGJ1aWx0LWluIGBmb3JFYWNoYCwgYXJyYXlzLCBhbmQgcmF3IG9iamVjdHMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBmb3JFYWNoYCBpZiBhdmFpbGFibGUuXG4gIHZhciBlYWNoID0gXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICBpZiAobmF0aXZlRm9yRWFjaCAmJiBvYmouZm9yRWFjaCA9PT0gbmF0aXZlRm9yRWFjaCkge1xuICAgICAgb2JqLmZvckVhY2goaXRlcmF0b3IsIGNvbnRleHQpO1xuICAgIH0gZWxzZSBpZiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqW2ldLCBpLCBvYmopID09PSBicmVha2VyKSByZXR1cm47XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdG9yIHRvIGVhY2ggZWxlbWVudC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYG1hcGAgaWYgYXZhaWxhYmxlLlxuICBfLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgaWYgKG5hdGl2ZU1hcCAmJiBvYmoubWFwID09PSBuYXRpdmVNYXApIHJldHVybiBvYmoubWFwKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXN1bHRzLnB1c2goaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICB2YXIgcmVkdWNlRXJyb3IgPSAnUmVkdWNlIG9mIGVtcHR5IGFycmF5IHdpdGggbm8gaW5pdGlhbCB2YWx1ZSc7XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlYCBpZiBhdmFpbGFibGUuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgbWVtbywgY29udGV4dCkge1xuICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XG4gICAgaWYgKG9iaiA9PSBudWxsKSBvYmogPSBbXTtcbiAgICBpZiAobmF0aXZlUmVkdWNlICYmIG9iai5yZWR1Y2UgPT09IG5hdGl2ZVJlZHVjZSkge1xuICAgICAgaWYgKGNvbnRleHQpIGl0ZXJhdG9yID0gXy5iaW5kKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgIHJldHVybiBpbml0aWFsID8gb2JqLnJlZHVjZShpdGVyYXRvciwgbWVtbykgOiBvYmoucmVkdWNlKGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSB2YWx1ZTtcbiAgICAgICAgaW5pdGlhbCA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtZW1vID0gaXRlcmF0b3IuY2FsbChjb250ZXh0LCBtZW1vLCB2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghaW5pdGlhbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gVGhlIHJpZ2h0LWFzc29jaWF0aXZlIHZlcnNpb24gb2YgcmVkdWNlLCBhbHNvIGtub3duIGFzIGBmb2xkcmAuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGByZWR1Y2VSaWdodGAgaWYgYXZhaWxhYmxlLlxuICBfLnJlZHVjZVJpZ2h0ID0gXy5mb2xkciA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZVJpZ2h0ICYmIG9iai5yZWR1Y2VSaWdodCA9PT0gbmF0aXZlUmVkdWNlUmlnaHQpIHtcbiAgICAgIGlmIChjb250ZXh0KSBpdGVyYXRvciA9IF8uYmluZChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgICByZXR1cm4gaW5pdGlhbCA/IG9iai5yZWR1Y2VSaWdodChpdGVyYXRvciwgbWVtbykgOiBvYmoucmVkdWNlUmlnaHQoaXRlcmF0b3IpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gb2JqLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoICE9PSArbGVuZ3RoKSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgfVxuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGluZGV4ID0ga2V5cyA/IGtleXNbLS1sZW5ndGhdIDogLS1sZW5ndGg7XG4gICAgICBpZiAoIWluaXRpYWwpIHtcbiAgICAgICAgbWVtbyA9IG9ialtpbmRleF07XG4gICAgICAgIGluaXRpYWwgPSB0cnVlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgbWVtbywgb2JqW2luZGV4XSwgaW5kZXgsIGxpc3QpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghaW5pdGlhbCkgdGhyb3cgbmV3IFR5cGVFcnJvcihyZWR1Y2VFcnJvcik7XG4gICAgcmV0dXJuIG1lbW87XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdDtcbiAgICBhbnkob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBmaWx0ZXJgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgc2VsZWN0YC5cbiAgXy5maWx0ZXIgPSBfLnNlbGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHRzO1xuICAgIGlmIChuYXRpdmVGaWx0ZXIgJiYgb2JqLmZpbHRlciA9PT0gbmF0aXZlRmlsdGVyKSByZXR1cm4gb2JqLmZpbHRlcihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpKSByZXN1bHRzLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIGZvciB3aGljaCBhIHRydXRoIHRlc3QgZmFpbHMuXG4gIF8ucmVqZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiAhcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICB9LCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciBhbGwgb2YgdGhlIGVsZW1lbnRzIG1hdGNoIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGV2ZXJ5YCBpZiBhdmFpbGFibGUuXG4gIC8vIEFsaWFzZWQgYXMgYGFsbGAuXG4gIF8uZXZlcnkgPSBfLmFsbCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlIHx8IChwcmVkaWNhdGUgPSBfLmlkZW50aXR5KTtcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKG5hdGl2ZUV2ZXJ5ICYmIG9iai5ldmVyeSA9PT0gbmF0aXZlRXZlcnkpIHJldHVybiBvYmouZXZlcnkocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAoIShyZXN1bHQgPSByZXN1bHQgJiYgcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSkpIHJldHVybiBicmVha2VyO1xuICAgIH0pO1xuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYHNvbWVgIGlmIGF2YWlsYWJsZS5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgdmFyIGFueSA9IF8uc29tZSA9IF8uYW55ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgfHwgKHByZWRpY2F0ZSA9IF8uaWRlbnRpdHkpO1xuICAgIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKG5hdGl2ZVNvbWUgJiYgb2JqLnNvbWUgPT09IG5hdGl2ZVNvbWUpIHJldHVybiBvYmouc29tZShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChyZXN1bHQgfHwgKHJlc3VsdCA9IHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgbGlzdCkpKSByZXR1cm4gYnJlYWtlcjtcbiAgICB9KTtcbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBhcnJheSBvciBvYmplY3QgY29udGFpbnMgYSBnaXZlbiB2YWx1ZSAodXNpbmcgYD09PWApLlxuICAvLyBBbGlhc2VkIGFzIGBpbmNsdWRlYC5cbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZSA9IGZ1bmN0aW9uKG9iaiwgdGFyZ2V0KSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgaWYgKG5hdGl2ZUluZGV4T2YgJiYgb2JqLmluZGV4T2YgPT09IG5hdGl2ZUluZGV4T2YpIHJldHVybiBvYmouaW5kZXhPZih0YXJnZXQpICE9IC0xO1xuICAgIHJldHVybiBhbnkob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlID09PSB0YXJnZXQ7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gSW52b2tlIGEgbWV0aG9kICh3aXRoIGFyZ3VtZW50cykgb24gZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gIF8uaW52b2tlID0gZnVuY3Rpb24ob2JqLCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgaXNGdW5jID0gXy5pc0Z1bmN0aW9uKG1ldGhvZCk7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiAoaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXSkuYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXG4gIF8ucGx1Y2sgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBfLm1hcChvYmosIF8ucHJvcGVydHkoa2V5KSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmlsdGVyYDogc2VsZWN0aW5nIG9ubHkgb2JqZWN0c1xuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLndoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubWF0Y2hlcyhhdHRycykpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbmRgOiBnZXR0aW5nIHRoZSBmaXJzdCBvYmplY3RcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5maW5kV2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmluZChvYmosIF8ubWF0Y2hlcyhhdHRycykpO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWF4aW11bSBlbGVtZW50IG9yIChlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgLy8gQ2FuJ3Qgb3B0aW1pemUgYXJyYXlzIG9mIGludGVnZXJzIGxvbmdlciB0aGFuIDY1LDUzNSBlbGVtZW50cy5cbiAgLy8gU2VlIFtXZWJLaXQgQnVnIDgwNzk3XShodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9ODA3OTcpXG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmICghaXRlcmF0b3IgJiYgXy5pc0FycmF5KG9iaikgJiYgb2JqWzBdID09PSArb2JqWzBdICYmIG9iai5sZW5ndGggPCA2NTUzNSkge1xuICAgICAgcmV0dXJuIE1hdGgubWF4LmFwcGx5KE1hdGgsIG9iaik7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSAtSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IC1JbmZpbml0eTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRvciA/IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSA6IHZhbHVlO1xuICAgICAgaWYgKGNvbXB1dGVkID4gbGFzdENvbXB1dGVkKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgaWYgKCFpdGVyYXRvciAmJiBfLmlzQXJyYXkob2JqKSAmJiBvYmpbMF0gPT09ICtvYmpbMF0gJiYgb2JqLmxlbmd0aCA8IDY1NTM1KSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4uYXBwbHkoTWF0aCwgb2JqKTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eTtcbiAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICB2YXIgY29tcHV0ZWQgPSBpdGVyYXRvciA/IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSA6IHZhbHVlO1xuICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkKSB7XG4gICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYW4gYXJyYXksIHVzaW5nIHRoZSBtb2Rlcm4gdmVyc2lvbiBvZiB0aGVcbiAgLy8gW0Zpc2hlci1ZYXRlcyBzaHVmZmxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlcuKAk1lhdGVzX3NodWZmbGUpLlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmFuZDtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzaHVmZmxlZCA9IFtdO1xuICAgIGVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKGluZGV4KyspO1xuICAgICAgc2h1ZmZsZWRbaW5kZXggLSAxXSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgc2h1ZmZsZWRbcmFuZF0gPSB2YWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gIH07XG5cbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhIGNvbGxlY3Rpb24uXG4gIC8vIElmICoqbioqIGlzIG5vdCBzcGVjaWZpZWQsIHJldHVybnMgYSBzaW5nbGUgcmFuZG9tIGVsZW1lbnQuXG4gIC8vIFRoZSBpbnRlcm5hbCBgZ3VhcmRgIGFyZ3VtZW50IGFsbG93cyBpdCB0byB3b3JrIHdpdGggYG1hcGAuXG4gIF8uc2FtcGxlID0gZnVuY3Rpb24ob2JqLCBuLCBndWFyZCkge1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHtcbiAgICAgIGlmIChvYmoubGVuZ3RoICE9PSArb2JqLmxlbmd0aCkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcbiAgICB9XG4gICAgcmV0dXJuIF8uc2h1ZmZsZShvYmopLnNsaWNlKDAsIE1hdGgubWF4KDAsIG4pKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBsb29rdXAgaXRlcmF0b3JzLlxuICB2YXIgbG9va3VwSXRlcmF0b3IgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gXy5pZGVudGl0eTtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgIHJldHVybiBfLnByb3BlcnR5KHZhbHVlKTtcbiAgfTtcblxuICAvLyBTb3J0IHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24gcHJvZHVjZWQgYnkgYW4gaXRlcmF0b3IuXG4gIF8uc29ydEJ5ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgIHJldHVybiBfLnBsdWNrKF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgY3JpdGVyaWE6IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaXRlcmF0b3IgPSBsb29rdXBJdGVyYXRvcihpdGVyYXRvcik7XG4gICAgICBlYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgIHZhciBrZXkgPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCBrZXksIHZhbHVlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwga2V5LCB2YWx1ZSkge1xuICAgIF8uaGFzKHJlc3VsdCwga2V5KSA/IHJlc3VsdFtrZXldLnB1c2godmFsdWUpIDogcmVzdWx0W2tleV0gPSBbdmFsdWVdO1xuICB9KTtcblxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4gIC8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZS5cbiAgXy5pbmRleEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCBrZXksIHZhbHVlKSB7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwga2V5KSB7XG4gICAgXy5oYXMocmVzdWx0LCBrZXkpID8gcmVzdWx0W2tleV0rKyA6IHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gVXNlIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBzbWFsbGVzdCBpbmRleCBhdCB3aGljaFxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG4gIF8uc29ydGVkSW5kZXggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgIHZhciB2YWx1ZSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgb2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IChsb3cgKyBoaWdoKSA+Pj4gMTtcbiAgICAgIGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgYXJyYXlbbWlkXSkgPCB2YWx1ZSA/IGxvdyA9IG1pZCArIDEgOiBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkgcmV0dXJuIF8ubWFwKG9iaiwgXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIF8udmFsdWVzKG9iaik7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxuICBfLnNpemUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAwO1xuICAgIHJldHVybiAob2JqLmxlbmd0aCA9PT0gK29iai5sZW5ndGgpID8gb2JqLmxlbmd0aCA6IF8ua2V5cyhvYmopLmxlbmd0aDtcbiAgfTtcblxuICAvLyBBcnJheSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYGhlYWRgIGFuZCBgdGFrZWAuIFRoZSAqKmd1YXJkKiogY2hlY2tcbiAgLy8gYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmZpcnN0ID0gXy5oZWFkID0gXy50YWtlID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKChuID09IG51bGwpIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgaWYgKG4gPCAwKSByZXR1cm4gW107XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIG4pO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGxhc3QgZW50cnkgb2YgdGhlIGFycmF5LiBFc3BlY2lhbGx5IHVzZWZ1bCBvblxuICAvLyB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiBhbGwgdGhlIHZhbHVlcyBpblxuICAvLyB0aGUgYXJyYXksIGV4Y2x1ZGluZyB0aGUgbGFzdCBOLiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGhcbiAgLy8gYF8ubWFwYC5cbiAgXy5pbml0aWFsID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIGFycmF5Lmxlbmd0aCAtICgobiA9PSBudWxsKSB8fCBndWFyZCA/IDEgOiBuKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBUaGUgKipndWFyZCoqIGNoZWNrIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5sYXN0ID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKChuID09IG51bGwpIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIE1hdGgubWF4KGFycmF5Lmxlbmd0aCAtIG4sIDApKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS4gVGhlICoqZ3VhcmQqKlxuICAvLyBjaGVjayBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8ucmVzdCA9IF8udGFpbCA9IF8uZHJvcCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAobiA9PSBudWxsKSB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBfLmlkZW50aXR5KTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIG91dHB1dCkge1xuICAgIGlmIChzaGFsbG93ICYmIF8uZXZlcnkoaW5wdXQsIF8uaXNBcnJheSkpIHtcbiAgICAgIHJldHVybiBjb25jYXQuYXBwbHkob3V0cHV0LCBpbnB1dCk7XG4gICAgfVxuICAgIGVhY2goaW5wdXQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSB8fCBfLmlzQXJndW1lbnRzKHZhbHVlKSkge1xuICAgICAgICBzaGFsbG93ID8gcHVzaC5hcHBseShvdXRwdXQsIHZhbHVlKSA6IGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIG91dHB1dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvdXRwdXQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICAvLyBGbGF0dGVuIG91dCBhbiBhcnJheSwgZWl0aGVyIHJlY3Vyc2l2ZWx5IChieSBkZWZhdWx0KSwgb3IganVzdCBvbmUgbGV2ZWwuXG4gIF8uZmxhdHRlbiA9IGZ1bmN0aW9uKGFycmF5LCBzaGFsbG93KSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4oYXJyYXksIHNoYWxsb3csIFtdKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSB2ZXJzaW9uIG9mIHRoZSBhcnJheSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNwZWNpZmllZCB2YWx1ZShzKS5cbiAgXy53aXRob3V0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKGFycmF5LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB9O1xuXG4gIC8vIFNwbGl0IGFuIGFycmF5IGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24oYXJyYXksIHByZWRpY2F0ZSkge1xuICAgIHZhciBwYXNzID0gW10sIGZhaWwgPSBbXTtcbiAgICBlYWNoKGFycmF5LCBmdW5jdGlvbihlbGVtKSB7XG4gICAgICAocHJlZGljYXRlKGVsZW0pID8gcGFzcyA6IGZhaWwpLnB1c2goZWxlbSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtwYXNzLCBmYWlsXTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0b3I7XG4gICAgICBpdGVyYXRvciA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGluaXRpYWwgPSBpdGVyYXRvciA/IF8ubWFwKGFycmF5LCBpdGVyYXRvciwgY29udGV4dCkgOiBhcnJheTtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHZhciBzZWVuID0gW107XG4gICAgZWFjaChpbml0aWFsLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgIGlmIChpc1NvcnRlZCA/ICghaW5kZXggfHwgc2VlbltzZWVuLmxlbmd0aCAtIDFdICE9PSB2YWx1ZSkgOiAhXy5jb250YWlucyhzZWVuLCB2YWx1ZSkpIHtcbiAgICAgICAgc2Vlbi5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGFycmF5W2luZGV4XSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW5pcShfLmZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKF8udW5pcShhcnJheSksIGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiBfLmV2ZXJ5KHJlc3QsIGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgICAgIHJldHVybiBfLmNvbnRhaW5zKG90aGVyLCBpdGVtKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFRha2UgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBvbmUgYXJyYXkgYW5kIGEgbnVtYmVyIG9mIG90aGVyIGFycmF5cy5cbiAgLy8gT25seSB0aGUgZWxlbWVudHMgcHJlc2VudCBpbiBqdXN0IHRoZSBmaXJzdCBhcnJheSB3aWxsIHJlbWFpbi5cbiAgXy5kaWZmZXJlbmNlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IGNvbmNhdC5hcHBseShBcnJheVByb3RvLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpeyByZXR1cm4gIV8uY29udGFpbnMocmVzdCwgdmFsdWUpOyB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZW5ndGggPSBfLm1heChfLnBsdWNrKGFyZ3VtZW50cywgJ2xlbmd0aCcpLmNvbmNhdCgwKSk7XG4gICAgdmFyIHJlc3VsdHMgPSBuZXcgQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRzW2ldID0gXy5wbHVjayhhcmd1bWVudHMsICcnICsgaSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENvbnZlcnRzIGxpc3RzIGludG8gb2JqZWN0cy4gUGFzcyBlaXRoZXIgYSBzaW5nbGUgYXJyYXkgb2YgYFtrZXksIHZhbHVlXWBcbiAgLy8gcGFpcnMsIG9yIHR3byBwYXJhbGxlbCBhcnJheXMgb2YgdGhlIHNhbWUgbGVuZ3RoIC0tIG9uZSBvZiBrZXlzLCBhbmQgb25lIG9mXG4gIC8vIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgXy5vYmplY3QgPSBmdW5jdGlvbihsaXN0LCB2YWx1ZXMpIHtcbiAgICBpZiAobGlzdCA9PSBudWxsKSByZXR1cm4ge307XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0Lmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldXSA9IHZhbHVlc1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldWzBdXSA9IGxpc3RbaV1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gSWYgdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwbHkgdXMgd2l0aCBpbmRleE9mIChJJ20gbG9va2luZyBhdCB5b3UsICoqTVNJRSoqKSxcbiAgLy8gd2UgbmVlZCB0aGlzIGZ1bmN0aW9uLiBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuXG4gIC8vIGl0ZW0gaW4gYW4gYXJyYXksIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBpbmRleE9mYCBpZiBhdmFpbGFibGUuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgaXNTb3J0ZWQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIC0xO1xuICAgIHZhciBpID0gMCwgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICAgIGlmIChpc1NvcnRlZCkge1xuICAgICAgaWYgKHR5cGVvZiBpc1NvcnRlZCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpID0gKGlzU29ydGVkIDwgMCA/IE1hdGgubWF4KDAsIGxlbmd0aCArIGlzU29ydGVkKSA6IGlzU29ydGVkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGkgPSBfLnNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2ldID09PSBpdGVtID8gaSA6IC0xO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobmF0aXZlSW5kZXhPZiAmJiBhcnJheS5pbmRleE9mID09PSBuYXRpdmVJbmRleE9mKSByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtLCBpc1NvcnRlZCk7XG4gICAgZm9yICg7IGkgPCBsZW5ndGg7IGkrKykgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYGxhc3RJbmRleE9mYCBpZiBhdmFpbGFibGUuXG4gIF8ubGFzdEluZGV4T2YgPSBmdW5jdGlvbihhcnJheSwgaXRlbSwgZnJvbSkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gLTE7XG4gICAgdmFyIGhhc0luZGV4ID0gZnJvbSAhPSBudWxsO1xuICAgIGlmIChuYXRpdmVMYXN0SW5kZXhPZiAmJiBhcnJheS5sYXN0SW5kZXhPZiA9PT0gbmF0aXZlTGFzdEluZGV4T2YpIHtcbiAgICAgIHJldHVybiBoYXNJbmRleCA/IGFycmF5Lmxhc3RJbmRleE9mKGl0ZW0sIGZyb20pIDogYXJyYXkubGFzdEluZGV4T2YoaXRlbSk7XG4gICAgfVxuICAgIHZhciBpID0gKGhhc0luZGV4ID8gZnJvbSA6IGFycmF5Lmxlbmd0aCk7XG4gICAgd2hpbGUgKGktLSkgaWYgKGFycmF5W2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYW4gaW50ZWdlciBBcnJheSBjb250YWluaW5nIGFuIGFyaXRobWV0aWMgcHJvZ3Jlc3Npb24uIEEgcG9ydCBvZlxuICAvLyB0aGUgbmF0aXZlIFB5dGhvbiBgcmFuZ2UoKWAgZnVuY3Rpb24uIFNlZVxuICAvLyBbdGhlIFB5dGhvbiBkb2N1bWVudGF0aW9uXShodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvZnVuY3Rpb25zLmh0bWwjcmFuZ2UpLlxuICBfLnJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICBzdG9wID0gc3RhcnQgfHwgMDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgc3RlcCA9IGFyZ3VtZW50c1syXSB8fCAxO1xuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgaWR4ID0gMDtcbiAgICB2YXIgcmFuZ2UgPSBuZXcgQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlKGlkeCA8IGxlbmd0aCkge1xuICAgICAgcmFuZ2VbaWR4KytdID0gc3RhcnQ7XG4gICAgICBzdGFydCArPSBzdGVwO1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJldXNhYmxlIGNvbnN0cnVjdG9yIGZ1bmN0aW9uIGZvciBwcm90b3R5cGUgc2V0dGluZy5cbiAgdmFyIGN0b3IgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4gIC8vIG9wdGlvbmFsbHkpLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgRnVuY3Rpb24uYmluZGAgaWZcbiAgLy8gYXZhaWxhYmxlLlxuICBfLmJpbmQgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MsIGJvdW5kO1xuICAgIGlmIChuYXRpdmVCaW5kICYmIGZ1bmMuYmluZCA9PT0gbmF0aXZlQmluZCkgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihmdW5jKSkgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIGJvdW5kKSkgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICBjdG9yLnByb3RvdHlwZSA9IGZ1bmMucHJvdG90eXBlO1xuICAgICAgdmFyIHNlbGYgPSBuZXcgY3RvcjtcbiAgICAgIGN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHNlbGYsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgaWYgKE9iamVjdChyZXN1bHQpID09PSByZXN1bHQpIHJldHVybiByZXN1bHQ7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFBhcnRpYWxseSBhcHBseSBhIGZ1bmN0aW9uIGJ5IGNyZWF0aW5nIGEgdmVyc2lvbiB0aGF0IGhhcyBoYWQgc29tZSBvZiBpdHNcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuIF8gYWN0c1xuICAvLyBhcyBhIHBsYWNlaG9sZGVyLCBhbGxvd2luZyBhbnkgY29tYmluYXRpb24gb2YgYXJndW1lbnRzIHRvIGJlIHByZS1maWxsZWQuXG4gIF8ucGFydGlhbCA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgYm91bmRBcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IDA7XG4gICAgICB2YXIgYXJncyA9IGJvdW5kQXJncy5zbGljZSgpO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGFyZ3MubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGFyZ3NbaV0gPT09IF8pIGFyZ3NbaV0gPSBhcmd1bWVudHNbcG9zaXRpb24rK107XG4gICAgICB9XG4gICAgICB3aGlsZSAocG9zaXRpb24gPCBhcmd1bWVudHMubGVuZ3RoKSBhcmdzLnB1c2goYXJndW1lbnRzW3Bvc2l0aW9uKytdKTtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQmluZCBhIG51bWJlciBvZiBhbiBvYmplY3QncyBtZXRob2RzIHRvIHRoYXQgb2JqZWN0LiBSZW1haW5pbmcgYXJndW1lbnRzXG4gIC8vIGFyZSB0aGUgbWV0aG9kIG5hbWVzIHRvIGJlIGJvdW5kLiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXQgYWxsIGNhbGxiYWNrc1xuICAvLyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXG4gIF8uYmluZEFsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBmdW5jcyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBpZiAoZnVuY3MubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBbGwgbXVzdCBiZSBwYXNzZWQgZnVuY3Rpb24gbmFtZXMnKTtcbiAgICBlYWNoKGZ1bmNzLCBmdW5jdGlvbihmKSB7IG9ialtmXSA9IF8uYmluZChvYmpbZl0sIG9iaik7IH0pO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW8gPSB7fTtcbiAgICBoYXNoZXIgfHwgKGhhc2hlciA9IF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBfLmhhcyhtZW1vLCBrZXkpID8gbWVtb1trZXldIDogKG1lbW9ba2V5XSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpeyByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTsgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgcmV0dXJuIF8uZGVsYXkuYXBwbHkoXywgW2Z1bmMsIDFdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIHdoZW4gaW52b2tlZCwgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZCBhdCBtb3N0IG9uY2VcbiAgLy8gZHVyaW5nIGEgZ2l2ZW4gd2luZG93IG9mIHRpbWUuIE5vcm1hbGx5LCB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHdpbGwgcnVuXG4gIC8vIGFzIG11Y2ggYXMgaXQgY2FuLCB3aXRob3V0IGV2ZXIgZ29pbmcgbW9yZSB0aGFuIG9uY2UgcGVyIGB3YWl0YCBkdXJhdGlvbjtcbiAgLy8gYnV0IGlmIHlvdSdkIGxpa2UgdG8gZGlzYWJsZSB0aGUgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2UsIHBhc3NcbiAgLy8gYHtsZWFkaW5nOiBmYWxzZX1gLiBUbyBkaXNhYmxlIGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSwgZGl0dG8uXG4gIF8udGhyb3R0bGUgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gICAgdmFyIGNvbnRleHQsIGFyZ3MsIHJlc3VsdDtcbiAgICB2YXIgdGltZW91dCA9IG51bGw7XG4gICAgdmFyIHByZXZpb3VzID0gMDtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IF8ubm93KCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbm93ID0gXy5ub3coKTtcbiAgICAgIGlmICghcHJldmlvdXMgJiYgb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSkgcHJldmlvdXMgPSBub3c7XG4gICAgICB2YXIgcmVtYWluaW5nID0gd2FpdCAtIChub3cgLSBwcmV2aW91cyk7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBpZiAocmVtYWluaW5nIDw9IDApIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0O1xuXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdCA9IF8ubm93KCkgLSB0aW1lc3RhbXA7XG4gICAgICBpZiAobGFzdCA8IHdhaXQpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHRpbWVzdGFtcCA9IF8ubm93KCk7XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgIGlmICghdGltZW91dCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICB9XG4gICAgICBpZiAoY2FsbE5vdykge1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cbiAgXy5vbmNlID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciByYW4gPSBmYWxzZSwgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAocmFuKSByZXR1cm4gbWVtbztcbiAgICAgIHJhbiA9IHRydWU7XG4gICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgZnVuYyA9IG51bGw7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHdyYXBwZXIsIGZ1bmMpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmdW5jcyA9IGFyZ3VtZW50cztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGZvciAodmFyIGkgPSBmdW5jcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBhcmdzID0gW2Z1bmNzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhcmdzWzBdO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIGFmdGVyIGJlaW5nIGNhbGxlZCBOIHRpbWVzLlxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJldHJpZXZlIHRoZSBuYW1lcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgXG4gIF8ua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgaWYgKG5hdGl2ZUtleXMpIHJldHVybiBuYXRpdmVLZXlzKG9iaik7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBDb252ZXJ0IGFuIG9iamVjdCBpbnRvIGEgbGlzdCBvZiBgW2tleSwgdmFsdWVdYCBwYWlycy5cbiAgXy5wYWlycyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciBwYWlycyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgb2JqW3Byb3BdID0gc291cmNlW3Byb3BdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgb25seSBjb250YWluaW5nIHRoZSB3aGl0ZWxpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLnBpY2sgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgY29weSA9IHt9O1xuICAgIHZhciBrZXlzID0gY29uY2F0LmFwcGx5KEFycmF5UHJvdG8sIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgZWFjaChrZXlzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChrZXkgaW4gb2JqKSBjb3B5W2tleV0gPSBvYmpba2V5XTtcbiAgICB9KTtcbiAgICByZXR1cm4gY29weTtcbiAgfTtcblxuICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IHdpdGhvdXQgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ub21pdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBjb3B5ID0ge307XG4gICAgdmFyIGtleXMgPSBjb25jYXQuYXBwbHkoQXJyYXlQcm90bywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoIV8uY29udGFpbnMoa2V5cywga2V5KSkgY29weVtrZXldID0gb2JqW2tleV07XG4gICAgfVxuICAgIHJldHVybiBjb3B5O1xuICB9O1xuXG4gIC8vIEZpbGwgaW4gYSBnaXZlbiBvYmplY3Qgd2l0aCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gIF8uZGVmYXVsdHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBlYWNoKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICBpZiAoc291cmNlKSB7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gc291cmNlKSB7XG4gICAgICAgICAgaWYgKG9ialtwcm9wXSA9PT0gdm9pZCAwKSBvYmpbcHJvcF0gPSBzb3VyY2VbcHJvcF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIChzaGFsbG93LWNsb25lZCkgZHVwbGljYXRlIG9mIGFuIG9iamVjdC5cbiAgXy5jbG9uZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiBfLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogXy5leHRlbmQoe30sIG9iaik7XG4gIH07XG5cbiAgLy8gSW52b2tlcyBpbnRlcmNlcHRvciB3aXRoIHRoZSBvYmosIGFuZCB0aGVuIHJldHVybnMgb2JqLlxuICAvLyBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZCBjaGFpbiwgaW5cbiAgLy8gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpbiB0aGUgY2hhaW4uXG4gIF8udGFwID0gZnVuY3Rpb24ob2JqLCBpbnRlcmNlcHRvcikge1xuICAgIGludGVyY2VwdG9yKG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT0gMSAvIGI7XG4gICAgLy8gQSBzdHJpY3QgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkgYmVjYXVzZSBgbnVsbCA9PSB1bmRlZmluZWRgLlxuICAgIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSByZXR1cm4gYSA9PT0gYjtcbiAgICAvLyBVbndyYXAgYW55IHdyYXBwZWQgb2JqZWN0cy5cbiAgICBpZiAoYSBpbnN0YW5jZW9mIF8pIGEgPSBhLl93cmFwcGVkO1xuICAgIGlmIChiIGluc3RhbmNlb2YgXykgYiA9IGIuX3dyYXBwZWQ7XG4gICAgLy8gQ29tcGFyZSBgW1tDbGFzc11dYCBuYW1lcy5cbiAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbChhKTtcbiAgICBpZiAoY2xhc3NOYW1lICE9IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcbiAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgLy8gU3RyaW5ncywgbnVtYmVycywgZGF0ZXMsIGFuZCBib29sZWFucyBhcmUgY29tcGFyZWQgYnkgdmFsdWUuXG4gICAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgICAvLyBQcmltaXRpdmVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIG9iamVjdCB3cmFwcGVycyBhcmUgZXF1aXZhbGVudDsgdGh1cywgYFwiNVwiYCBpc1xuICAgICAgICAvLyBlcXVpdmFsZW50IHRvIGBuZXcgU3RyaW5nKFwiNVwiKWAuXG4gICAgICAgIHJldHVybiBhID09IFN0cmluZyhiKTtcbiAgICAgIGNhc2UgJ1tvYmplY3QgTnVtYmVyXSc6XG4gICAgICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuIEFuIGBlZ2FsYCBjb21wYXJpc29uIGlzIHBlcmZvcm1lZCBmb3JcbiAgICAgICAgLy8gb3RoZXIgbnVtZXJpYyB2YWx1ZXMuXG4gICAgICAgIHJldHVybiBhICE9ICthID8gYiAhPSArYiA6IChhID09IDAgPyAxIC8gYSA9PSAxIC8gYiA6IGEgPT0gK2IpO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09ICtiO1xuICAgICAgLy8gUmVnRXhwcyBhcmUgY29tcGFyZWQgYnkgdGhlaXIgc291cmNlIHBhdHRlcm5zIGFuZCBmbGFncy5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAgIHJldHVybiBhLnNvdXJjZSA9PSBiLnNvdXJjZSAmJlxuICAgICAgICAgICAgICAgYS5nbG9iYWwgPT0gYi5nbG9iYWwgJiZcbiAgICAgICAgICAgICAgIGEubXVsdGlsaW5lID09IGIubXVsdGlsaW5lICYmXG4gICAgICAgICAgICAgICBhLmlnbm9yZUNhc2UgPT0gYi5pZ25vcmVDYXNlO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG4gICAgdmFyIGxlbmd0aCA9IGFTdGFjay5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PSBhKSByZXR1cm4gYlN0YWNrW2xlbmd0aF0gPT0gYjtcbiAgICB9XG4gICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzXG4gICAgLy8gZnJvbSBkaWZmZXJlbnQgZnJhbWVzIGFyZS5cbiAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgaWYgKGFDdG9yICE9PSBiQ3RvciAmJiAhKF8uaXNGdW5jdGlvbihhQ3RvcikgJiYgKGFDdG9yIGluc3RhbmNlb2YgYUN0b3IpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNGdW5jdGlvbihiQ3RvcikgJiYgKGJDdG9yIGluc3RhbmNlb2YgYkN0b3IpKVxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCdjb25zdHJ1Y3RvcicgaW4gYSAmJiAnY29uc3RydWN0b3InIGluIGIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcbiAgICB2YXIgc2l6ZSA9IDAsIHJlc3VsdCA9IHRydWU7XG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgaWYgKGNsYXNzTmFtZSA9PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIHNpemUgPSBhLmxlbmd0aDtcbiAgICAgIHJlc3VsdCA9IHNpemUgPT0gYi5sZW5ndGg7XG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICAgIHdoaWxlIChzaXplLS0pIHtcbiAgICAgICAgICBpZiAoIShyZXN1bHQgPSBlcShhW3NpemVdLCBiW3NpemVdLCBhU3RhY2ssIGJTdGFjaykpKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cbiAgICAgIGZvciAodmFyIGtleSBpbiBhKSB7XG4gICAgICAgIGlmIChfLmhhcyhhLCBrZXkpKSB7XG4gICAgICAgICAgLy8gQ291bnQgdGhlIGV4cGVjdGVkIG51bWJlciBvZiBwcm9wZXJ0aWVzLlxuICAgICAgICAgIHNpemUrKztcbiAgICAgICAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXIuXG4gICAgICAgICAgaWYgKCEocmVzdWx0ID0gXy5oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIEVuc3VyZSB0aGF0IGJvdGggb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzLlxuICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICBmb3IgKGtleSBpbiBiKSB7XG4gICAgICAgICAgaWYgKF8uaGFzKGIsIGtleSkgJiYgIShzaXplLS0pKSBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSAhc2l6ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxuICBfLmlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGVxKGEsIGIsIFtdLCBbXSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiBhcnJheSwgc3RyaW5nLCBvciBvYmplY3QgZW1wdHk/XG4gIC8vIEFuIFwiZW1wdHlcIiBvYmplY3QgaGFzIG5vIGVudW1lcmFibGUgb3duLXByb3BlcnRpZXMuXG4gIF8uaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNTdHJpbmcob2JqKSkgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBET00gZWxlbWVudD9cbiAgXy5pc0VsZW1lbnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gISEob2JqICYmIG9iai5ub2RlVHlwZSA9PT0gMSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhbiBhcnJheT9cbiAgLy8gRGVsZWdhdGVzIHRvIEVDTUE1J3MgbmF0aXZlIEFycmF5LmlzQXJyYXlcbiAgXy5pc0FycmF5ID0gbmF0aXZlSXNBcnJheSB8fCBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbiAgfTtcblxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cC5cbiAgZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PSAnW29iamVjdCAnICsgbmFtZSArICddJztcbiAgICB9O1xuICB9KTtcblxuICAvLyBEZWZpbmUgYSBmYWxsYmFjayB2ZXJzaW9uIG9mIHRoZSBtZXRob2QgaW4gYnJvd3NlcnMgKGFoZW0sIElFKSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gISEob2JqICYmIF8uaGFzKG9iaiwgJ2NhbGxlZScpKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLlxuICBpZiAodHlwZW9mICgvLi8pICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgXy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT0gK29iajtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgYm9vbGVhbj9cbiAgXy5pc0Jvb2xlYW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB0cnVlIHx8IG9iaiA9PT0gZmFsc2UgfHwgdG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG4gIF8uaXNOdWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbiAgXy5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfTtcblxuICAvLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXG4gIF8uaGFzID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSk7XG4gIH07XG5cbiAgLy8gVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gVW5kZXJzY29yZS5qcyBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgX2AgdmFyaWFibGUgdG8gaXRzXG4gIC8vIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcm9vdC5fID0gcHJldmlvdXNVbmRlcnNjb3JlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIEtlZXAgdGhlIGlkZW50aXR5IGZ1bmN0aW9uIGFyb3VuZCBmb3IgZGVmYXVsdCBpdGVyYXRvcnMuXG4gIF8uaWRlbnRpdHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICBfLmNvbnN0YW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH07XG5cbiAgXy5wcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBwcmVkaWNhdGUgZm9yIGNoZWNraW5nIHdoZXRoZXIgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHNldCBvZiBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5tYXRjaGVzID0gZnVuY3Rpb24oYXR0cnMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICBpZiAob2JqID09PSBhdHRycykgcmV0dXJuIHRydWU7IC8vYXZvaWQgY29tcGFyaW5nIGFuIG9iamVjdCB0byBpdHNlbGYuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gYXR0cnMpIHtcbiAgICAgICAgaWYgKGF0dHJzW2tleV0gIT09IG9ialtrZXldKVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfTtcblxuICAvLyBSdW4gYSBmdW5jdGlvbiAqKm4qKiB0aW1lcy5cbiAgXy50aW1lcyA9IGZ1bmN0aW9uKG4sIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIGFjY3VtID0gQXJyYXkoTWF0aC5tYXgoMCwgbikpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgaSk7XG4gICAgcmV0dXJuIGFjY3VtO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIGFuZCBtYXggKGluY2x1c2l2ZSkuXG4gIF8ucmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICB9O1xuXG4gIC8vIEEgKHBvc3NpYmx5IGZhc3Rlcikgd2F5IHRvIGdldCB0aGUgY3VycmVudCB0aW1lc3RhbXAgYXMgYW4gaW50ZWdlci5cbiAgXy5ub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuXG4gIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlbnRpdHlNYXAgPSB7XG4gICAgZXNjYXBlOiB7XG4gICAgICAnJic6ICcmYW1wOycsXG4gICAgICAnPCc6ICcmbHQ7JyxcbiAgICAgICc+JzogJyZndDsnLFxuICAgICAgJ1wiJzogJyZxdW90OycsXG4gICAgICBcIidcIjogJyYjeDI3OydcbiAgICB9XG4gIH07XG4gIGVudGl0eU1hcC51bmVzY2FwZSA9IF8uaW52ZXJ0KGVudGl0eU1hcC5lc2NhcGUpO1xuXG4gIC8vIFJlZ2V4ZXMgY29udGFpbmluZyB0aGUga2V5cyBhbmQgdmFsdWVzIGxpc3RlZCBpbW1lZGlhdGVseSBhYm92ZS5cbiAgdmFyIGVudGl0eVJlZ2V4ZXMgPSB7XG4gICAgZXNjYXBlOiAgIG5ldyBSZWdFeHAoJ1snICsgXy5rZXlzKGVudGl0eU1hcC5lc2NhcGUpLmpvaW4oJycpICsgJ10nLCAnZycpLFxuICAgIHVuZXNjYXBlOiBuZXcgUmVnRXhwKCcoJyArIF8ua2V5cyhlbnRpdHlNYXAudW5lc2NhcGUpLmpvaW4oJ3wnKSArICcpJywgJ2cnKVxuICB9O1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgXy5lYWNoKFsnZXNjYXBlJywgJ3VuZXNjYXBlJ10sIGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgIF9bbWV0aG9kXSA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgaWYgKHN0cmluZyA9PSBudWxsKSByZXR1cm4gJyc7XG4gICAgICByZXR1cm4gKCcnICsgc3RyaW5nKS5yZXBsYWNlKGVudGl0eVJlZ2V4ZXNbbWV0aG9kXSwgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIGVudGl0eU1hcFttZXRob2RdW21hdGNoXTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgYHByb3BlcnR5YCBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0IHdpdGggdGhlXG4gIC8vIGBvYmplY3RgIGFzIGNvbnRleHQ7IG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTtcbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlLmNhbGwob2JqZWN0KSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGVhY2goXy5mdW5jdGlvbnMob2JqKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF07XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlICAgIDogLzwlKFtcXHNcXFNdKz8pJT4vZyxcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZSAgICAgIDogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogICAgICBcIidcIixcbiAgICAnXFxcXCc6ICAgICAnXFxcXCcsXG4gICAgJ1xccic6ICAgICAncicsXG4gICAgJ1xcbic6ICAgICAnbicsXG4gICAgJ1xcdCc6ICAgICAndCcsXG4gICAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ3UyMDI5J1xuICB9O1xuXG4gIHZhciBlc2NhcGVyID0gL1xcXFx8J3xcXHJ8XFxufFxcdHxcXHUyMDI4fFxcdTIwMjkvZztcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgZGF0YSwgc2V0dGluZ3MpIHtcbiAgICB2YXIgcmVuZGVyO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IG5ldyBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpXG4gICAgICAgIC5yZXBsYWNlKGVzY2FwZXIsIGZ1bmN0aW9uKG1hdGNoKSB7IHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTsgfSk7XG5cbiAgICAgIGlmIChlc2NhcGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBlc2NhcGUgKyBcIikpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xcbidcIjtcbiAgICAgIH1cbiAgICAgIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH1cbiAgICAgIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuICAgICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyBcInJldHVybiBfX3A7XFxuXCI7XG5cbiAgICB0cnkge1xuICAgICAgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIGlmIChkYXRhKSByZXR1cm4gcmVuZGVyKGRhdGEsIF8pO1xuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgZnVuY3Rpb24gc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonKSArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLCB3aGljaCB3aWxsIGRlbGVnYXRlIHRvIHRoZSB3cmFwcGVyLlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8ob2JqKS5jaGFpbigpO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciByZXN1bHQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdGhpcy5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcbiAgfTtcblxuICAvLyBBZGQgYWxsIG9mIHRoZSBVbmRlcnNjb3JlIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlciBvYmplY3QuXG4gIF8ubWl4aW4oXyk7XG5cbiAgLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgZWFjaChbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndW5zaGlmdCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvYmogPSB0aGlzLl93cmFwcGVkO1xuICAgICAgbWV0aG9kLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICAgIGlmICgobmFtZSA9PSAnc2hpZnQnIHx8IG5hbWUgPT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9KTtcblxuICBfLmV4dGVuZChfLnByb3RvdHlwZSwge1xuXG4gICAgLy8gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICAgIGNoYWluOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX2NoYWluID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvLyBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSB3cmFwcGVkIGFuZCBjaGFpbmVkIG9iamVjdC5cbiAgICB2YWx1ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgICB9XG5cbiAgfSk7XG5cbiAgLy8gQU1EIHJlZ2lzdHJhdGlvbiBoYXBwZW5zIGF0IHRoZSBlbmQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBBTUQgbG9hZGVyc1xuICAvLyB0aGF0IG1heSBub3QgZW5mb3JjZSBuZXh0LXR1cm4gc2VtYW50aWNzIG9uIG1vZHVsZXMuIEV2ZW4gdGhvdWdoIGdlbmVyYWxcbiAgLy8gcHJhY3RpY2UgZm9yIEFNRCByZWdpc3RyYXRpb24gaXMgdG8gYmUgYW5vbnltb3VzLCB1bmRlcnNjb3JlIHJlZ2lzdGVyc1xuICAvLyBhcyBhIG5hbWVkIG1vZHVsZSBiZWNhdXNlLCBsaWtlIGpRdWVyeSwgaXQgaXMgYSBiYXNlIGxpYnJhcnkgdGhhdCBpc1xuICAvLyBwb3B1bGFyIGVub3VnaCB0byBiZSBidW5kbGVkIGluIGEgdGhpcmQgcGFydHkgbGliLCBidXQgbm90IGJlIHBhcnQgb2ZcbiAgLy8gYW4gQU1EIGxvYWQgcmVxdWVzdC4gVGhvc2UgY2FzZXMgY291bGQgZ2VuZXJhdGUgYW4gZXJyb3Igd2hlbiBhblxuICAvLyBhbm9ueW1vdXMgZGVmaW5lKCkgaXMgY2FsbGVkIG91dHNpZGUgb2YgYSBsb2FkZXIgcmVxdWVzdC5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZSgndW5kZXJzY29yZScsIFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfO1xuICAgIH0pO1xuICB9XG59KS5jYWxsKHRoaXMpO1xuIiwiLy9jb25zb2xlLmxvZyhcIldpbmRvdyBOYW1lOiBcIiArIHdpbmRvdy5uYW1lKTtcblxudmFyIHdpa2kgPSByZXF1aXJlKCcuL2xpYi93aWtpJyk7XG5cbnRyeSB7XG4gICAgd2luZG93Lm5hbWUgPSB3aW5kb3cubG9jYXRpb24uaG9zdDtcblxuICAgIHdpbmRvdy53aWtpID0gd2lraTtcblxuICAgIHJlcXVpcmUoJy4vbGliL2xlZ2FjeScpO1xuXG4gICAgcmVxdWlyZSgnLi9saWIvYmluZCcpO1xuXG4gICAgcmVxdWlyZSgnLi9saWIvcGx1Z2lucycpO1xuXG5cblxufVxuY2F0Y2ggKGUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgd2lraTogd2lraSxcbiAgICAgICAgc3lub3BzaXM6IHJlcXVpcmUoJy4vbGliL3N5bm9wc2lzJylcbiAgICB9O1xufSIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhZGQsIGZvcmssIHN5bWJvbHM7XG5cbnN5bWJvbHMgPSB7XG4gIGNyZWF0ZTogJ+KYvCcsXG4gIGFkZDogJysnLFxuICBlZGl0OiAn4pyOJyxcbiAgZm9yazogJ+KakScsXG4gIG1vdmU6ICfihpUnLFxuICByZW1vdmU6ICfinJUnXG59O1xuXG5mb3JrID0gc3ltYm9sc1snZm9yayddO1xuXG5hZGQgPSBzeW1ib2xzWydhZGQnXTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHN5bWJvbHM6IHN5bWJvbHMsXG4gIGZvcms6IGZvcmssXG4gIGFkZDogYWRkXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGFjdGl2ZSwgZmluZFNjcm9sbENvbnRhaW5lciwgc2Nyb2xsVG87XG5cbm1vZHVsZS5leHBvcnRzID0gYWN0aXZlID0ge307XG5cbmFjdGl2ZS5zY3JvbGxDb250YWluZXIgPSB2b2lkIDA7XG5cbmZpbmRTY3JvbGxDb250YWluZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNjcm9sbGVkO1xuICAgIHNjcm9sbGVkID0gJChcImJvZHksIGh0bWxcIikuZmlsdGVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICQodGhpcykuc2Nyb2xsTGVmdCgpID4gMDtcbiAgICB9KTtcbiAgICBpZiAoc2Nyb2xsZWQubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gc2Nyb2xsZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICQoXCJib2R5LCBodG1sXCIpLnNjcm9sbExlZnQoMTIpLmZpbHRlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJCh0aGlzKS5zY3JvbGxMZWZ0KCkgPiAwO1xuICAgICAgICB9KS5zY3JvbGxUb3AoMCk7XG4gICAgfVxufTtcblxuc2Nyb2xsVG8gPSBmdW5jdGlvbiAoJHBhZ2UpIHtcbiAgICB2YXIgYm9keVdpZHRoLCBjb250ZW50V2lkdGgsIG1heFgsIG1pblgsIHRhcmdldCwgd2lkdGg7XG4gICAgaWYgKCRwYWdlLnBvc2l0aW9uKCkgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChhY3RpdmUuc2Nyb2xsQ29udGFpbmVyID09IG51bGwpIHtcbiAgICAgICAgYWN0aXZlLnNjcm9sbENvbnRhaW5lciA9IGZpbmRTY3JvbGxDb250YWluZXIoKTtcbiAgICB9XG4gICAgYm9keVdpZHRoID0gJChcImJvZHlcIikud2lkdGgoKTtcbiAgICBtaW5YID0gYWN0aXZlLnNjcm9sbENvbnRhaW5lci5zY3JvbGxMZWZ0KCk7XG4gICAgbWF4WCA9IG1pblggKyBib2R5V2lkdGg7XG4gICAgdGFyZ2V0ID0gJHBhZ2UucG9zaXRpb24oKS5sZWZ0O1xuICAgIHdpZHRoID0gJHBhZ2Uub3V0ZXJXaWR0aCh0cnVlKTtcbiAgICBjb250ZW50V2lkdGggPSAkKFwiLnBhZ2VcIikub3V0ZXJXaWR0aCh0cnVlKSAqICQoXCIucGFnZVwiKS5zaXplKCk7XG4gICAgaWYgKHRhcmdldCA8IG1pblgpIHtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZS5zY3JvbGxDb250YWluZXIuYW5pbWF0ZSh7XG4gICAgICAgICAgICBzY3JvbGxMZWZ0OiB0YXJnZXRcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh0YXJnZXQgKyB3aWR0aCA+IG1heFgpIHtcbiAgICAgICAgcmV0dXJuIGFjdGl2ZS5zY3JvbGxDb250YWluZXIuYW5pbWF0ZSh7XG4gICAgICAgICAgICBzY3JvbGxMZWZ0OiB0YXJnZXQgLSAoYm9keVdpZHRoIC0gd2lkdGgpXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAobWF4WCA+ICQoXCIucGFnZXNcIikub3V0ZXJXaWR0aCgpKSB7XG4gICAgICAgIHJldHVybiBhY3RpdmUuc2Nyb2xsQ29udGFpbmVyLmFuaW1hdGUoe1xuICAgICAgICAgICAgc2Nyb2xsTGVmdDogTWF0aC5taW4odGFyZ2V0LCBjb250ZW50V2lkdGggLSBib2R5V2lkdGgpXG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbmFjdGl2ZS5zZXQgPSBmdW5jdGlvbiAoJHBhZ2UpIHtcbiAgICAkcGFnZSA9ICQoJHBhZ2UpO1xuICAgICQoXCIuYWN0aXZlXCIpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xuICAgIHJldHVybiBzY3JvbGxUbygkcGFnZS5hZGRDbGFzcyhcImFjdGl2ZVwiKSk7XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGFjdGlvblN5bWJvbHMsIHV0aWw7XG5cbnV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuYWN0aW9uU3ltYm9scyA9IHJlcXVpcmUoJy4vYWN0aW9uU3ltYm9scycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCRqb3VybmFsLCBhY3Rpb24pIHtcbiAgdmFyICRhY3Rpb24sICRwYWdlLCBjb250cm9scywgdGl0bGU7XG4gICRwYWdlID0gJGpvdXJuYWwucGFyZW50cygnLnBhZ2U6Zmlyc3QnKTtcbiAgdGl0bGUgPSBhY3Rpb24udHlwZSB8fCAnc2VwYXJhdG9yJztcbiAgaWYgKGFjdGlvbi5kYXRlICE9IG51bGwpIHtcbiAgICB0aXRsZSArPSBcIiBcIiArICh1dGlsLmZvcm1hdEVsYXBzZWRUaW1lKGFjdGlvbi5kYXRlKSk7XG4gIH1cbiAgJGFjdGlvbiA9ICQoXCI8YSBocmVmPVxcXCIjXFxcIiAvPiBcIikuYWRkQ2xhc3MoXCJhY3Rpb25cIikuYWRkQ2xhc3MoYWN0aW9uLnR5cGUgfHwgJ3NlcGFyYXRvcicpLnRleHQoYWN0aW9uLnN5bWJvbCB8fCBhY3Rpb25TeW1ib2xzLnN5bWJvbHNbYWN0aW9uLnR5cGVdKS5hdHRyKCd0aXRsZScsIHRpdGxlKS5hdHRyKCdkYXRhLWlkJywgYWN0aW9uLmlkIHx8IFwiMFwiKS5kYXRhKCdhY3Rpb24nLCBhY3Rpb24pO1xuICBjb250cm9scyA9ICRqb3VybmFsLmNoaWxkcmVuKCcuY29udHJvbC1idXR0b25zJyk7XG4gIGlmIChjb250cm9scy5sZW5ndGggPiAwKSB7XG4gICAgJGFjdGlvbi5pbnNlcnRCZWZvcmUoY29udHJvbHMpO1xuICB9IGVsc2Uge1xuICAgICRhY3Rpb24uYXBwZW5kVG8oJGpvdXJuYWwpO1xuICB9XG4gIGlmIChhY3Rpb24udHlwZSA9PT0gJ2ZvcmsnICYmIChhY3Rpb24uc2l0ZSAhPSBudWxsKSkge1xuICAgIHJldHVybiAkYWN0aW9uLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgXCJ1cmwoLy9cIiArIGFjdGlvbi5zaXRlICsgXCIvZmF2aWNvbi5wbmcpXCIpLmF0dHIoXCJocmVmXCIsIFwiLy9cIiArIGFjdGlvbi5zaXRlICsgXCIvXCIgKyAoJHBhZ2UuYXR0cignaWQnKSkgKyBcIi5odG1sXCIpLmF0dHIoXCJ0YXJnZXRcIiwgXCJcIiArIGFjdGlvbi5zaXRlKS5kYXRhKFwic2l0ZVwiLCBhY3Rpb24uc2l0ZSkuZGF0YShcInNsdWdcIiwgJHBhZ2UuYXR0cignaWQnKSk7XG4gIH1cbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgbGluaywgbmVpZ2hib3Job29kLCBuZWlnaGJvcnMsIHNlYXJjaGJveCwgc3RhdGU7XG5cbm5laWdoYm9yaG9vZCA9IHJlcXVpcmUoJy4vbmVpZ2hib3Job29kJyk7XG5cbm5laWdoYm9ycyA9IHJlcXVpcmUoJy4vbmVpZ2hib3JzJyk7XG5cbnNlYXJjaGJveCA9IHJlcXVpcmUoJy4vc2VhcmNoYm94Jyk7XG5cbnN0YXRlID0gcmVxdWlyZSgnLi9zdGF0ZScpO1xuXG5saW5rID0gcmVxdWlyZSgnLi9saW5rJyk7XG5cbiQoZnVuY3Rpb24oKSB7XG4gIHNlYXJjaGJveC5pbmplY3QobmVpZ2hib3Job29kKTtcbiAgc2VhcmNoYm94LmJpbmQoKTtcbiAgbmVpZ2hib3JzLmluamVjdChuZWlnaGJvcmhvb2QpO1xuICBuZWlnaGJvcnMuYmluZCgpO1xuICBpZiAod2luZG93LnNlZWROZWlnaGJvcnMpIHtcbiAgICBzZWVkTmVpZ2hib3JzLnNwbGl0KCcsJykuZm9yRWFjaChmdW5jdGlvbihzaXRlKSB7XG4gICAgICByZXR1cm4gbmVpZ2hib3Job29kLnJlZ2lzdGVyTmVpZ2hib3Ioc2l0ZS50cmltKCkpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBzdGF0ZS5pbmplY3QobGluayk7XG59KTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciAkZGlhbG9nLCBlbWl0LCBvcGVuLCByZXNvbHZlO1xuXG5yZXNvbHZlID0gcmVxdWlyZSgnLi9yZXNvbHZlJyk7XG5cbiRkaWFsb2cgPSBudWxsO1xuXG5lbWl0ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkZGlhbG9nID0gJCgnPGRpdj48L2Rpdj4nKS5odG1sKCdUaGlzIGRpYWxvZyB3aWxsIHNob3cgZXZlcnkgdGltZSEnKS5kaWFsb2coe1xuICAgIGF1dG9PcGVuOiBmYWxzZSxcbiAgICB0aXRsZTogJ0Jhc2ljIERpYWxvZycsXG4gICAgaGVpZ2h0OiA2MDAsXG4gICAgd2lkdGg6IDgwMFxuICB9KTtcbn07XG5cbm9wZW4gPSBmdW5jdGlvbih0aXRsZSwgaHRtbCkge1xuICAkZGlhbG9nLmh0bWwoaHRtbCk7XG4gICRkaWFsb2cuZGlhbG9nKFwib3B0aW9uXCIsIFwidGl0bGVcIiwgcmVzb2x2ZS5yZXNvbHZlTGlua3ModGl0bGUpKTtcbiAgcmV0dXJuICRkaWFsb2cuZGlhbG9nKCdvcGVuJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZW1pdDogZW1pdCxcbiAgb3Blbjogb3BlblxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBkaXNwYXRjaCwgaXNGaWxlLCBpc1BhZ2UsIGlzVXJsLCBpc1ZpZGVvLFxuICBpbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbmlzRmlsZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciBkdDtcbiAgaWYgKChkdCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyKSAhPSBudWxsKSB7XG4gICAgaWYgKGluZGV4T2YuY2FsbChkdC50eXBlcywgJ0ZpbGVzJykgPj0gMCkge1xuICAgICAgcmV0dXJuIGR0LmZpbGVzWzBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbmlzVXJsID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgdmFyIGR0LCB1cmw7XG4gIGlmICgoZHQgPSBldmVudC5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2ZlcikgIT0gbnVsbCkge1xuICAgIGlmICgoZHQudHlwZXMgIT0gbnVsbCkgJiYgKGluZGV4T2YuY2FsbChkdC50eXBlcywgJ3RleHQvdXJpLWxpc3QnKSA+PSAwIHx8IGluZGV4T2YuY2FsbChkdC50eXBlcywgJ3RleHQveC1tb3otdXJsJykgPj0gMCkpIHtcbiAgICAgIHVybCA9IGR0LmdldERhdGEoJ1VSTCcpO1xuICAgICAgaWYgKHVybCAhPSBudWxsID8gdXJsLmxlbmd0aCA6IHZvaWQgMCkge1xuICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbmlzUGFnZSA9IGZ1bmN0aW9uKHVybCkge1xuICB2YXIgZm91bmQsIGlnbm9yZSwgaXRlbSwgb3JpZ2luLCByZWY7XG4gIGlmIChmb3VuZCA9IHVybC5tYXRjaCgvXmh0dHA6XFwvXFwvKFthLXpBLVowLTk6Li1dKykoXFwvKFthLXpBLVowLTk6Li1dKylcXC8oW2EtejAtOS1dKyhfcmV2XFxkKyk/KSkrJC8pKSB7XG4gICAgaXRlbSA9IHt9O1xuICAgIGlnbm9yZSA9IGZvdW5kWzBdLCBvcmlnaW4gPSBmb3VuZFsxXSwgaWdub3JlID0gZm91bmRbMl0sIGl0ZW0uc2l0ZSA9IGZvdW5kWzNdLCBpdGVtLnNsdWcgPSBmb3VuZFs0XSwgaWdub3JlID0gZm91bmRbNV07XG4gICAgaWYgKChyZWYgPSBpdGVtLnNpdGUpID09PSAndmlldycgfHwgcmVmID09PSAnbG9jYWwnIHx8IHJlZiA9PT0gJ29yaWdpbicpIHtcbiAgICAgIGl0ZW0uc2l0ZSA9IG9yaWdpbjtcbiAgICB9XG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5pc1ZpZGVvID0gZnVuY3Rpb24odXJsKSB7XG4gIHZhciBmb3VuZDtcbiAgaWYgKGZvdW5kID0gdXJsLm1hdGNoKC9eaHR0cHM/OlxcL1xcL3d3dy55b3V0dWJlLmNvbVxcL3dhdGNoXFw/dj0oW1xcd1xcLV0rKS4qJC8pKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRleHQ6IFwiWU9VVFVCRSBcIiArIGZvdW5kWzFdXG4gICAgfTtcbiAgfVxuICBpZiAoZm91bmQgPSB1cmwubWF0Y2goL15odHRwcz86XFwvXFwveW91dHUuYmVcXC8oW1xcd1xcLV0rKS4qJC8pKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRleHQ6IFwiWU9VVFVCRSBcIiArIGZvdW5kWzFdXG4gICAgfTtcbiAgfVxuICBpZiAoZm91bmQgPSB1cmwubWF0Y2goL3d3dy55b3V0dWJlLmNvbSUyRndhdGNoJTNGdiUzRChbXFx3XFwtXSspLiokLykpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGV4dDogXCJZT1VUVUJFIFwiICsgZm91bmRbMV1cbiAgICB9O1xuICB9XG4gIGlmIChmb3VuZCA9IHVybC5tYXRjaCgvXmh0dHBzPzpcXC9cXC92aW1lby5jb21cXC8oWzAtOV0rKS4qJC8pKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRleHQ6IFwiVklNRU8gXCIgKyBmb3VuZFsxXVxuICAgIH07XG4gIH1cbiAgaWYgKGZvdW5kID0gdXJsLm1hdGNoKC91cmw9aHR0cHM/JTNBJTJGJTJGdmltZW8uY29tJTJGKFswLTldKykuKiQvKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiBcIlZJTUVPIFwiICsgZm91bmRbMV1cbiAgICB9O1xuICB9XG4gIGlmIChmb3VuZCA9IHVybC5tYXRjaCgvaHR0cHM/OlxcL1xcL2FyY2hpdmUub3JnXFwvZGV0YWlsc1xcLyhbXFx3XFwuXFwtXSspLiokLykpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdGV4dDogXCJBUkNISVZFIFwiICsgZm91bmRbMV1cbiAgICB9O1xuICB9XG4gIGlmIChmb3VuZCA9IHVybC5tYXRjaCgvaHR0cHM/OlxcL1xcL3RlZHh0YWxrcy50ZWQuY29tXFwvdmlkZW9cXC8oW1xcd1xcLV0rKS4qJC8pKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRleHQ6IFwiVEVEWCBcIiArIGZvdW5kWzFdXG4gICAgfTtcbiAgfVxuICBpZiAoZm91bmQgPSB1cmwubWF0Y2goL2h0dHBzPzpcXC9cXC93d3cudGVkLmNvbVxcL3RhbGtzXFwvKFtcXHdcXC5cXC1dKykuKiQvKSkge1xuICAgIHJldHVybiB7XG4gICAgICB0ZXh0OiBcIlRFRCBcIiArIGZvdW5kWzFdXG4gICAgfTtcbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbmRpc3BhdGNoID0gZnVuY3Rpb24oaGFuZGxlcnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGZpbGUsIGhhbmRsZSwgcGFnZSwgcHVudCwgcmVmLCBzdG9wLCB1cmwsIHZpZGVvO1xuICAgIHN0b3AgPSBmdW5jdGlvbihpZ25vcmVkKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgcmV0dXJuIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH07XG4gICAgaWYgKHVybCA9IGlzVXJsKGV2ZW50KSkge1xuICAgICAgaWYgKHBhZ2UgPSBpc1BhZ2UodXJsKSkge1xuICAgICAgICBpZiAoKGhhbmRsZSA9IGhhbmRsZXJzLnBhZ2UpICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gc3RvcChoYW5kbGUocGFnZSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodmlkZW8gPSBpc1ZpZGVvKHVybCkpIHtcbiAgICAgICAgaWYgKChoYW5kbGUgPSBoYW5kbGVycy52aWRlbykgIT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBzdG9wKGhhbmRsZSh2aWRlbykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBwdW50ID0ge1xuICAgICAgICB1cmw6IHVybFxuICAgICAgfTtcbiAgICB9XG4gICAgaWYgKGZpbGUgPSBpc0ZpbGUoZXZlbnQpKSB7XG4gICAgICBpZiAoKGhhbmRsZSA9IGhhbmRsZXJzLmZpbGUpICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHN0b3AoaGFuZGxlKGZpbGUpKTtcbiAgICAgIH1cbiAgICAgIHB1bnQgPSB7XG4gICAgICAgIGZpbGU6IGZpbGVcbiAgICAgIH07XG4gICAgfVxuICAgIGlmICgoaGFuZGxlID0gaGFuZGxlcnMucHVudCkgIT0gbnVsbCkge1xuICAgICAgcHVudCB8fCAocHVudCA9IHtcbiAgICAgICAgZHQ6IGV2ZW50LmRhdGFUcmFuc2ZlcixcbiAgICAgICAgdHlwZXM6IChyZWYgPSBldmVudC5kYXRhVHJhbnNmZXIpICE9IG51bGwgPyByZWYudHlwZXMgOiB2b2lkIDBcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHN0b3AoaGFuZGxlKHB1bnQpKTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZGlzcGF0Y2g6IGRpc3BhdGNoXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGVzY2FwZSwgZ2V0U2VsZWN0aW9uUG9zLCBpdGVteiwgbGluaywgcGFnZUhhbmRsZXIsIHBsdWdpbiwgcmFuZG9tLCBzZXRDYXJldFBvc2l0aW9uLCBzcGF3bkVkaXRvciwgdGV4dEVkaXRvcjtcblxucGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKTtcblxuaXRlbXogPSByZXF1aXJlKCcuL2l0ZW16Jyk7XG5cbnBhZ2VIYW5kbGVyID0gcmVxdWlyZSgnLi9wYWdlSGFuZGxlcicpO1xuXG5saW5rID0gcmVxdWlyZSgnLi9saW5rJyk7XG5cbnJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyk7XG5cbmVzY2FwZSA9IGZ1bmN0aW9uIChzdHJpbmcpIHtcbiAgICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn07XG5cbnRleHRFZGl0b3IgPSBmdW5jdGlvbiAoJGl0ZW0sIGl0ZW0sIG9wdGlvbikge1xuICAgIHZhciAkdGV4dGFyZWEsIGZvY3Vzb3V0SGFuZGxlciwga2V5ZG93bkhhbmRsZXIsIG9yaWdpbmFsLCByZWYsIHJlZjE7XG4gICAgaWYgKG9wdGlvbiA9PSBudWxsKSB7XG4gICAgICAgIG9wdGlvbiA9IHt9O1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygndGV4dEVkaXRvcicsIGl0ZW0uaWQsIG9wdGlvbik7XG4gICAga2V5ZG93bkhhbmRsZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgJHBhZ2UsICRwcmV2aW91cywgY2FyZXQsIHBhZ2UsIHByZWZpeCwgcHJldmlvdXMsIHNlbCwgc3VmZml4LCB0ZXh0O1xuICAgICAgICBpZiAoKGUuYWx0S2V5IHx8IGUuY3RsS2V5IHx8IGUubWV0YUtleSkgJiYgZS53aGljaCA9PT0gODMpIHtcbiAgICAgICAgICAgICR0ZXh0YXJlYS5mb2N1c291dCgpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoZS5hbHRLZXkgfHwgZS5jdGxLZXkgfHwgZS5tZXRhS2V5KSAmJiBlLndoaWNoID09PSA3Mykge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9ICQoZS50YXJnZXQpLnBhcmVudHMoJy5wYWdlJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsaW5rLmRvSW50ZXJuYWxMaW5rKFwiYWJvdXQgXCIgKyBpdGVtLnR5cGUgKyBcIiBwbHVnaW5cIiwgcGFnZSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgICAgIHNlbCA9IGdldFNlbGVjdGlvblBvcygkdGV4dGFyZWEpO1xuICAgICAgICAgICAgaWYgKGUud2hpY2ggPT09ICQudWkua2V5Q29kZS5CQUNLU1BBQ0UgJiYgc2VsLnN0YXJ0ID09PSAwICYmIHNlbC5zdGFydCA9PT0gc2VsLmVuZCkge1xuICAgICAgICAgICAgICAgICRwcmV2aW91cyA9ICRpdGVtLnByZXYoKTtcbiAgICAgICAgICAgICAgICBwcmV2aW91cyA9IGl0ZW16LmdldEl0ZW0oJHByZXZpb3VzKTtcbiAgICAgICAgICAgICAgICBpZiAocHJldmlvdXMudHlwZSAhPT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXJldCA9IHByZXZpb3VzW29wdGlvbi5maWVsZCB8fCAndGV4dCddLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBzdWZmaXggPSAkdGV4dGFyZWEudmFsKCk7XG4gICAgICAgICAgICAgICAgJHRleHRhcmVhLnZhbCgnJyk7XG4gICAgICAgICAgICAgICAgdGV4dEVkaXRvcigkcHJldmlvdXMsIHByZXZpb3VzLCB7XG4gICAgICAgICAgICAgICAgICAgIGNhcmV0OiBjYXJldCxcbiAgICAgICAgICAgICAgICAgICAgc3VmZml4OiBzdWZmaXhcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PT0gJC51aS5rZXlDb2RlLkVOVEVSKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkcGFnZSA9ICRpdGVtLnBhcmVudCgpLnBhcmVudCgpO1xuICAgICAgICAgICAgICAgIHRleHQgPSAkdGV4dGFyZWEudmFsKCk7XG4gICAgICAgICAgICAgICAgcHJlZml4ID0gdGV4dC5zdWJzdHJpbmcoMCwgc2VsLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICBzdWZmaXggPSB0ZXh0LnN1YnN0cmluZyhzZWwuZW5kKTtcbiAgICAgICAgICAgICAgICBpZiAocHJlZml4ID09PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAkdGV4dGFyZWEudmFsKHN1ZmZpeCk7XG4gICAgICAgICAgICAgICAgICAgICR0ZXh0YXJlYS5mb2N1c291dCgpO1xuICAgICAgICAgICAgICAgICAgICBzcGF3bkVkaXRvcigkcGFnZSwgJGl0ZW0ucHJldigpLCBwcmVmaXgsIHRydWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICR0ZXh0YXJlYS52YWwocHJlZml4KTtcbiAgICAgICAgICAgICAgICAgICAgJHRleHRhcmVhLmZvY3Vzb3V0KCk7XG4gICAgICAgICAgICAgICAgICAgIHNwYXduRWRpdG9yKCRwYWdlLCAkaXRlbSwgc3VmZml4KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBmb2N1c291dEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciAkcGFnZTtcbiAgICAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ3RleHRFZGl0aW5nJyk7XG4gICAgICAgICR0ZXh0YXJlYS51bmJpbmQoKTtcbiAgICAgICAgJHBhZ2UgPSAkaXRlbS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICAgICAgICBpZiAoaXRlbVtvcHRpb24uZmllbGQgfHwgJ3RleHQnXSA9ICR0ZXh0YXJlYS52YWwoKSkge1xuICAgICAgICAgICAgcGx1Z2luW1wiZG9cIl0oJGl0ZW0uZW1wdHkoKSwgaXRlbSk7XG4gICAgICAgICAgICBpZiAob3B0aW9uLmFmdGVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1bb3B0aW9uLmZpZWxkIHx8ICd0ZXh0J10gPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGFnZUhhbmRsZXIucHV0KCRwYWdlLCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdhZGQnLFxuICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbSxcbiAgICAgICAgICAgICAgICAgICAgYWZ0ZXI6IG9wdGlvbi5hZnRlclxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbVtvcHRpb24uZmllbGQgfHwgJ3RleHQnXSA9PT0gb3JpZ2luYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwYWdlSGFuZGxlci5wdXQoJHBhZ2UsIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2VkaXQnLFxuICAgICAgICAgICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgICAgICAgICAgaXRlbTogaXRlbVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKCFvcHRpb24uYWZ0ZXIpIHtcbiAgICAgICAgICAgICAgICBwYWdlSGFuZGxlci5wdXQoJHBhZ2UsIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3JlbW92ZScsXG4gICAgICAgICAgICAgICAgICAgIGlkOiBpdGVtLmlkXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAkaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9O1xuICAgIGlmICgkaXRlbS5oYXNDbGFzcygndGV4dEVkaXRpbmcnKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgICRpdGVtLmFkZENsYXNzKCd0ZXh0RWRpdGluZycpO1xuICAgICRpdGVtLnVuYmluZCgpO1xuICAgIG9yaWdpbmFsID0gKHJlZiA9IGl0ZW1bb3B0aW9uLmZpZWxkIHx8ICd0ZXh0J10pICE9IG51bGwgPyByZWYgOiAnJztcbiAgICAkdGV4dGFyZWEgPSAkKFwiPHRleHRhcmVhPlwiICsgKGVzY2FwZShvcmlnaW5hbCkpICsgKGVzY2FwZSgocmVmMSA9IG9wdGlvbi5zdWZmaXgpICE9IG51bGwgPyByZWYxIDogJycpKSArIFwiPC90ZXh0YXJlYT5cIikuZm9jdXNvdXQoZm9jdXNvdXRIYW5kbGVyKS5iaW5kKCdrZXlkb3duJywga2V5ZG93bkhhbmRsZXIpO1xuICAgICRpdGVtLmh0bWwoJHRleHRhcmVhKTtcbiAgICBpZiAob3B0aW9uLmNhcmV0KSB7XG4gICAgICAgIHJldHVybiBzZXRDYXJldFBvc2l0aW9uKCR0ZXh0YXJlYSwgb3B0aW9uLmNhcmV0KTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbi5hcHBlbmQpIHtcbiAgICAgICAgc2V0Q2FyZXRQb3NpdGlvbigkdGV4dGFyZWEsICR0ZXh0YXJlYS52YWwoKS5sZW5ndGgpO1xuICAgICAgICByZXR1cm4gJHRleHRhcmVhLnNjcm9sbFRvcCgkdGV4dGFyZWFbMF0uc2Nyb2xsSGVpZ2h0IC0gJHRleHRhcmVhLmhlaWdodCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJHRleHRhcmVhLmZvY3VzKCk7XG4gICAgfVxufTtcblxuc3Bhd25FZGl0b3IgPSBmdW5jdGlvbiAoJHBhZ2UsICRiZWZvcmUsIHRleHQpIHtcbiAgICB2YXIgJGl0ZW0sIGJlZm9yZSwgaXRlbTtcbiAgICBpdGVtID0ge1xuICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgaWQ6IHJhbmRvbS5pdGVtSWQoKSxcbiAgICAgICAgdGV4dDogdGV4dFxuICAgIH07XG4gICAgJGl0ZW0gPSAkKFwiPGRpdiBjbGFzcz1cXFwiaXRlbSBwYXJhZ3JhcGhcXFwiIGRhdGEtaWQ9XCIgKyBpdGVtLmlkICsgXCI+PC9kaXY+XCIpO1xuICAgICRpdGVtLmRhdGEoJ2l0ZW0nLCBpdGVtKS5kYXRhKCdwYWdlRWxlbWVudCcsICRwYWdlKTtcbiAgICAkYmVmb3JlLmFmdGVyKCRpdGVtKTtcbiAgICBwbHVnaW5bXCJkb1wiXSgkaXRlbSwgaXRlbSk7XG4gICAgYmVmb3JlID0gaXRlbXouZ2V0SXRlbSgkYmVmb3JlKTtcbiAgICByZXR1cm4gdGV4dEVkaXRvcigkaXRlbSwgaXRlbSwge1xuICAgICAgICBhZnRlcjogYmVmb3JlICE9IG51bGwgPyBiZWZvcmUuaWQgOiB2b2lkIDBcbiAgICB9KTtcbn07XG5cbmdldFNlbGVjdGlvblBvcyA9IGZ1bmN0aW9uICgkdGV4dGFyZWEpIHtcbiAgICB2YXIgZWwsIGllUG9zLCBzZWw7XG4gICAgZWwgPSAkdGV4dGFyZWEuZ2V0KDApO1xuICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcbiAgICAgICAgZWwuZm9jdXMoKTtcbiAgICAgICAgc2VsID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgIHNlbC5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC1lbC52YWx1ZS5sZW5ndGgpO1xuICAgICAgICBpZVBvcyA9IHNlbC50ZXh0Lmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0OiBpZVBvcyxcbiAgICAgICAgICAgIGVuZDogaWVQb3NcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnQ6IGVsLnNlbGVjdGlvblN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBlbC5zZWxlY3Rpb25FbmRcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5zZXRDYXJldFBvc2l0aW9uID0gZnVuY3Rpb24gKCR0ZXh0YXJlYSwgY2FyZXRQb3MpIHtcbiAgICB2YXIgZWwsIHJhbmdlO1xuICAgIGVsID0gJHRleHRhcmVhLmdldCgwKTtcbiAgICBpZiAoZWwgIT0gbnVsbCkge1xuICAgICAgICBpZiAoZWwuY3JlYXRlVGV4dFJhbmdlKSB7XG4gICAgICAgICAgICByYW5nZSA9IGVsLmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgcmFuZ2UubW92ZShcImNoYXJhY3RlclwiLCBjYXJldFBvcyk7XG4gICAgICAgICAgICByYW5nZS5zZWxlY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsLnNldFNlbGVjdGlvblJhbmdlKGNhcmV0UG9zLCBjYXJldFBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsLmZvY3VzKCk7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdGV4dEVkaXRvcjogdGV4dEVkaXRvclxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhcnJheVRvSnNvbiwgYmluZCwgY3N2VG9BcnJheSwgZHJvcCwgZWRpdG9yLCBlbWl0LCBlc2NhcGUsIG5laWdoYm9yaG9vZCwgcGFnZUhhbmRsZXIsIHBsdWdpbiwgcmVzb2x2ZSwgc3lub3BzaXM7XG5cbm5laWdoYm9yaG9vZCA9IHJlcXVpcmUoJy4vbmVpZ2hib3Job29kJyk7XG5cbnBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJyk7XG5cbnJlc29sdmUgPSByZXF1aXJlKCcuL3Jlc29sdmUnKTtcblxucGFnZUhhbmRsZXIgPSByZXF1aXJlKCcuL3BhZ2VIYW5kbGVyJyk7XG5cbmVkaXRvciA9IHJlcXVpcmUoJy4vZWRpdG9yJyk7XG5cbnN5bm9wc2lzID0gcmVxdWlyZSgnLi9zeW5vcHNpcycpO1xuXG5kcm9wID0gcmVxdWlyZSgnLi9kcm9wJyk7XG5cbmVzY2FwZSA9IGZ1bmN0aW9uIChsaW5lKSB7XG4gICAgcmV0dXJuIGxpbmUucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpLnJlcGxhY2UoL1xcbi9nLCAnPGJyPicpO1xufTtcblxuZW1pdCA9IGZ1bmN0aW9uICgkaXRlbSwgaXRlbSkge1xuICAgIHZhciBzaG93TWVudSwgc2hvd1Byb21wdDtcbiAgICAkaXRlbS5hcHBlbmQoJzxwPkRvdWJsZS1DbGljayB0byBFZGl0PGJyPkRyb3AgVGV4dCBvciBJbWFnZSB0byBJbnNlcnQ8L3A+Jyk7XG4gICAgc2hvd01lbnUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjb2x1bW4sIGksIGluZm8sIGxlbiwgbWVudSwgcmVmO1xuICAgICAgICBtZW51ID0gJGl0ZW0uZmluZCgncCcpLmFwcGVuZChcIjxicj5PciBDaG9vc2UgYSBQbHVnaW5cXG48Y2VudGVyPlxcbjx0YWJsZSBzdHlsZT1cXFwidGV4dC1hbGlnbjpsZWZ0O1xcXCI+XFxuPHRyPjx0ZD48dWwgaWQ9Zm9ybWF0Pjx0ZD48dWwgaWQ9ZGF0YT48dGQ+PHVsIGlkPW90aGVyPlwiKTtcbiAgICAgICAgcmVmID0gd2luZG93LmNhdGFsb2c7XG4gICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaW5mbyA9IHJlZltpXTtcbiAgICAgICAgICAgIGNvbHVtbiA9IGluZm8uY2F0ZWdvcnkgfHwgJ290aGVyJztcbiAgICAgICAgICAgIGlmIChjb2x1bW4gIT09ICdmb3JtYXQnICYmIGNvbHVtbiAhPT0gJ2RhdGEnKSB7XG4gICAgICAgICAgICAgICAgY29sdW1uID0gJ290aGVyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1lbnUuZmluZCgnIycgKyBjb2x1bW4pLmFwcGVuZChcIjxsaT48YSBjbGFzcz1cXFwibWVudVxcXCIgaHJlZj1cXFwiI1xcXCIgdGl0bGU9XFxcIlwiICsgaW5mby50aXRsZSArIFwiXFxcIj5cIiArIGluZm8ubmFtZSArIFwiPC9hPjwvbGk+XCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZW51LmZpbmQoJ2EubWVudScpLmNsaWNrKGZ1bmN0aW9uIChldnQpIHtcbiAgICAgICAgICAgICRpdGVtLnJlbW92ZUNsYXNzKCdmYWN0b3J5JykuYWRkQ2xhc3MoaXRlbS50eXBlID0gZXZ0LnRhcmdldC50ZXh0LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICAgICAgJGl0ZW0udW5iaW5kKCk7XG4gICAgICAgICAgICByZXR1cm4gZWRpdG9yLnRleHRFZGl0b3IoJGl0ZW0sIGl0ZW0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHNob3dQcm9tcHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkaXRlbS5hcHBlbmQoXCI8cD5cIiArIChyZXNvbHZlLnJlc29sdmVMaW5rcyhpdGVtLnByb21wdCwgZXNjYXBlKSkgKyBcIjwvYj5cIik7XG4gICAgfTtcbiAgICBpZiAoaXRlbS5wcm9tcHQpIHtcbiAgICAgICAgcmV0dXJuIHNob3dQcm9tcHQoKTtcbiAgICB9IGVsc2UgaWYgKHdpbmRvdy5jYXRhbG9nICE9IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHNob3dNZW51KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuICQuZ2V0SlNPTignL3N5c3RlbS9mYWN0b3JpZXMuanNvbicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB3aW5kb3cuY2F0YWxvZyA9IGRhdGE7XG4gICAgICAgICAgICByZXR1cm4gc2hvd01lbnUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuYmluZCA9IGZ1bmN0aW9uICgkaXRlbSwgaXRlbSkge1xuICAgIHZhciBhZGRSZWZlcmVuY2UsIGFkZFZpZGVvLCBwdW50LCByZWFkRmlsZSwgc3luY0VkaXRBY3Rpb247XG4gICAgc3luY0VkaXRBY3Rpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciAkcGFnZSwgZXJyO1xuICAgICAgICAkaXRlbS5lbXB0eSgpLnVuYmluZCgpO1xuICAgICAgICAkaXRlbS5yZW1vdmVDbGFzcyhcImZhY3RvcnlcIikuYWRkQ2xhc3MoaXRlbS50eXBlKTtcbiAgICAgICAgJHBhZ2UgPSAkaXRlbS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgJGl0ZW0uZGF0YSgncGFnZUVsZW1lbnQnLCAkcGFnZSk7XG4gICAgICAgICAgICAkaXRlbS5kYXRhKCdpdGVtJywgaXRlbSk7XG4gICAgICAgICAgICBwbHVnaW4uZ2V0UGx1Z2luKGl0ZW0udHlwZSwgZnVuY3Rpb24gKHBsdWdpbikge1xuICAgICAgICAgICAgICAgIHBsdWdpbi5lbWl0KCRpdGVtLCBpdGVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGx1Z2luLmJpbmQoJGl0ZW0sIGl0ZW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICAgICAgZXJyID0gX2Vycm9yO1xuICAgICAgICAgICAgJGl0ZW0uYXBwZW5kKFwiPHAgY2xhc3M9J2Vycm9yJz5cIiArIGVyciArIFwiPC9wPlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFnZUhhbmRsZXIucHV0KCRwYWdlLCB7XG4gICAgICAgICAgICB0eXBlOiAnZWRpdCcsXG4gICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgIGl0ZW06IGl0ZW1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBwdW50ID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgaXRlbS5wcm9tcHQgPSBcIlVuZXhwZWN0ZWQgSXRlbVxcbldlIGNhbid0IG1ha2Ugc2Vuc2Ugb2YgdGhlIGRyb3AuXFxuVHJ5IHNvbWV0aGluZyBlbHNlIG9yIHNlZSBbW0Fib3V0IEZhY3RvcnkgUGx1Z2luXV0uXCI7XG4gICAgICAgIGRhdGEudXNlckFnZW50ID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICAgICAgaXRlbS5wdW50ID0gZGF0YTtcbiAgICAgICAgcmV0dXJuIHN5bmNFZGl0QWN0aW9uKCk7XG4gICAgfTtcbiAgICBhZGRSZWZlcmVuY2UgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gJC5nZXRKU09OKFwiaHR0cDovL1wiICsgZGF0YS5zaXRlICsgXCIvXCIgKyBkYXRhLnNsdWcgKyBcIi5qc29uXCIsIGZ1bmN0aW9uIChyZW1vdGUpIHtcbiAgICAgICAgICAgIGl0ZW0udHlwZSA9ICdyZWZlcmVuY2UnO1xuICAgICAgICAgICAgaXRlbS5zaXRlID0gZGF0YS5zaXRlO1xuICAgICAgICAgICAgaXRlbS5zbHVnID0gZGF0YS5zbHVnO1xuICAgICAgICAgICAgaXRlbS50aXRsZSA9IHJlbW90ZS50aXRsZSB8fCBkYXRhLnNsdWc7XG4gICAgICAgICAgICBpdGVtLnRleHQgPSBzeW5vcHNpcyhyZW1vdGUpO1xuICAgICAgICAgICAgc3luY0VkaXRBY3Rpb24oKTtcbiAgICAgICAgICAgIGlmIChpdGVtLnNpdGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZWlnaGJvcmhvb2QucmVnaXN0ZXJOZWlnaGJvcihpdGVtLnNpdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGFkZFZpZGVvID0gZnVuY3Rpb24gKHZpZGVvKSB7XG4gICAgICAgIGl0ZW0udHlwZSA9ICd2aWRlbyc7XG4gICAgICAgIGl0ZW0udGV4dCA9IHZpZGVvLnRleHQgKyBcIlxcbihkb3VibGUtY2xpY2sgdG8gZWRpdCBjYXB0aW9uKVxcblwiO1xuICAgICAgICByZXR1cm4gc3luY0VkaXRBY3Rpb24oKTtcbiAgICB9O1xuICAgIHJlYWRGaWxlID0gZnVuY3Rpb24gKGZpbGUpIHtcbiAgICAgICAgdmFyIG1ham9yVHlwZSwgbWlub3JUeXBlLCByZWFkZXIsIHJlZjtcbiAgICAgICAgaWYgKGZpbGUgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmVmID0gZmlsZS50eXBlLnNwbGl0KFwiL1wiKSwgbWFqb3JUeXBlID0gcmVmWzBdLCBtaW5vclR5cGUgPSByZWZbMV07XG4gICAgICAgICAgICByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgaWYgKG1ham9yVHlwZSA9PT0gXCJpbWFnZVwiKSB7XG4gICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChsb2FkRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50eXBlID0gJ2ltYWdlJztcbiAgICAgICAgICAgICAgICAgICAgaXRlbS51cmwgPSBsb2FkRXZlbnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jYXB0aW9uIHx8IChpdGVtLmNhcHRpb24gPSBcIlVwbG9hZGVkIGltYWdlXCIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3luY0VkaXRBY3Rpb24oKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHJldHVybiByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWFqb3JUeXBlID09PSBcInRleHRcIikge1xuICAgICAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAobG9hZEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcnJheSwgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBsb2FkRXZlbnQudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1pbm9yVHlwZSA9PT0gJ2NzdicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0udHlwZSA9ICdkYXRhJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uY29sdW1ucyA9IChhcnJheSA9IGNzdlRvQXJyYXkocmVzdWx0KSlbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBhcnJheVRvSnNvbihhcnJheSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRleHQgPSBmaWxlLmZpbGVOYW1lO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS50eXBlID0gJ3BhcmFncmFwaCc7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLnRleHQgPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN5bmNFZGl0QWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVhZGVyLnJlYWRBc1RleHQoZmlsZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBwdW50KHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZTogZmlsZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAkaXRlbS5kYmxjbGljayhmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgcmV0dXJuIGVkaXRvci50ZXh0RWRpdG9yKCRpdGVtLCBpdGVtLCB7XG4gICAgICAgICAgICAgICAgZmllbGQ6ICdwcm9tcHQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRpdGVtLnJlbW92ZUNsYXNzKCdmYWN0b3J5JykuYWRkQ2xhc3MoaXRlbS50eXBlID0gJ3BhcmFncmFwaCcpO1xuICAgICAgICAgICAgJGl0ZW0udW5iaW5kKCk7XG4gICAgICAgICAgICByZXR1cm4gZWRpdG9yLnRleHRFZGl0b3IoJGl0ZW0sIGl0ZW0pO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgJGl0ZW0uYmluZCgnZHJhZ2VudGVyJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICByZXR1cm4gZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG4gICAgJGl0ZW0uYmluZCgnZHJhZ292ZXInLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gJGl0ZW0uYmluZChcImRyb3BcIiwgZHJvcC5kaXNwYXRjaCh7XG4gICAgICAgIHBhZ2U6IGFkZFJlZmVyZW5jZSxcbiAgICAgICAgZmlsZTogcmVhZEZpbGUsXG4gICAgICAgIHZpZGVvOiBhZGRWaWRlbyxcbiAgICAgICAgcHVudDogcHVudFxuICAgIH0pKTtcbn07XG5cbmNzdlRvQXJyYXkgPSBmdW5jdGlvbiAoc3RyRGF0YSwgc3RyRGVsaW1pdGVyKSB7XG4gICAgdmFyIGFyckRhdGEsIGFyck1hdGNoZXMsIG9ialBhdHRlcm4sIHN0ck1hdGNoZWREZWxpbWl0ZXIsIHN0ck1hdGNoZWRWYWx1ZTtcbiAgICBzdHJEZWxpbWl0ZXIgPSBzdHJEZWxpbWl0ZXIgfHwgXCIsXCI7XG4gICAgb2JqUGF0dGVybiA9IG5ldyBSZWdFeHAoXCIoXFxcXFwiICsgc3RyRGVsaW1pdGVyICsgXCJ8XFxcXHI/XFxcXG58XFxcXHJ8XilcIiArIFwiKD86XFxcIihbXlxcXCJdKig/OlxcXCJcXFwiW15cXFwiXSopKilcXFwifFwiICsgXCIoW15cXFwiXFxcXFwiICsgc3RyRGVsaW1pdGVyICsgXCJcXFxcclxcXFxuXSopKVwiLCBcImdpXCIpO1xuICAgIGFyckRhdGEgPSBbW11dO1xuICAgIGFyck1hdGNoZXMgPSBudWxsO1xuICAgIHdoaWxlIChhcnJNYXRjaGVzID0gb2JqUGF0dGVybi5leGVjKHN0ckRhdGEpKSB7XG4gICAgICAgIHN0ck1hdGNoZWREZWxpbWl0ZXIgPSBhcnJNYXRjaGVzWzFdO1xuICAgICAgICBpZiAoc3RyTWF0Y2hlZERlbGltaXRlci5sZW5ndGggJiYgKHN0ck1hdGNoZWREZWxpbWl0ZXIgIT09IHN0ckRlbGltaXRlcikpIHtcbiAgICAgICAgICAgIGFyckRhdGEucHVzaChbXSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyck1hdGNoZXNbMl0pIHtcbiAgICAgICAgICAgIHN0ck1hdGNoZWRWYWx1ZSA9IGFyck1hdGNoZXNbMl0ucmVwbGFjZShuZXcgUmVnRXhwKFwiXFxcIlxcXCJcIiwgXCJnXCIpLCBcIlxcXCJcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHJNYXRjaGVkVmFsdWUgPSBhcnJNYXRjaGVzWzNdO1xuICAgICAgICB9XG4gICAgICAgIGFyckRhdGFbYXJyRGF0YS5sZW5ndGggLSAxXS5wdXNoKHN0ck1hdGNoZWRWYWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJEYXRhO1xufTtcblxuYXJyYXlUb0pzb24gPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICB2YXIgY29scywgaSwgbGVuLCByZXN1bHRzLCByb3csIHJvd1RvT2JqZWN0O1xuICAgIGNvbHMgPSBhcnJheS5zaGlmdCgpO1xuICAgIHJvd1RvT2JqZWN0ID0gZnVuY3Rpb24gKHJvdykge1xuICAgICAgICB2YXIgaSwgaywgbGVuLCBvYmosIHJlZiwgcmVmMSwgdjtcbiAgICAgICAgb2JqID0ge307XG4gICAgICAgIHJlZiA9IF8uemlwKGNvbHMsIHJvdyk7XG4gICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgcmVmMSA9IHJlZltpXSwgayA9IHJlZjFbMF0sIHYgPSByZWYxWzFdO1xuICAgICAgICAgICAgaWYgKCh2ICE9IG51bGwpICYmICh2Lm1hdGNoKC9cXFMvKSkgJiYgdiAhPT0gJ05VTEwnKSB7XG4gICAgICAgICAgICAgICAgb2JqW2tdID0gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoaSA9IDAsIGxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHJvdyA9IGFycmF5W2ldO1xuICAgICAgICByZXN1bHRzLnB1c2gocm93VG9PYmplY3Qocm93KSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZW1pdDogZW1pdCxcbiAgICBiaW5kOiBiaW5kXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGJpbmQsIGVtaXQsIG5laWdoYm9yaG9vZCwgcmVzb2x2ZTtcblxucmVzb2x2ZSA9IHJlcXVpcmUoJy4vcmVzb2x2ZScpO1xuXG5uZWlnaGJvcmhvb2QgPSByZXF1aXJlKCcuL25laWdoYm9yaG9vZCcpO1xuXG5lbWl0ID0gZnVuY3Rpb24oJGl0ZW0sIGl0ZW0pIHtcbiAgdmFyIGksIGluZm8sIGxlbiwgcmVmLCByZXN1bHRzO1xuICAkaXRlbS5hcHBlbmQoaXRlbS50ZXh0ICsgXCI8YnI+PGJyPjxidXR0b24gY2xhc3M9XFxcImNyZWF0ZVxcXCI+Y3JlYXRlPC9idXR0b24+IG5ldyBibGFuayBwYWdlXCIpO1xuICBpZiAoKChpbmZvID0gbmVpZ2hib3Job29kLnNpdGVzW2xvY2F0aW9uLmhvc3RdKSAhPSBudWxsKSAmJiAoaW5mby5zaXRlbWFwICE9IG51bGwpKSB7XG4gICAgcmVmID0gaW5mby5zaXRlbWFwO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGl0ZW0gPSByZWZbaV07XG4gICAgICBpZiAoaXRlbS5zbHVnLm1hdGNoKC8tdGVtcGxhdGUkLykpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKCRpdGVtLmFwcGVuZChcIjxicj48YnV0dG9uIGNsYXNzPVxcXCJjcmVhdGVcXFwiIGRhdGEtc2x1Zz1cIiArIGl0ZW0uc2x1ZyArIFwiPmNyZWF0ZTwvYnV0dG9uPiBmcm9tIFwiICsgKHJlc29sdmUucmVzb2x2ZUxpbmtzKFwiW1tcIiArIGl0ZW0udGl0bGUgKyBcIl1dXCIpKSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKHZvaWQgMCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59O1xuXG5iaW5kID0gZnVuY3Rpb24oJGl0ZW0sIGl0ZW0pIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZW1pdDogZW1pdCxcbiAgYmluZDogYmluZFxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBiaW5kLCBkaWFsb2csIGVkaXRvciwgZW1pdCwgcmVzb2x2ZTtcblxuZGlhbG9nID0gcmVxdWlyZSgnLi9kaWFsb2cnKTtcblxuZWRpdG9yID0gcmVxdWlyZSgnLi9lZGl0b3InKTtcblxucmVzb2x2ZSA9IHJlcXVpcmUoJy4vcmVzb2x2ZScpO1xuXG5lbWl0ID0gZnVuY3Rpb24oJGl0ZW0sIGl0ZW0pIHtcbiAgaXRlbS50ZXh0IHx8IChpdGVtLnRleHQgPSBpdGVtLmNhcHRpb24pO1xuICByZXR1cm4gJGl0ZW0uYXBwZW5kKFwiPGltZyBjbGFzcz10aHVtYm5haWwgc3JjPVxcXCJcIiArIGl0ZW0udXJsICsgXCJcXFwiPiA8cD5cIiArIChyZXNvbHZlLnJlc29sdmVMaW5rcyhpdGVtLnRleHQpKSArIFwiPC9wPlwiKTtcbn07XG5cbmJpbmQgPSBmdW5jdGlvbigkaXRlbSwgaXRlbSkge1xuICAkaXRlbS5kYmxjbGljayhmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZWRpdG9yLnRleHRFZGl0b3IoJGl0ZW0sIGl0ZW0pO1xuICB9KTtcbiAgcmV0dXJuICRpdGVtLmZpbmQoJ2ltZycpLmRibGNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkaWFsb2cub3BlbihpdGVtLnRleHQsIHRoaXMpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBlbWl0OiBlbWl0LFxuICBiaW5kOiBiaW5kXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGNyZWF0ZUl0ZW0sIGdldEl0ZW0sIHBhZ2VIYW5kbGVyLCBwbHVnaW4sIHJhbmRvbSwgcmVtb3ZlSXRlbSwgcmVwbGFjZUl0ZW0sIHNsZWVwO1xuXG5wYWdlSGFuZGxlciA9IHJlcXVpcmUoJy4vcGFnZUhhbmRsZXInKTtcblxucGx1Z2luID0gcmVxdWlyZSgnLi9wbHVnaW4nKTtcblxucmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKTtcblxuc2xlZXAgPSBmdW5jdGlvbih0aW1lLCBkb25lKSB7XG4gIHJldHVybiBzZXRUaW1lb3V0KGRvbmUsIHRpbWUpO1xufTtcblxuZ2V0SXRlbSA9IGZ1bmN0aW9uKCRpdGVtKSB7XG4gIGlmICgkKCRpdGVtKS5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuICQoJGl0ZW0pLmRhdGEoXCJpdGVtXCIpIHx8ICQoJGl0ZW0pLmRhdGEoJ3N0YXRpY0l0ZW0nKTtcbiAgfVxufTtcblxucmVtb3ZlSXRlbSA9IGZ1bmN0aW9uKCRpdGVtLCBpdGVtKSB7XG4gIHBhZ2VIYW5kbGVyLnB1dCgkaXRlbS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpLCB7XG4gICAgdHlwZTogJ3JlbW92ZScsXG4gICAgaWQ6IGl0ZW0uaWRcbiAgfSk7XG4gIHJldHVybiAkaXRlbS5yZW1vdmUoKTtcbn07XG5cbmNyZWF0ZUl0ZW0gPSBmdW5jdGlvbigkcGFnZSwgJGJlZm9yZSwgaXRlbSkge1xuICB2YXIgJGl0ZW0sIGJlZm9yZTtcbiAgaWYgKCRwYWdlID09IG51bGwpIHtcbiAgICAkcGFnZSA9ICRiZWZvcmUucGFyZW50cygnLnBhZ2UnKTtcbiAgfVxuICBpdGVtLmlkID0gcmFuZG9tLml0ZW1JZCgpO1xuICAkaXRlbSA9ICQoXCI8ZGl2IGNsYXNzPVxcXCJpdGVtIFwiICsgaXRlbS50eXBlICsgXCJcXFwiIGRhdGEtaWQ9XFxcIlwiICsgXCJcXFwiPC9kaXY+XCIpO1xuICAkaXRlbS5kYXRhKCdpdGVtJywgaXRlbSkuZGF0YSgncGFnZUVsZW1lbnQnLCAkcGFnZSk7XG4gIGlmICgkYmVmb3JlICE9IG51bGwpIHtcbiAgICAkYmVmb3JlLmFmdGVyKCRpdGVtKTtcbiAgfSBlbHNlIHtcbiAgICAkcGFnZS5maW5kKCcuc3RvcnknKS5hcHBlbmQoJGl0ZW0pO1xuICB9XG4gIHBsdWdpbltcImRvXCJdKCRpdGVtLCBpdGVtKTtcbiAgYmVmb3JlID0gZ2V0SXRlbSgkYmVmb3JlKTtcbiAgc2xlZXAoNTAwLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcGFnZUhhbmRsZXIucHV0KCRwYWdlLCB7XG4gICAgICBpdGVtOiBpdGVtLFxuICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICB0eXBlOiAnYWRkJyxcbiAgICAgIGFmdGVyOiBiZWZvcmUgIT0gbnVsbCA/IGJlZm9yZS5pZCA6IHZvaWQgMFxuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuICRpdGVtO1xufTtcblxucmVwbGFjZUl0ZW0gPSBmdW5jdGlvbigkaXRlbSwgdHlwZSwgaXRlbSkge1xuICB2YXIgJHBhZ2UsIGVyciwgbmV3SXRlbTtcbiAgbmV3SXRlbSA9ICQuZXh0ZW5kKHt9LCBpdGVtKTtcbiAgJGl0ZW0uZW1wdHkoKS51bmJpbmQoKTtcbiAgJGl0ZW0ucmVtb3ZlQ2xhc3ModHlwZSkuYWRkQ2xhc3MobmV3SXRlbS50eXBlKTtcbiAgJHBhZ2UgPSAkaXRlbS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICB0cnkge1xuICAgICRpdGVtLmRhdGEoJ3BhZ2VFbGVtZW50JywgJHBhZ2UpO1xuICAgICRpdGVtLmRhdGEoJ2l0ZW0nLCBuZXdJdGVtKTtcbiAgICBwbHVnaW4uZ2V0UGx1Z2luKGl0ZW0udHlwZSwgZnVuY3Rpb24ocGx1Z2luKSB7XG4gICAgICBwbHVnaW4uZW1pdCgkaXRlbSwgbmV3SXRlbSk7XG4gICAgICByZXR1cm4gcGx1Z2luLmJpbmQoJGl0ZW0sIG5ld0l0ZW0pO1xuICAgIH0pO1xuICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICBlcnIgPSBfZXJyb3I7XG4gICAgJGl0ZW0uYXBwZW5kKFwiPHAgY2xhc3M9J2Vycm9yJz5cIiArIGVyciArIFwiPC9wPlwiKTtcbiAgfVxuICByZXR1cm4gcGFnZUhhbmRsZXIucHV0KCRwYWdlLCB7XG4gICAgdHlwZTogJ2VkaXQnLFxuICAgIGlkOiBuZXdJdGVtLmlkLFxuICAgIGl0ZW06IG5ld0l0ZW1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlSXRlbTogY3JlYXRlSXRlbSxcbiAgcmVtb3ZlSXRlbTogcmVtb3ZlSXRlbSxcbiAgZ2V0SXRlbTogZ2V0SXRlbSxcbiAgcmVwbGFjZUl0ZW06IHJlcGxhY2VJdGVtXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGFjdGl2ZSwgYXNTbHVnLCBkaWFsb2csIGRyb3AsIGxpbmV1cCwgbGluaywgcGFnZUhhbmRsZXIsIHJlZnJlc2gsIHN0YXRlLCB0YXJnZXQ7XG5cbnBhZ2VIYW5kbGVyID0gcmVxdWlyZSgnLi9wYWdlSGFuZGxlcicpO1xuXG5zdGF0ZSA9IHJlcXVpcmUoJy4vc3RhdGUnKTtcblxuYWN0aXZlID0gcmVxdWlyZSgnLi9hY3RpdmUnKTtcblxucmVmcmVzaCA9IHJlcXVpcmUoJy4vcmVmcmVzaCcpO1xuXG5saW5ldXAgPSByZXF1aXJlKCcuL2xpbmV1cCcpO1xuXG5kcm9wID0gcmVxdWlyZSgnLi9kcm9wJyk7XG5cbmRpYWxvZyA9IHJlcXVpcmUoJy4vZGlhbG9nJyk7XG5cbmxpbmsgPSByZXF1aXJlKCcuL2xpbmsnKTtcblxudGFyZ2V0ID0gcmVxdWlyZSgnLi90YXJnZXQnKTtcblxuYXNTbHVnID0gcmVxdWlyZSgnLi9wYWdlJykuYXNTbHVnO1xuXG4kKGZ1bmN0aW9uKCkge1xuICB2YXIgTEVGVEFSUk9XLCBSSUdIVEFSUk9XLCBmaW5pc2hDbGljaywgZ2V0VGVtcGxhdGUsIGxpbmV1cEFjdGl2aXR5O1xuICBkaWFsb2cuZW1pdCgpO1xuICBMRUZUQVJST1cgPSAzNztcbiAgUklHSFRBUlJPVyA9IDM5O1xuICAkKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgdmFyIGRpcmVjdGlvbiwgbmV3SW5kZXgsIHBhZ2VzO1xuICAgIGRpcmVjdGlvbiA9IChmdW5jdGlvbigpIHtcbiAgICAgIHN3aXRjaCAoZXZlbnQud2hpY2gpIHtcbiAgICAgICAgY2FzZSBMRUZUQVJST1c6XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICBjYXNlIFJJR0hUQVJST1c6XG4gICAgICAgICAgcmV0dXJuICsxO1xuICAgICAgfVxuICAgIH0pKCk7XG4gICAgaWYgKGRpcmVjdGlvbiAmJiAhKGV2ZW50LnRhcmdldC50YWdOYW1lID09PSBcIlRFWFRBUkVBXCIpKSB7XG4gICAgICBwYWdlcyA9ICQoJy5wYWdlJyk7XG4gICAgICBuZXdJbmRleCA9IHBhZ2VzLmluZGV4KCQoJy5hY3RpdmUnKSkgKyBkaXJlY3Rpb247XG4gICAgICBpZiAoKDAgPD0gbmV3SW5kZXggJiYgbmV3SW5kZXggPCBwYWdlcy5sZW5ndGgpKSB7XG4gICAgICAgIHJldHVybiBhY3RpdmUuc2V0KHBhZ2VzLmVxKG5ld0luZGV4KSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHN0YXRlLnNob3cpO1xuICAkKGRvY3VtZW50KS5hamF4RXJyb3IoZnVuY3Rpb24oZXZlbnQsIHJlcXVlc3QsIHNldHRpbmdzKSB7XG4gICAgaWYgKHJlcXVlc3Quc3RhdHVzID09PSAwIHx8IHJlcXVlc3Quc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnNvbGUubG9nKCdhamF4IGVycm9yJywgZXZlbnQsIHJlcXVlc3QsIHNldHRpbmdzKTtcbiAgfSk7XG4gIGdldFRlbXBsYXRlID0gZnVuY3Rpb24oc2x1ZywgZG9uZSkge1xuICAgIGlmICghc2x1Zykge1xuICAgICAgcmV0dXJuIGRvbmUobnVsbCk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdnZXRUZW1wbGF0ZScsIHNsdWcpO1xuICAgIHJldHVybiBwYWdlSGFuZGxlci5nZXQoe1xuICAgICAgd2hlbkdvdHRlbjogZnVuY3Rpb24ocGFnZU9iamVjdCwgc2l0ZUZvdW5kKSB7XG4gICAgICAgIHJldHVybiBkb25lKHBhZ2VPYmplY3QpO1xuICAgICAgfSxcbiAgICAgIHdoZW5Ob3RHb3R0ZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZG9uZShudWxsKTtcbiAgICAgIH0sXG4gICAgICBwYWdlSW5mb3JtYXRpb246IHtcbiAgICAgICAgc2x1Zzogc2x1Z1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICBmaW5pc2hDbGljayA9IGZ1bmN0aW9uKGUsIG5hbWUpIHtcbiAgICB2YXIgcGFnZTtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKCFlLnNoaWZ0S2V5KSB7XG4gICAgICBwYWdlID0gJChlLnRhcmdldCkucGFyZW50cygnLnBhZ2UnKTtcbiAgICB9XG4gICAgbGluay5kb0ludGVybmFsTGluayhuYW1lLCBwYWdlLCAkKGUudGFyZ2V0KS5kYXRhKCdzaXRlJykpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbiAgJCgnLm1haW4nKS5kZWxlZ2F0ZSgnLnNob3ctcGFnZS1zb3VyY2UnLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyICRwYWdlLCBwYWdlO1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkcGFnZSA9ICQodGhpcykucGFyZW50KCkucGFyZW50KCk7XG4gICAgcGFnZSA9IGxpbmV1cC5hdEtleSgkcGFnZS5kYXRhKCdrZXknKSkuZ2V0UmF3UGFnZSgpO1xuICAgIHJldHVybiBkaWFsb2cub3BlbihcIkpTT04gZm9yIFwiICsgcGFnZS50aXRsZSwgJCgnPHByZS8+JykudGV4dChKU09OLnN0cmluZ2lmeShwYWdlLCBudWxsLCAyKSkpO1xuICB9KS5kZWxlZ2F0ZSgnLnBhZ2UnLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCEkKGUudGFyZ2V0KS5pcyhcImFcIikpIHtcbiAgICAgIHJldHVybiBhY3RpdmUuc2V0KHRoaXMpO1xuICAgIH1cbiAgfSkuZGVsZWdhdGUoJy5pbnRlcm5hbCcsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgbmFtZTtcbiAgICBuYW1lID0gJChlLnRhcmdldCkuZGF0YSgncGFnZU5hbWUnKTtcbiAgICBuYW1lID0gXCJcIiArIG5hbWU7XG4gICAgcGFnZUhhbmRsZXIuY29udGV4dCA9ICQoZS50YXJnZXQpLmF0dHIoJ3RpdGxlJykuc3BsaXQoJyA9PiAnKTtcbiAgICByZXR1cm4gZmluaXNoQ2xpY2soZSwgbmFtZSk7XG4gIH0pLmRlbGVnYXRlKCdpbWcucmVtb3RlJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHZhciBuYW1lO1xuICAgIG5hbWUgPSAkKGUudGFyZ2V0KS5kYXRhKCdzbHVnJyk7XG4gICAgcGFnZUhhbmRsZXIuY29udGV4dCA9IFskKGUudGFyZ2V0KS5kYXRhKCdzaXRlJyldO1xuICAgIHJldHVybiBmaW5pc2hDbGljayhlLCBuYW1lKTtcbiAgfSkuZGVsZWdhdGUoJy5yZXZpc2lvbicsICdkYmxjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgJHBhZ2UsIGFjdGlvbiwganNvbiwgcGFnZSwgcmV2O1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAkcGFnZSA9ICQodGhpcykucGFyZW50cygnLnBhZ2UnKTtcbiAgICBwYWdlID0gbGluZXVwLmF0S2V5KCRwYWdlLmRhdGEoJ2tleScpKS5nZXRSYXdQYWdlKCk7XG4gICAgcmV2ID0gcGFnZS5qb3VybmFsLmxlbmd0aCAtIDE7XG4gICAgYWN0aW9uID0gcGFnZS5qb3VybmFsW3Jldl07XG4gICAganNvbiA9IEpTT04uc3RyaW5naWZ5KGFjdGlvbiwgbnVsbCwgMik7XG4gICAgcmV0dXJuIGRpYWxvZy5vcGVuKFwiUmV2aXNpb24gXCIgKyByZXYgKyBcIiwgXCIgKyBhY3Rpb24udHlwZSArIFwiIGFjdGlvblwiLCAkKCc8cHJlLz4nKS50ZXh0KGpzb24pKTtcbiAgfSkuZGVsZWdhdGUoJy5hY3Rpb24nLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyICRhY3Rpb24sICRwYWdlLCBrZXksIG5hbWUsIHJldiwgc2x1ZztcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgJGFjdGlvbiA9ICQoZS50YXJnZXQpO1xuICAgIGlmICgkYWN0aW9uLmlzKCcuZm9yaycpICYmICgobmFtZSA9ICRhY3Rpb24uZGF0YSgnc2x1ZycpKSAhPSBudWxsKSkge1xuICAgICAgcGFnZUhhbmRsZXIuY29udGV4dCA9IFskYWN0aW9uLmRhdGEoJ3NpdGUnKV07XG4gICAgICByZXR1cm4gZmluaXNoQ2xpY2soZSwgKG5hbWUuc3BsaXQoJ18nKSlbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAkcGFnZSA9ICQodGhpcykucGFyZW50cygnLnBhZ2UnKTtcbiAgICAgIGtleSA9ICRwYWdlLmRhdGEoJ2tleScpO1xuICAgICAgc2x1ZyA9IGxpbmV1cC5hdEtleShrZXkpLmdldFNsdWcoKTtcbiAgICAgIHJldiA9ICQodGhpcykucGFyZW50KCkuY2hpbGRyZW4oKS5ub3QoJy5zZXBhcmF0b3InKS5pbmRleCgkYWN0aW9uKTtcbiAgICAgIGlmIChyZXYgPCAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICghZS5zaGlmdEtleSkge1xuICAgICAgICAkcGFnZS5uZXh0QWxsKCkucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgICBpZiAoIWUuc2hpZnRLZXkpIHtcbiAgICAgICAgbGluZXVwLnJlbW92ZUFsbEFmdGVyS2V5KGtleSk7XG4gICAgICB9XG4gICAgICBsaW5rLmNyZWF0ZVBhZ2Uoc2x1ZyArIFwiX3JldlwiICsgcmV2LCAkcGFnZS5kYXRhKCdzaXRlJykpLmFwcGVuZFRvKCQoJy5tYWluJykpLmVhY2gocmVmcmVzaC5jeWNsZSk7XG4gICAgICByZXR1cm4gYWN0aXZlLnNldCgkKCcucGFnZScpLmxhc3QoKSk7XG4gICAgfVxuICB9KS5kZWxlZ2F0ZSgnLmZvcmstcGFnZScsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgJHBhZ2UsIGFjdGlvbiwgcGFnZU9iamVjdDtcbiAgICAkcGFnZSA9ICQoZS50YXJnZXQpLnBhcmVudHMoJy5wYWdlJyk7XG4gICAgcGFnZU9iamVjdCA9IGxpbmV1cC5hdEtleSgkcGFnZS5kYXRhKCdrZXknKSk7XG4gICAgYWN0aW9uID0ge1xuICAgICAgdHlwZTogJ2ZvcmsnXG4gICAgfTtcbiAgICBpZiAoJHBhZ2UuaGFzQ2xhc3MoJ2xvY2FsJykpIHtcbiAgICAgIGlmIChwYWdlSGFuZGxlci51c2VMb2NhbFN0b3JhZ2UoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAkcGFnZS5yZW1vdmVDbGFzcygnbG9jYWwnKTtcbiAgICB9IGVsc2UgaWYgKHBhZ2VPYmplY3QuaXNSZW1vdGUoKSkge1xuICAgICAgYWN0aW9uLnNpdGUgPSBwYWdlT2JqZWN0LmdldFJlbW90ZVNpdGUoKTtcbiAgICB9XG4gICAgaWYgKCRwYWdlLmRhdGEoJ3JldicpICE9IG51bGwpIHtcbiAgICAgICRwYWdlLnJlbW92ZUNsYXNzKCdnaG9zdCcpO1xuICAgICAgJHBhZ2UuZmluZCgnLnJldmlzaW9uJykucmVtb3ZlKCk7XG4gICAgfVxuICAgIHJldHVybiBwYWdlSGFuZGxlci5wdXQoJHBhZ2UsIGFjdGlvbik7XG4gIH0pLmRlbGVnYXRlKCdidXR0b24uY3JlYXRlJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHJldHVybiBnZXRUZW1wbGF0ZSgkKGUudGFyZ2V0KS5kYXRhKCdzbHVnJyksIGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG4gICAgICB2YXIgJHBhZ2UsIHBhZ2UsIHBhZ2VPYmplY3Q7XG4gICAgICAkcGFnZSA9ICQoZS50YXJnZXQpLnBhcmVudHMoJy5wYWdlOmZpcnN0Jyk7XG4gICAgICAkcGFnZS5yZW1vdmVDbGFzcygnZ2hvc3QnKTtcbiAgICAgIHBhZ2VPYmplY3QgPSBsaW5ldXAuYXRLZXkoJHBhZ2UuZGF0YSgna2V5JykpO1xuICAgICAgcGFnZU9iamVjdC5iZWNvbWUodGVtcGxhdGUpO1xuICAgICAgcGFnZSA9IHBhZ2VPYmplY3QuZ2V0UmF3UGFnZSgpO1xuICAgICAgcmVmcmVzaC5yZWJ1aWxkUGFnZShwYWdlT2JqZWN0LCAkcGFnZS5lbXB0eSgpKTtcbiAgICAgIHJldHVybiBwYWdlSGFuZGxlci5wdXQoJHBhZ2UsIHtcbiAgICAgICAgdHlwZTogJ2NyZWF0ZScsXG4gICAgICAgIGlkOiBwYWdlLmlkLFxuICAgICAgICBpdGVtOiB7XG4gICAgICAgICAgdGl0bGU6IHBhZ2UudGl0bGUsXG4gICAgICAgICAgc3Rvcnk6IHBhZ2Uuc3RvcnlcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pLmRlbGVnYXRlKCcuc2NvcmUnLCAnaG92ZXInLCBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuICQoJy5tYWluJykudHJpZ2dlcigndGh1bWInLCAkKGUudGFyZ2V0KS5kYXRhKCd0aHVtYicpKTtcbiAgfSkuYmluZCgnZHJhZ2VudGVyJywgZnVuY3Rpb24oZXZ0KSB7XG4gICAgcmV0dXJuIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9KS5iaW5kKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGV2dCkge1xuICAgIHJldHVybiBldnQucHJldmVudERlZmF1bHQoKTtcbiAgfSkuYmluZChcImRyb3BcIiwgZHJvcC5kaXNwYXRjaCh7XG4gICAgcGFnZTogZnVuY3Rpb24oaXRlbSkge1xuICAgICAgcmV0dXJuIGxpbmsuZG9JbnRlcm5hbExpbmsoaXRlbS5zbHVnLCBudWxsLCBpdGVtLnNpdGUpO1xuICAgIH1cbiAgfSkpO1xuICAkKFwiLnByb3ZpZGVyIGlucHV0XCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICQoXCJmb290ZXIgaW5wdXQ6Zmlyc3RcIikudmFsKCQodGhpcykuYXR0cignZGF0YS1wcm92aWRlcicpKTtcbiAgICByZXR1cm4gJChcImZvb3RlciBmb3JtXCIpLnN1Ym1pdCgpO1xuICB9KTtcbiAgJCgnYm9keScpLm9uKCduZXctbmVpZ2hib3ItZG9uZScsIGZ1bmN0aW9uKGUsIG5laWdoYm9yKSB7XG4gICAgcmV0dXJuICQoJy5wYWdlJykuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgcmV0dXJuIHJlZnJlc2guZW1pdFR3aW5zKCQoZWxlbWVudCkpO1xuICAgIH0pO1xuICB9KTtcbiAgbGluZXVwQWN0aXZpdHkgPSByZXF1aXJlKCcuL2xpbmV1cEFjdGl2aXR5Jyk7XG4gICQoXCI8c3BhbiBjbGFzcz1tZW51PiAmbmJzcDsgJmVxdWl2OyAmbmJzcDsgPC9zcGFuPlwiKS5jc3Moe1xuICAgIFwiY3Vyc29yXCI6IFwicG9pbnRlclwiLFxuICAgIFwiZm9udC1zaXplXCI6IFwiMTIwJVwiXG4gIH0pLmFwcGVuZFRvKCdmb290ZXInKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlhbG9nLm9wZW4oXCJMaW5ldXAgQWN0aXZpdHlcIiwgbGluZXVwQWN0aXZpdHkuc2hvdygpKTtcbiAgfSk7XG4gIHRhcmdldC5iaW5kKCk7XG4gIHJldHVybiAkKGZ1bmN0aW9uKCkge1xuICAgIHN0YXRlLmZpcnN0KCk7XG4gICAgJCgnLnBhZ2UnKS5lYWNoKHJlZnJlc2guY3ljbGUpO1xuICAgIHJldHVybiBhY3RpdmUuc2V0KCQoJy5wYWdlJykubGFzdCgpKTtcbiAgfSk7XG59KTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhZGRQYWdlLCBhdEtleSwgYmVzdFRpdGxlLCBjcnVtYnMsIGRlYnVnS2V5cywgZGVidWdSZXNldCwgZGVidWdTZWxmQ2hlY2ssIGtleUJ5SW5kZXgsIGxlZnRLZXksIHBhZ2VCeUtleSwgcmFuZG9tLCByZW1vdmVBbGxBZnRlcktleSwgcmVtb3ZlS2V5LCB0aXRsZUF0S2V5LFxuICBpbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbihpdGVtKSB7IGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHsgaWYgKGkgaW4gdGhpcyAmJiB0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTsgfSByZXR1cm4gLTE7IH07XG5cbnJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyk7XG5cbnBhZ2VCeUtleSA9IHt9O1xuXG5rZXlCeUluZGV4ID0gW107XG5cbmFkZFBhZ2UgPSBmdW5jdGlvbihwYWdlT2JqZWN0KSB7XG4gIHZhciBrZXk7XG4gIGtleSA9IHJhbmRvbS5yYW5kb21CeXRlcyg0KTtcbiAgcGFnZUJ5S2V5W2tleV0gPSBwYWdlT2JqZWN0O1xuICBrZXlCeUluZGV4LnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleTtcbn07XG5cbnJlbW92ZUtleSA9IGZ1bmN0aW9uKGtleSkge1xuICBpZiAoaW5kZXhPZi5jYWxsKGtleUJ5SW5kZXgsIGtleSkgPCAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAga2V5QnlJbmRleCA9IGtleUJ5SW5kZXguZmlsdGVyKGZ1bmN0aW9uKGVhY2gpIHtcbiAgICByZXR1cm4ga2V5ICE9PSBlYWNoO1xuICB9KTtcbiAgZGVsZXRlIHBhZ2VCeUtleVtrZXldO1xuICByZXR1cm4ga2V5O1xufTtcblxucmVtb3ZlQWxsQWZ0ZXJLZXkgPSBmdW5jdGlvbihrZXkpIHtcbiAgdmFyIHJlc3VsdCwgdW53YW50ZWQ7XG4gIHJlc3VsdCA9IFtdO1xuICBpZiAoaW5kZXhPZi5jYWxsKGtleUJ5SW5kZXgsIGtleSkgPCAwKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICB3aGlsZSAoa2V5QnlJbmRleFtrZXlCeUluZGV4Lmxlbmd0aCAtIDFdICE9PSBrZXkpIHtcbiAgICB1bndhbnRlZCA9IGtleUJ5SW5kZXgucG9wKCk7XG4gICAgcmVzdWx0LnVuc2hpZnQodW53YW50ZWQpO1xuICAgIGRlbGV0ZSBwYWdlQnlLZXlbdW53YW50ZWRdO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5hdEtleSA9IGZ1bmN0aW9uKGtleSkge1xuICByZXR1cm4gcGFnZUJ5S2V5W2tleV07XG59O1xuXG50aXRsZUF0S2V5ID0gZnVuY3Rpb24oa2V5KSB7XG4gIHJldHVybiBhdEtleShrZXkpLmdldFRpdGxlKCk7XG59O1xuXG5iZXN0VGl0bGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCFrZXlCeUluZGV4Lmxlbmd0aCkge1xuICAgIHJldHVybiBcIldpa2lcIjtcbiAgfVxuICByZXR1cm4gdGl0bGVBdEtleShrZXlCeUluZGV4W2tleUJ5SW5kZXgubGVuZ3RoIC0gMV0pO1xufTtcblxuZGVidWdLZXlzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBrZXlCeUluZGV4O1xufTtcblxuZGVidWdSZXNldCA9IGZ1bmN0aW9uKCkge1xuICBwYWdlQnlLZXkgPSB7fTtcbiAgcmV0dXJuIGtleUJ5SW5kZXggPSBbXTtcbn07XG5cbmRlYnVnU2VsZkNoZWNrID0gZnVuY3Rpb24oa2V5cykge1xuICB2YXIgaGF2ZSwga2V5c0J5SW5kZXgsIHdhbnQ7XG4gIGlmICgoaGF2ZSA9IFwiXCIgKyBrZXlCeUluZGV4KSA9PT0gKHdhbnQgPSBcIlwiICsga2V5cykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc29sZS5sb2coJ1RoZSBsaW5ldXAgaXMgb3V0IG9mIHN5bmMgd2l0aCB0aGUgZG9tLicpO1xuICBjb25zb2xlLmxvZyhcIi5wYWdlczpcIiwga2V5cyk7XG4gIGNvbnNvbGUubG9nKFwibGluZXVwOlwiLCBrZXlCeUluZGV4KTtcbiAgaWYgKChcIlwiICsgKE9iamVjdC5rZXlzKGtleUJ5SW5kZXgpLnNvcnQoKSkpICE9PSAoXCJcIiArIChPYmplY3Qua2V5cyhrZXlzKS5zb3J0KCkpKSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zb2xlLmxvZygnSXQgbG9va3MgbGlrZSBhbiBvcmRlcmluZyBwcm9ibGVtIHdlIGNhbiBmaXguJyk7XG4gIHJldHVybiBrZXlzQnlJbmRleCA9IGtleXM7XG59O1xuXG5sZWZ0S2V5ID0gZnVuY3Rpb24oa2V5KSB7XG4gIHZhciBwb3M7XG4gIHBvcyA9IGtleUJ5SW5kZXguaW5kZXhPZihrZXkpO1xuICBpZiAocG9zIDwgMSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBrZXlCeUluZGV4W3BvcyAtIDFdO1xufTtcblxuY3J1bWJzID0gZnVuY3Rpb24oa2V5LCBsb2NhdGlvbikge1xuICB2YXIgYWRqYWNlbnQsIGhvc3QsIGxlZnQsIHBhZ2UsIHJlc3VsdCwgc2x1ZztcbiAgcGFnZSA9IHBhZ2VCeUtleVtrZXldO1xuICBob3N0ID0gcGFnZS5nZXRSZW1vdGVTaXRlKGxvY2F0aW9uKTtcbiAgcmVzdWx0ID0gWyd2aWV3Jywgc2x1ZyA9IHBhZ2UuZ2V0U2x1ZygpXTtcbiAgaWYgKHNsdWcgIT09ICdpbmRleCcpIHtcbiAgICByZXN1bHQudW5zaGlmdCgndmlldycsICdpbmRleCcpO1xuICB9XG4gIGlmIChob3N0ICE9PSBsb2NhdGlvbiAmJiAoKGxlZnQgPSBsZWZ0S2V5KGtleSkpICE9IG51bGwpKSB7XG4gICAgaWYgKCEoYWRqYWNlbnQgPSBwYWdlQnlLZXlbbGVmdF0pLmlzUmVtb3RlKCkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGxvY2F0aW9uLCBhZGphY2VudC5nZXRTbHVnKCkpO1xuICAgIH1cbiAgfVxuICByZXN1bHQudW5zaGlmdChob3N0KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhZGRQYWdlOiBhZGRQYWdlLFxuICByZW1vdmVLZXk6IHJlbW92ZUtleSxcbiAgcmVtb3ZlQWxsQWZ0ZXJLZXk6IHJlbW92ZUFsbEFmdGVyS2V5LFxuICBhdEtleTogYXRLZXksXG4gIHRpdGxlQXRLZXk6IHRpdGxlQXRLZXksXG4gIGJlc3RUaXRsZTogYmVzdFRpdGxlLFxuICBkZWJ1Z0tleXM6IGRlYnVnS2V5cyxcbiAgZGVidWdSZXNldDogZGVidWdSZXNldCxcbiAgY3J1bWJzOiBjcnVtYnMsXG4gIGRlYnVnU2VsZkNoZWNrOiBkZWJ1Z1NlbGZDaGVja1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhY3Rpdml0eSwgZGF5LCBob3VyLCBsaW5ldXAsIG1pbnV0ZSwgcm93LCBzZWNvbmQsIHNob3csIHNwYXJrcywgdGFibGU7XG5cbmxpbmV1cCA9IHJlcXVpcmUoJy4vbGluZXVwJyk7XG5cbmRheSA9IDI0ICogKGhvdXIgPSA2MCAqIChtaW51dGUgPSA2MCAqIChzZWNvbmQgPSAxMDAwKSkpO1xuXG5hY3Rpdml0eSA9IGZ1bmN0aW9uKGpvdXJuYWwsIGZyb20sIHRvKSB7XG4gIHZhciBhY3Rpb24sIGksIGxlbjtcbiAgZm9yIChpID0gMCwgbGVuID0gam91cm5hbC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGFjdGlvbiA9IGpvdXJuYWxbaV07XG4gICAgaWYgKChhY3Rpb24uZGF0ZSAhPSBudWxsKSAmJiBmcm9tIDwgYWN0aW9uLmRhdGUgJiYgYWN0aW9uLmRhdGUgPD0gdG8pIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5zcGFya3MgPSBmdW5jdGlvbihqb3VybmFsKSB7XG4gIHZhciBkYXlzLCBmcm9tLCBpLCBsaW5lLCByZWY7XG4gIGxpbmUgPSAnJztcbiAgZGF5cyA9IDYwO1xuICBmcm9tID0gKG5ldyBEYXRlKS5nZXRUaW1lKCkgLSBkYXlzICogZGF5O1xuICBmb3IgKGkgPSAxLCByZWYgPSBkYXlzOyAxIDw9IHJlZiA/IGkgPD0gcmVmIDogaSA+PSByZWY7IDEgPD0gcmVmID8gaSsrIDogaS0tKSB7XG4gICAgbGluZSArPSBhY3Rpdml0eShqb3VybmFsLCBmcm9tLCBmcm9tICsgZGF5KSA/ICd8JyA6ICcuJztcbiAgICBpZiAoKG5ldyBEYXRlKGZyb20pKS5nZXREYXkoKSA9PT0gNSkge1xuICAgICAgbGluZSArPSAnPHRkPic7XG4gICAgfVxuICAgIGZyb20gKz0gZGF5O1xuICB9XG4gIHJldHVybiBsaW5lO1xufTtcblxucm93ID0gZnVuY3Rpb24ocGFnZSkge1xuICB2YXIgcmVtb3RlLCB0aXRsZTtcbiAgcmVtb3RlID0gcGFnZS5nZXRSZW1vdGVTaXRlKGxvY2F0aW9uLmhvc3QpO1xuICB0aXRsZSA9IHBhZ2UuZ2V0VGl0bGUoKTtcbiAgcmV0dXJuIFwiPHRyPjx0ZCBhbGlnbj1yaWdodD5cXG4gIFwiICsgKHNwYXJrcyhwYWdlLmdldFJhd1BhZ2UoKS5qb3VybmFsKSkgKyBcIlxcbjx0ZD5cXG4gIDxpbWcgY2xhc3M9XFxcInJlbW90ZVxcXCIgc3JjPVxcXCIvL1wiICsgcmVtb3RlICsgXCIvZmF2aWNvbi5wbmdcXFwiPlxcbiAgXCIgKyB0aXRsZTtcbn07XG5cbnRhYmxlID0gZnVuY3Rpb24oa2V5cykge1xuICB2YXIga2V5O1xuICByZXR1cm4gXCI8dGFibGU+XFxuXCIgKyAoKChmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgbGVuLCByZXN1bHRzO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBrZXlzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgcmVzdWx0cy5wdXNoKHJvdyhsaW5ldXAuYXRLZXkoa2V5KSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfSkoKSkuam9pbihcIlxcblwiKSkgKyBcIlxcbjwvdGFibGU+XFxuPHAgc3R5bGU9XFxcImNvbG9yOiAjYmJiXFxcIj5kb3RzIGFyZSBkYXlzLCBhZHZhbmNpbmcgdG8gdGhlIHJpZ2h0LCB3aXRoIG1hcmtzIHNob3dpbmcgYWN0aXZpdHk8L3A+XCI7XG59O1xuXG5zaG93ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0YWJsZShsaW5ldXAuZGVidWdLZXlzKCkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNob3c6IHNob3dcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYWN0aXZlLCBhc1NsdWcsIGNyZWF0ZVBhZ2UsIGRvSW50ZXJuYWxMaW5rLCBsaW5ldXAsIHBhZ2VFbWl0dGVyLCByZWYsIHJlZnJlc2gsIHNob3dQYWdlLCBzaG93UmVzdWx0O1xuXG5saW5ldXAgPSByZXF1aXJlKCcuL2xpbmV1cCcpO1xuXG5hY3RpdmUgPSByZXF1aXJlKCcuL2FjdGl2ZScpO1xuXG5yZWZyZXNoID0gcmVxdWlyZSgnLi9yZWZyZXNoJyk7XG5cbnJlZiA9IHJlcXVpcmUoJy4vcGFnZScpLCBhc1NsdWcgPSByZWYuYXNTbHVnLCBwYWdlRW1pdHRlciA9IHJlZi5wYWdlRW1pdHRlcjtcblxuY3JlYXRlUGFnZSA9IGZ1bmN0aW9uKG5hbWUsIGxvYykge1xuICB2YXIgJHBhZ2UsIHNpdGU7XG4gIGlmIChsb2MgJiYgbG9jICE9PSAndmlldycpIHtcbiAgICBzaXRlID0gbG9jO1xuICB9XG4gICRwYWdlID0gJChcIjxkaXYgY2xhc3M9XFxcInBhZ2VcXFwiIGlkPVxcXCJcIiArIG5hbWUgKyBcIlxcXCI+XFxuICA8ZGl2IGNsYXNzPVxcXCJ0d2luc1xcXCI+IDxwPiA8L3A+IDwvZGl2PlxcbiAgPGRpdiBjbGFzcz1cXFwiaGVhZGVyXFxcIj5cXG4gICAgPGgxPiA8aW1nIGNsYXNzPVxcXCJmYXZpY29uXFxcIiBzcmM9XFxcIlwiICsgKHNpdGUgPyBcIi8vXCIgKyBzaXRlIDogXCJcIikgKyBcIi9mYXZpY29uLnBuZ1xcXCIgaGVpZ2h0PVxcXCIzMnB4XFxcIj4gXCIgKyBuYW1lICsgXCIgPC9oMT5cXG4gIDwvZGl2PlxcbjwvZGl2PlwiKTtcbiAgaWYgKHNpdGUpIHtcbiAgICAkcGFnZS5kYXRhKCdzaXRlJywgc2l0ZSk7XG4gIH1cbiAgcmV0dXJuICRwYWdlO1xufTtcblxuc2hvd1BhZ2UgPSBmdW5jdGlvbihuYW1lLCBsb2MpIHtcbiAgcmV0dXJuIGNyZWF0ZVBhZ2UobmFtZSwgbG9jKS5hcHBlbmRUbygnLm1haW4nKS5lYWNoKHJlZnJlc2guY3ljbGUpO1xufTtcblxuZG9JbnRlcm5hbExpbmsgPSBmdW5jdGlvbihuYW1lLCAkcGFnZSwgc2l0ZSkge1xuICBpZiAoc2l0ZSA9PSBudWxsKSB7XG4gICAgc2l0ZSA9IG51bGw7XG4gIH1cbiAgbmFtZSA9IGFzU2x1ZyhuYW1lKTtcbiAgaWYgKCRwYWdlICE9IG51bGwpIHtcbiAgICAkKCRwYWdlKS5uZXh0QWxsKCkucmVtb3ZlKCk7XG4gIH1cbiAgaWYgKCRwYWdlICE9IG51bGwpIHtcbiAgICBsaW5ldXAucmVtb3ZlQWxsQWZ0ZXJLZXkoJCgkcGFnZSkuZGF0YSgna2V5JykpO1xuICB9XG4gIHNob3dQYWdlKG5hbWUsIHNpdGUpO1xuICByZXR1cm4gYWN0aXZlLnNldCgkKCcucGFnZScpLmxhc3QoKSk7XG59O1xuXG5zaG93UmVzdWx0ID0gZnVuY3Rpb24ocGFnZU9iamVjdCkge1xuICB2YXIgJHBhZ2U7XG4gICRwYWdlID0gY3JlYXRlUGFnZShwYWdlT2JqZWN0LmdldFNsdWcoKSkuYWRkQ2xhc3MoJ2dob3N0Jyk7XG4gICRwYWdlLmFwcGVuZFRvKCQoJy5tYWluJykpO1xuICByZWZyZXNoLmJ1aWxkUGFnZShwYWdlT2JqZWN0LCAkcGFnZSk7XG4gIHJldHVybiBhY3RpdmUuc2V0KCQoJy5wYWdlJykubGFzdCgpKTtcbn07XG5cbnBhZ2VFbWl0dGVyLm9uKCdzaG93JywgZnVuY3Rpb24ocGFnZSkge1xuICBjb25zb2xlLmxvZygncGFnZUVtaXR0ZXIgaGFuZGxpbmcnLCBwYWdlKTtcbiAgcmV0dXJuIHNob3dSZXN1bHQocGFnZSk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZVBhZ2U6IGNyZWF0ZVBhZ2UsXG4gIGRvSW50ZXJuYWxMaW5rOiBkb0ludGVybmFsTGluayxcbiAgc2hvd1BhZ2U6IHNob3dQYWdlLFxuICBzaG93UmVzdWx0OiBzaG93UmVzdWx0XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIF8sIG5laWdoYm9yaG9vZCwgbmV4dEF2YWlsYWJsZUZldGNoLCBuZXh0RmV0Y2hJbnRlcnZhbCwgcG9wdWxhdGVTaXRlSW5mb0ZvcixcbiAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5fID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5laWdoYm9yaG9vZCA9IHt9O1xuXG5uZWlnaGJvcmhvb2Quc2l0ZXMgPSB7fTtcblxubmV4dEF2YWlsYWJsZUZldGNoID0gMDtcblxubmV4dEZldGNoSW50ZXJ2YWwgPSAyMDAwO1xuXG5wb3B1bGF0ZVNpdGVJbmZvRm9yID0gZnVuY3Rpb24oc2l0ZSwgbmVpZ2hib3JJbmZvKSB7XG4gIHZhciBmZXRjaE1hcCwgbm93LCB0cmFuc2l0aW9uO1xuICBpZiAobmVpZ2hib3JJbmZvLnNpdGVtYXBSZXF1ZXN0SW5mbGlnaHQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgbmVpZ2hib3JJbmZvLnNpdGVtYXBSZXF1ZXN0SW5mbGlnaHQgPSB0cnVlO1xuICB0cmFuc2l0aW9uID0gZnVuY3Rpb24oc2l0ZSwgZnJvbSwgdG8pIHtcbiAgICByZXR1cm4gJChcIi5uZWlnaGJvcltkYXRhLXNpdGU9XFxcIlwiICsgc2l0ZSArIFwiXFxcIl1cIikuZmluZCgnZGl2JykucmVtb3ZlQ2xhc3MoZnJvbSkuYWRkQ2xhc3ModG8pO1xuICB9O1xuICBmZXRjaE1hcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXF1ZXN0LCBzaXRlbWFwVXJsO1xuICAgIHNpdGVtYXBVcmwgPSBcImh0dHA6Ly9cIiArIHNpdGUgKyBcIi9zeXN0ZW0vc2l0ZW1hcC5qc29uXCI7XG4gICAgdHJhbnNpdGlvbihzaXRlLCAnd2FpdCcsICdmZXRjaCcpO1xuICAgIHJlcXVlc3QgPSAkLmFqYXgoe1xuICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgdXJsOiBzaXRlbWFwVXJsXG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcXVlc3QuYWx3YXlzKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5laWdoYm9ySW5mby5zaXRlbWFwUmVxdWVzdEluZmxpZ2h0ID0gZmFsc2U7XG4gICAgfSkuZG9uZShmdW5jdGlvbihkYXRhKSB7XG4gICAgICBuZWlnaGJvckluZm8uc2l0ZW1hcCA9IGRhdGE7XG4gICAgICB0cmFuc2l0aW9uKHNpdGUsICdmZXRjaCcsICdkb25lJyk7XG4gICAgICByZXR1cm4gJCgnYm9keScpLnRyaWdnZXIoJ25ldy1uZWlnaGJvci1kb25lJywgc2l0ZSk7XG4gICAgfSkuZmFpbChmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gdHJhbnNpdGlvbihzaXRlLCAnZmV0Y2gnLCAnZmFpbCcpO1xuICAgIH0pO1xuICB9O1xuICBub3cgPSBEYXRlLm5vdygpO1xuICBpZiAobm93ID4gbmV4dEF2YWlsYWJsZUZldGNoKSB7XG4gICAgbmV4dEF2YWlsYWJsZUZldGNoID0gbm93ICsgbmV4dEZldGNoSW50ZXJ2YWw7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZmV0Y2hNYXAsIDEwMCk7XG4gIH0gZWxzZSB7XG4gICAgc2V0VGltZW91dChmZXRjaE1hcCwgbmV4dEF2YWlsYWJsZUZldGNoIC0gbm93KTtcbiAgICByZXR1cm4gbmV4dEF2YWlsYWJsZUZldGNoICs9IG5leHRGZXRjaEludGVydmFsO1xuICB9XG59O1xuXG5uZWlnaGJvcmhvb2QucmVnaXN0ZXJOZWlnaGJvciA9IGZ1bmN0aW9uKHNpdGUpIHtcbiAgdmFyIG5laWdoYm9ySW5mbztcbiAgaWYgKG5laWdoYm9yaG9vZC5zaXRlc1tzaXRlXSAhPSBudWxsKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIG5laWdoYm9ySW5mbyA9IHt9O1xuICBuZWlnaGJvcmhvb2Quc2l0ZXNbc2l0ZV0gPSBuZWlnaGJvckluZm87XG4gIHBvcHVsYXRlU2l0ZUluZm9Gb3Ioc2l0ZSwgbmVpZ2hib3JJbmZvKTtcbiAgcmV0dXJuICQoJ2JvZHknKS50cmlnZ2VyKCduZXctbmVpZ2hib3InLCBzaXRlKTtcbn07XG5cbm5laWdoYm9yaG9vZC5saXN0TmVpZ2hib3JzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBfLmtleXMobmVpZ2hib3Job29kLnNpdGVzKTtcbn07XG5cbm5laWdoYm9yaG9vZC5zZWFyY2ggPSBmdW5jdGlvbihzZWFyY2hRdWVyeSkge1xuICB2YXIgZmluZHMsIG1hdGNoLCBtYXRjaGluZ1BhZ2VzLCBuZWlnaGJvckluZm8sIG5laWdoYm9yU2l0ZSwgcmVmLCBzaXRlbWFwLCBzdGFydCwgdGFsbHksIHRpY2s7XG4gIGZpbmRzID0gW107XG4gIHRhbGx5ID0ge307XG4gIHRpY2sgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZiAodGFsbHlba2V5XSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGFsbHlba2V5XSsrO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGFsbHlba2V5XSA9IDE7XG4gICAgfVxuICB9O1xuICBtYXRjaCA9IGZ1bmN0aW9uKGtleSwgdGV4dCkge1xuICAgIHZhciBoaXQ7XG4gICAgaGl0ID0gKHRleHQgIT0gbnVsbCkgJiYgdGV4dC50b0xvd2VyQ2FzZSgpLmluZGV4T2Yoc2VhcmNoUXVlcnkudG9Mb3dlckNhc2UoKSkgPj0gMDtcbiAgICBpZiAoaGl0KSB7XG4gICAgICB0aWNrKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBoaXQ7XG4gIH07XG4gIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgcmVmID0gbmVpZ2hib3Job29kLnNpdGVzO1xuICBmb3IgKG5laWdoYm9yU2l0ZSBpbiByZWYpIHtcbiAgICBpZiAoIWhhc1Byb3AuY2FsbChyZWYsIG5laWdoYm9yU2l0ZSkpIGNvbnRpbnVlO1xuICAgIG5laWdoYm9ySW5mbyA9IHJlZltuZWlnaGJvclNpdGVdO1xuICAgIHNpdGVtYXAgPSBuZWlnaGJvckluZm8uc2l0ZW1hcDtcbiAgICBpZiAoc2l0ZW1hcCAhPSBudWxsKSB7XG4gICAgICB0aWNrKCdzaXRlcycpO1xuICAgIH1cbiAgICBtYXRjaGluZ1BhZ2VzID0gXy5lYWNoKHNpdGVtYXAsIGZ1bmN0aW9uKHBhZ2UpIHtcbiAgICAgIHRpY2soJ3BhZ2VzJyk7XG4gICAgICBpZiAoIShtYXRjaCgndGl0bGUnLCBwYWdlLnRpdGxlKSB8fCBtYXRjaCgndGV4dCcsIHBhZ2Uuc3lub3BzaXMpIHx8IG1hdGNoKCdzbHVnJywgcGFnZS5zbHVnKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGljaygnZmluZHMnKTtcbiAgICAgIHJldHVybiBmaW5kcy5wdXNoKHtcbiAgICAgICAgcGFnZTogcGFnZSxcbiAgICAgICAgc2l0ZTogbmVpZ2hib3JTaXRlLFxuICAgICAgICByYW5rOiAxXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICB0YWxseVsnbXNlYyddID0gRGF0ZS5ub3coKSAtIHN0YXJ0O1xuICByZXR1cm4ge1xuICAgIGZpbmRzOiBmaW5kcyxcbiAgICB0YWxseTogdGFsbHlcbiAgfTtcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYmluZCwgZmxhZywgaW5qZWN0LCBsaW5rLCBzaXRlcywgdG90YWxQYWdlcztcblxubGluayA9IHJlcXVpcmUoJy4vbGluaycpO1xuXG5zaXRlcyA9IG51bGw7XG5cbnRvdGFsUGFnZXMgPSAwO1xuXG5mbGFnID0gZnVuY3Rpb24oc2l0ZSkge1xuICByZXR1cm4gXCI8c3BhbiBjbGFzcz1cXFwibmVpZ2hib3JcXFwiIGRhdGEtc2l0ZT1cXFwiXCIgKyBzaXRlICsgXCJcXFwiPlxcbiAgPGRpdiBjbGFzcz1cXFwid2FpdFxcXCI+XFxuICAgIDxpbWcgc3JjPVxcXCJodHRwOi8vXCIgKyBzaXRlICsgXCIvZmF2aWNvbi5wbmdcXFwiIHRpdGxlPVxcXCJcIiArIHNpdGUgKyBcIlxcXCI+XFxuICA8L2Rpdj5cXG48L3NwYW4+XCI7XG59O1xuXG5pbmplY3QgPSBmdW5jdGlvbihuZWlnaGJvcmhvb2QpIHtcbiAgcmV0dXJuIHNpdGVzID0gbmVpZ2hib3Job29kLnNpdGVzO1xufTtcblxuYmluZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgJG5laWdoYm9yaG9vZDtcbiAgJG5laWdoYm9yaG9vZCA9ICQoJy5uZWlnaGJvcmhvb2QnKTtcbiAgcmV0dXJuICQoJ2JvZHknKS5vbignbmV3LW5laWdoYm9yJywgZnVuY3Rpb24oZSwgc2l0ZSkge1xuICAgIHJldHVybiAkbmVpZ2hib3Job29kLmFwcGVuZChmbGFnKHNpdGUpKTtcbiAgfSkub24oJ25ldy1uZWlnaGJvci1kb25lJywgZnVuY3Rpb24oZSwgc2l0ZSkge1xuICAgIHZhciBpbWcsIHBhZ2VDb3VudDtcbiAgICBwYWdlQ291bnQgPSBzaXRlc1tzaXRlXS5zaXRlbWFwLmxlbmd0aDtcbiAgICBpbWcgPSAkKFwiLm5laWdoYm9yaG9vZCAubmVpZ2hib3JbZGF0YS1zaXRlPVxcXCJcIiArIHNpdGUgKyBcIlxcXCJdXCIpLmZpbmQoJ2ltZycpO1xuICAgIGltZy5hdHRyKCd0aXRsZScsIHNpdGUgKyBcIlxcbiBcIiArIHBhZ2VDb3VudCArIFwiIHBhZ2VzXCIpO1xuICAgIHRvdGFsUGFnZXMgKz0gcGFnZUNvdW50O1xuICAgIHJldHVybiAkKCcuc2VhcmNoYm94IC5wYWdlcycpLnRleHQodG90YWxQYWdlcyArIFwiIHBhZ2VzXCIpO1xuICB9KS5kZWxlZ2F0ZSgnLm5laWdoYm9yIGltZycsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICByZXR1cm4gbGluay5kb0ludGVybmFsTGluaygnaW5kZXgnLCBudWxsLCB0aGlzLnRpdGxlLnNwbGl0KFwiXFxuXCIpWzBdKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5qZWN0OiBpbmplY3QsXG4gIGJpbmQ6IGJpbmRcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgRXZlbnRFbWl0dGVyLCBfLCBhc1NsdWcsIGZvcm1hdERhdGUsIG5ld1BhZ2UsIG5vd1NlY3Rpb25zLCBwYWdlRW1pdHRlciwgcmFuZG9tLCByZXZpc2lvbjtcblxuZm9ybWF0RGF0ZSA9IHJlcXVpcmUoJy4vdXRpbCcpLmZvcm1hdERhdGU7XG5cbnJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyk7XG5cbnJldmlzaW9uID0gcmVxdWlyZSgnLi9yZXZpc2lvbicpO1xuXG5fID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5FdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudHMnKS5FdmVudEVtaXR0ZXI7XG5cbnBhZ2VFbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcjtcblxuYXNTbHVnID0gZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gbmFtZS5yZXBsYWNlKC9cXHMvZywgJy0nKS5yZXBsYWNlKC9bXkEtWmEtejAtOS1dL2csICcnKS50b0xvd2VyQ2FzZSgpO1xufTtcblxubm93U2VjdGlvbnMgPSBmdW5jdGlvbihub3cpIHtcbiAgcmV0dXJuIFtcbiAgICB7XG4gICAgICBzeW1ib2w6ICfinYQnLFxuICAgICAgZGF0ZTogbm93IC0gMTAwMCAqIDYwICogNjAgKiAyNCAqIDM2NixcbiAgICAgIHBlcmlvZDogJ2EgWWVhcidcbiAgICB9LCB7XG4gICAgICBzeW1ib2w6ICfimpgnLFxuICAgICAgZGF0ZTogbm93IC0gMTAwMCAqIDYwICogNjAgKiAyNCAqIDMxICogMyxcbiAgICAgIHBlcmlvZDogJ2EgU2Vhc29uJ1xuICAgIH0sIHtcbiAgICAgIHN5bWJvbDogJ+KaqicsXG4gICAgICBkYXRlOiBub3cgLSAxMDAwICogNjAgKiA2MCAqIDI0ICogMzEsXG4gICAgICBwZXJpb2Q6ICdhIE1vbnRoJ1xuICAgIH0sIHtcbiAgICAgIHN5bWJvbDogJ+KYvScsXG4gICAgICBkYXRlOiBub3cgLSAxMDAwICogNjAgKiA2MCAqIDI0ICogNyxcbiAgICAgIHBlcmlvZDogJ2EgV2VlaydcbiAgICB9LCB7XG4gICAgICBzeW1ib2w6ICfimIAnLFxuICAgICAgZGF0ZTogbm93IC0gMTAwMCAqIDYwICogNjAgKiAyNCxcbiAgICAgIHBlcmlvZDogJ2EgRGF5J1xuICAgIH0sIHtcbiAgICAgIHN5bWJvbDogJ+KMmicsXG4gICAgICBkYXRlOiBub3cgLSAxMDAwICogNjAgKiA2MCxcbiAgICAgIHBlcmlvZDogJ2FuIEhvdXInXG4gICAgfVxuICBdO1xufTtcblxubmV3UGFnZSA9IGZ1bmN0aW9uKGpzb24sIHNpdGUpIHtcbiAgdmFyIGFkZEl0ZW0sIGFkZFBhcmFncmFwaCwgYXBwbHksIGJlY29tZSwgZ2V0Q29udGV4dCwgZ2V0SXRlbSwgZ2V0TmVpZ2hib3JzLCBnZXRSYXdQYWdlLCBnZXRSZW1vdGVTaXRlLCBnZXRSZW1vdGVTaXRlRGV0YWlscywgZ2V0UmV2aXNpb24sIGdldFNsdWcsIGdldFRpbWVzdGFtcCwgZ2V0VGl0bGUsIGlzTG9jYWwsIGlzUGx1Z2luLCBpc1JlbW90ZSwgbWVyZ2UsIG5vdER1cGxpY2F0ZSwgcGFnZSwgc2VxQWN0aW9ucywgc2VxSXRlbXMsIHNldFRpdGxlLCBzaXRlTGluZXVwO1xuICBwYWdlID0ganNvbiB8fCB7fTtcbiAgcGFnZS50aXRsZSB8fCAocGFnZS50aXRsZSA9ICdlbXB0eScpO1xuICBwYWdlLnN0b3J5IHx8IChwYWdlLnN0b3J5ID0gW10pO1xuICBwYWdlLmpvdXJuYWwgfHwgKHBhZ2Uuam91cm5hbCA9IFtdKTtcbiAgZ2V0UmF3UGFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwYWdlO1xuICB9O1xuICBnZXRDb250ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFjdGlvbiwgYWRkQ29udGV4dCwgY29udGV4dCwgaiwgbGVuLCByZWY7XG4gICAgY29udGV4dCA9IFsndmlldyddO1xuICAgIGlmIChpc1JlbW90ZSgpKSB7XG4gICAgICBjb250ZXh0LnB1c2goc2l0ZSk7XG4gICAgfVxuICAgIGFkZENvbnRleHQgPSBmdW5jdGlvbihzaXRlKSB7XG4gICAgICBpZiAoKHNpdGUgIT0gbnVsbCkgJiYgIV8uaW5jbHVkZShjb250ZXh0LCBzaXRlKSkge1xuICAgICAgICByZXR1cm4gY29udGV4dC5wdXNoKHNpdGUpO1xuICAgICAgfVxuICAgIH07XG4gICAgcmVmID0gcGFnZS5qb3VybmFsLnNsaWNlKDApLnJldmVyc2UoKTtcbiAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGFjdGlvbiA9IHJlZltqXTtcbiAgICAgIGFkZENvbnRleHQoYWN0aW9uICE9IG51bGwgPyBhY3Rpb24uc2l0ZSA6IHZvaWQgMCk7XG4gICAgfVxuICAgIHJldHVybiBjb250ZXh0O1xuICB9O1xuICBpc1BsdWdpbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwYWdlLnBsdWdpbiAhPSBudWxsO1xuICB9O1xuICBpc1JlbW90ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAhKHNpdGUgPT09ICh2b2lkIDApIHx8IHNpdGUgPT09IG51bGwgfHwgc2l0ZSA9PT0gJ3ZpZXcnIHx8IHNpdGUgPT09ICdvcmlnaW4nIHx8IHNpdGUgPT09ICdsb2NhbCcpO1xuICB9O1xuICBpc0xvY2FsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNpdGUgPT09ICdsb2NhbCc7XG4gIH07XG4gIGdldFJlbW90ZVNpdGUgPSBmdW5jdGlvbihob3N0KSB7XG4gICAgaWYgKGhvc3QgPT0gbnVsbCkge1xuICAgICAgaG9zdCA9IG51bGw7XG4gICAgfVxuICAgIGlmIChpc1JlbW90ZSgpKSB7XG4gICAgICByZXR1cm4gc2l0ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGhvc3Q7XG4gICAgfVxuICB9O1xuICBnZXRSZW1vdGVTaXRlRGV0YWlscyA9IGZ1bmN0aW9uKGhvc3QpIHtcbiAgICB2YXIgcmVzdWx0O1xuICAgIGlmIChob3N0ID09IG51bGwpIHtcbiAgICAgIGhvc3QgPSBudWxsO1xuICAgIH1cbiAgICByZXN1bHQgPSBbXTtcbiAgICBpZiAoaG9zdCB8fCBpc1JlbW90ZSgpKSB7XG4gICAgICByZXN1bHQucHVzaChnZXRSZW1vdGVTaXRlKGhvc3QpKTtcbiAgICB9XG4gICAgaWYgKGlzUGx1Z2luKCkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKHBhZ2UucGx1Z2luICsgXCIgcGx1Z2luXCIpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0LmpvaW4oXCJcXG5cIik7XG4gIH07XG4gIGdldFNsdWcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYXNTbHVnKHBhZ2UudGl0bGUpO1xuICB9O1xuICBnZXROZWlnaGJvcnMgPSBmdW5jdGlvbihob3N0KSB7XG4gICAgdmFyIGFjdGlvbiwgaXRlbSwgaiwgaywgbGVuLCBsZW4xLCBuZWlnaGJvcnMsIHJlZiwgcmVmMTtcbiAgICBuZWlnaGJvcnMgPSBbXTtcbiAgICBpZiAoaXNSZW1vdGUoKSkge1xuICAgICAgbmVpZ2hib3JzLnB1c2goc2l0ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChob3N0ICE9IG51bGwpIHtcbiAgICAgICAgbmVpZ2hib3JzLnB1c2goaG9zdCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlZiA9IHBhZ2Uuc3Rvcnk7XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBpdGVtID0gcmVmW2pdO1xuICAgICAgaWYgKChpdGVtICE9IG51bGwgPyBpdGVtLnNpdGUgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgbmVpZ2hib3JzLnB1c2goaXRlbS5zaXRlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVmMSA9IHBhZ2Uuam91cm5hbDtcbiAgICBmb3IgKGsgPSAwLCBsZW4xID0gcmVmMS5sZW5ndGg7IGsgPCBsZW4xOyBrKyspIHtcbiAgICAgIGFjdGlvbiA9IHJlZjFba107XG4gICAgICBpZiAoKGFjdGlvbiAhPSBudWxsID8gYWN0aW9uLnNpdGUgOiB2b2lkIDApICE9IG51bGwpIHtcbiAgICAgICAgbmVpZ2hib3JzLnB1c2goYWN0aW9uLnNpdGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gXy51bmlxKG5laWdoYm9ycyk7XG4gIH07XG4gIGdldFRpdGxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHBhZ2UudGl0bGU7XG4gIH07XG4gIHNldFRpdGxlID0gZnVuY3Rpb24odGl0bGUpIHtcbiAgICByZXR1cm4gcGFnZS50aXRsZSA9IHRpdGxlO1xuICB9O1xuICBnZXRSZXZpc2lvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwYWdlLmpvdXJuYWwubGVuZ3RoIC0gMTtcbiAgfTtcbiAgZ2V0VGltZXN0YW1wID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRhdGU7XG4gICAgZGF0ZSA9IHBhZ2Uuam91cm5hbFtnZXRSZXZpc2lvbigpXS5kYXRlO1xuICAgIGlmIChkYXRlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiBmb3JtYXREYXRlKGRhdGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gXCJSZXZpc2lvbiBcIiArIChnZXRSZXZpc2lvbigpKTtcbiAgICB9XG4gIH07XG4gIGFkZEl0ZW0gPSBmdW5jdGlvbihpdGVtKSB7XG4gICAgaXRlbSA9IF8uZXh0ZW5kKHt9LCB7XG4gICAgICBpZDogcmFuZG9tLml0ZW1JZCgpXG4gICAgfSwgaXRlbSk7XG4gICAgcmV0dXJuIHBhZ2Uuc3RvcnkucHVzaChpdGVtKTtcbiAgfTtcbiAgZ2V0SXRlbSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgdmFyIGl0ZW0sIGosIGxlbiwgcmVmO1xuICAgIHJlZiA9IHBhZ2Uuc3Rvcnk7XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBpdGVtID0gcmVmW2pdO1xuICAgICAgaWYgKGl0ZW0uaWQgPT09IGlkKSB7XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfTtcbiAgc2VxSXRlbXMgPSBmdW5jdGlvbihlYWNoKSB7XG4gICAgdmFyIGVtaXRJdGVtO1xuICAgIGVtaXRJdGVtID0gZnVuY3Rpb24oaSkge1xuICAgICAgaWYgKGkgPj0gcGFnZS5zdG9yeS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGVhY2gocGFnZS5zdG9yeVtpXSB8fCB7XG4gICAgICAgIHRleHQ6ICdudWxsJ1xuICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBlbWl0SXRlbShpICsgMSk7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBlbWl0SXRlbSgwKTtcbiAgfTtcbiAgYWRkUGFyYWdyYXBoID0gZnVuY3Rpb24odGV4dCkge1xuICAgIHZhciB0eXBlO1xuICAgIHR5cGUgPSBcInBhcmFncmFwaFwiO1xuICAgIHJldHVybiBhZGRJdGVtKHtcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICB0ZXh0OiB0ZXh0XG4gICAgfSk7XG4gIH07XG4gIHNlcUFjdGlvbnMgPSBmdW5jdGlvbihlYWNoKSB7XG4gICAgdmFyIGVtaXRBY3Rpb24sIHNlY3Rpb25zLCBzbWFsbGVyO1xuICAgIHNtYWxsZXIgPSAwO1xuICAgIHNlY3Rpb25zID0gbm93U2VjdGlvbnMoKG5ldyBEYXRlKS5nZXRUaW1lKCkpO1xuICAgIGVtaXRBY3Rpb24gPSBmdW5jdGlvbihpKSB7XG4gICAgICB2YXIgYWN0aW9uLCBiaWdnZXIsIGosIGxlbiwgc2VjdGlvbiwgc2VwYXJhdG9yO1xuICAgICAgaWYgKGkgPj0gcGFnZS5qb3VybmFsLmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhY3Rpb24gPSBwYWdlLmpvdXJuYWxbaV0gfHwge307XG4gICAgICBiaWdnZXIgPSBhY3Rpb24uZGF0ZSB8fCAwO1xuICAgICAgc2VwYXJhdG9yID0gbnVsbDtcbiAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHNlY3Rpb25zLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICAgIHNlY3Rpb24gPSBzZWN0aW9uc1tqXTtcbiAgICAgICAgaWYgKHNlY3Rpb24uZGF0ZSA+IHNtYWxsZXIgJiYgc2VjdGlvbi5kYXRlIDwgYmlnZ2VyKSB7XG4gICAgICAgICAgc2VwYXJhdG9yID0gc2VjdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc21hbGxlciA9IGJpZ2dlcjtcbiAgICAgIHJldHVybiBlYWNoKHtcbiAgICAgICAgYWN0aW9uOiBhY3Rpb24sXG4gICAgICAgIHNlcGFyYXRvcjogc2VwYXJhdG9yXG4gICAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGVtaXRBY3Rpb24oaSArIDEpO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gZW1pdEFjdGlvbigwKTtcbiAgfTtcbiAgYmVjb21lID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICByZXR1cm4gcGFnZS5zdG9yeSA9ICh0ZW1wbGF0ZSAhPSBudWxsID8gdGVtcGxhdGUuZ2V0UmF3UGFnZSgpLnN0b3J5IDogdm9pZCAwKSB8fCBbXTtcbiAgfTtcbiAgc2l0ZUxpbmV1cCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXRoLCBzbHVnO1xuICAgIHNsdWcgPSBnZXRTbHVnKCk7XG4gICAgcGF0aCA9IHNsdWcgPT09ICdpbmRleCcgPyBcInZpZXcvaW5kZXhcIiA6IFwidmlldy9pbmRleC92aWV3L1wiICsgc2x1ZztcbiAgICBpZiAoaXNSZW1vdGUoKSkge1xuICAgICAgcmV0dXJuIFwiLy9cIiArIHNpdGUgKyBcIi9cIiArIHBhdGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBcIi9cIiArIHBhdGg7XG4gICAgfVxuICB9O1xuICBub3REdXBsaWNhdGUgPSBmdW5jdGlvbihqb3VybmFsLCBhY3Rpb24pIHtcbiAgICB2YXIgZWFjaCwgaiwgbGVuO1xuICAgIGZvciAoaiA9IDAsIGxlbiA9IGpvdXJuYWwubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgIGVhY2ggPSBqb3VybmFsW2pdO1xuICAgICAgaWYgKGVhY2guaWQgPT09IGFjdGlvbi5pZCAmJiBlYWNoLmRhdGUgPT09IGFjdGlvbi5kYXRlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG4gIG1lcmdlID0gZnVuY3Rpb24odXBkYXRlKSB7XG4gICAgdmFyIGFjdGlvbiwgaiwgbGVuLCBtZXJnZWQsIHJlZjtcbiAgICBtZXJnZWQgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaiwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgICByZWYgPSBwYWdlLmpvdXJuYWw7XG4gICAgICByZXN1bHRzID0gW107XG4gICAgICBmb3IgKGogPSAwLCBsZW4gPSByZWYubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgYWN0aW9uID0gcmVmW2pdO1xuICAgICAgICByZXN1bHRzLnB1c2goYWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0pKCk7XG4gICAgcmVmID0gdXBkYXRlLmdldFJhd1BhZ2UoKS5qb3VybmFsO1xuICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgYWN0aW9uID0gcmVmW2pdO1xuICAgICAgaWYgKG5vdER1cGxpY2F0ZShwYWdlLmpvdXJuYWwsIGFjdGlvbikpIHtcbiAgICAgICAgbWVyZ2VkLnB1c2goYWN0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgbWVyZ2VkLnB1c2goe1xuICAgICAgdHlwZTogJ2ZvcmsnLFxuICAgICAgc2l0ZTogdXBkYXRlLmdldFJlbW90ZVNpdGUoKSxcbiAgICAgIGRhdGU6IChuZXcgRGF0ZSgpKS5nZXRUaW1lKClcbiAgICB9KTtcbiAgICByZXR1cm4gbmV3UGFnZShyZXZpc2lvbi5jcmVhdGUoOTk5LCB7XG4gICAgICB0aXRsZTogcGFnZS50aXRsZSxcbiAgICAgIGpvdXJuYWw6IG1lcmdlZFxuICAgIH0pLCBzaXRlKTtcbiAgfTtcbiAgYXBwbHkgPSBmdW5jdGlvbihhY3Rpb24pIHtcbiAgICByZXZpc2lvbi5hcHBseShwYWdlLCBhY3Rpb24pO1xuICAgIGlmIChhY3Rpb24uc2l0ZSkge1xuICAgICAgcmV0dXJuIHNpdGUgPSBudWxsO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBnZXRSYXdQYWdlOiBnZXRSYXdQYWdlLFxuICAgIGdldENvbnRleHQ6IGdldENvbnRleHQsXG4gICAgaXNQbHVnaW46IGlzUGx1Z2luLFxuICAgIGlzUmVtb3RlOiBpc1JlbW90ZSxcbiAgICBpc0xvY2FsOiBpc0xvY2FsLFxuICAgIGdldFJlbW90ZVNpdGU6IGdldFJlbW90ZVNpdGUsXG4gICAgZ2V0UmVtb3RlU2l0ZURldGFpbHM6IGdldFJlbW90ZVNpdGVEZXRhaWxzLFxuICAgIGdldFNsdWc6IGdldFNsdWcsXG4gICAgZ2V0TmVpZ2hib3JzOiBnZXROZWlnaGJvcnMsXG4gICAgZ2V0VGl0bGU6IGdldFRpdGxlLFxuICAgIHNldFRpdGxlOiBzZXRUaXRsZSxcbiAgICBnZXRSZXZpc2lvbjogZ2V0UmV2aXNpb24sXG4gICAgZ2V0VGltZXN0YW1wOiBnZXRUaW1lc3RhbXAsXG4gICAgYWRkSXRlbTogYWRkSXRlbSxcbiAgICBnZXRJdGVtOiBnZXRJdGVtLFxuICAgIGFkZFBhcmFncmFwaDogYWRkUGFyYWdyYXBoLFxuICAgIHNlcUl0ZW1zOiBzZXFJdGVtcyxcbiAgICBzZXFBY3Rpb25zOiBzZXFBY3Rpb25zLFxuICAgIGJlY29tZTogYmVjb21lLFxuICAgIHNpdGVMaW5ldXA6IHNpdGVMaW5ldXAsXG4gICAgbWVyZ2U6IG1lcmdlLFxuICAgIGFwcGx5OiBhcHBseVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIG5ld1BhZ2U6IG5ld1BhZ2UsXG4gIGFzU2x1ZzogYXNTbHVnLFxuICBwYWdlRW1pdHRlcjogcGFnZUVtaXR0ZXJcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgXywgYWRkVG9Kb3VybmFsLCBkZWVwQ29weSwgbGluZXVwLCBuZXdQYWdlLCBwYWdlRnJvbUxvY2FsU3RvcmFnZSwgcGFnZUhhbmRsZXIsIHB1c2hUb0xvY2FsLCBwdXNoVG9TZXJ2ZXIsIHJhbmRvbSwgcmVjdXJzaXZlR2V0LCByZXZpc2lvbiwgc3RhdGU7XG5cbl8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbnN0YXRlID0gcmVxdWlyZSgnLi9zdGF0ZScpO1xuXG5yZXZpc2lvbiA9IHJlcXVpcmUoJy4vcmV2aXNpb24nKTtcblxuYWRkVG9Kb3VybmFsID0gcmVxdWlyZSgnLi9hZGRUb0pvdXJuYWwnKTtcblxubmV3UGFnZSA9IHJlcXVpcmUoJy4vcGFnZScpLm5ld1BhZ2U7XG5cbnJhbmRvbSA9IHJlcXVpcmUoJy4vcmFuZG9tJyk7XG5cbmxpbmV1cCA9IHJlcXVpcmUoJy4vbGluZXVwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gcGFnZUhhbmRsZXIgPSB7fTtcblxuZGVlcENvcHkgPSBmdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqZWN0KSk7XG59O1xuXG5wYWdlSGFuZGxlci51c2VMb2NhbFN0b3JhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICQoXCIubG9naW5cIikubGVuZ3RoID4gMDtcbn07XG5cbnBhZ2VGcm9tTG9jYWxTdG9yYWdlID0gZnVuY3Rpb24gKHNsdWcpIHtcbiAgICB2YXIganNvbjtcbiAgICBpZiAoanNvbiA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKHNsdWcpKSB7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKGpzb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfVxufTtcblxucmVjdXJzaXZlR2V0ID0gZnVuY3Rpb24gKGFyZykge1xuICAgIHZhciBsb2NhbENvbnRleHQsIGxvY2FsUGFnZSwgcGFnZUluZm9ybWF0aW9uLCByZXYsIHNpdGUsIHNsdWcsIHVybCwgd2hlbkdvdHRlbiwgd2hlbk5vdEdvdHRlbjtcbiAgICBwYWdlSW5mb3JtYXRpb24gPSBhcmcucGFnZUluZm9ybWF0aW9uLCB3aGVuR290dGVuID0gYXJnLndoZW5Hb3R0ZW4sIHdoZW5Ob3RHb3R0ZW4gPSBhcmcud2hlbk5vdEdvdHRlbiwgbG9jYWxDb250ZXh0ID0gYXJnLmxvY2FsQ29udGV4dDtcbiAgICBzbHVnID0gcGFnZUluZm9ybWF0aW9uLnNsdWcsIHJldiA9IHBhZ2VJbmZvcm1hdGlvbi5yZXYsIHNpdGUgPSBwYWdlSW5mb3JtYXRpb24uc2l0ZTtcbiAgICBpZiAoc2l0ZSkge1xuICAgICAgICBsb2NhbENvbnRleHQgPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzaXRlID0gbG9jYWxDb250ZXh0LnNoaWZ0KCk7XG4gICAgfVxuICAgIGlmIChzaXRlID09PSB3aW5kb3cubG9jYXRpb24uaG9zdCkge1xuICAgICAgICBzaXRlID0gJ29yaWdpbic7XG4gICAgfVxuICAgIGlmIChzaXRlID09PSAndmlldycpIHtcbiAgICAgICAgc2l0ZSA9IG51bGw7XG4gICAgfVxuICAgIGlmIChzaXRlICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHNpdGUgPT09ICdsb2NhbCcpIHtcbiAgICAgICAgICAgIGlmIChsb2NhbFBhZ2UgPSBwYWdlRnJvbUxvY2FsU3RvcmFnZShwYWdlSW5mb3JtYXRpb24uc2x1ZykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2hlbkdvdHRlbihuZXdQYWdlKGxvY2FsUGFnZSwgJ2xvY2FsJykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2hlbk5vdEdvdHRlbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNpdGUgPT09ICdvcmlnaW4nKSB7XG4gICAgICAgICAgICAgICAgdXJsID0gXCIvXCIgKyBzbHVnICsgXCIuanNvblwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1cmwgPSBcImh0dHA6Ly9cIiArIHNpdGUgKyBcIi9cIiArIHNsdWcgKyBcIi5qc29uXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB1cmwgPSBcIi9cIiArIHNsdWcgKyBcIi5qc29uXCI7XG4gICAgfVxuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgdXJsOiB1cmwgKyAoXCI/cmFuZG9tPVwiICsgKHJhbmRvbS5yYW5kb21CeXRlcyg0KSkpLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocGFnZSkge1xuICAgICAgICAgICAgaWYgKHJldikge1xuICAgICAgICAgICAgICAgIHBhZ2UgPSByZXZpc2lvbi5jcmVhdGUocmV2LCBwYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB3aGVuR290dGVuKG5ld1BhZ2UocGFnZSwgc2l0ZSkpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24gKHhociwgdHlwZSwgbXNnKSB7XG4gICAgICAgICAgICB2YXIgdHJvdWJsZVBhZ2VPYmplY3Q7XG4gICAgICAgICAgICBpZiAoKHhoci5zdGF0dXMgIT09IDQwNCkgJiYgKHhoci5zdGF0dXMgIT09IDApKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3BhZ2VIYW5kbGVyLmdldCBlcnJvcicsIHhociwgeGhyLnN0YXR1cywgdHlwZSwgbXNnKTtcbiAgICAgICAgICAgICAgICB0cm91YmxlUGFnZU9iamVjdCA9IG5ld1BhZ2Uoe1xuICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJUcm91YmxlOiBDYW4ndCBHZXQgUGFnZVwiXG4gICAgICAgICAgICAgICAgfSwgbnVsbCk7XG4gICAgICAgICAgICAgICAgdHJvdWJsZVBhZ2VPYmplY3QuYWRkUGFyYWdyYXBoKFwiVGhlIHBhZ2UgaGFuZGxlciBoYXMgcnVuIGludG8gcHJvYmxlbXMgd2l0aCB0aGlzICAgcmVxdWVzdC5cXG48cHJlIGNsYXNzPWVycm9yPlwiICsgKEpTT04uc3RyaW5naWZ5KHBhZ2VJbmZvcm1hdGlvbikpICsgXCI8L3ByZT5cXG5UaGUgcmVxdWVzdGVkIHVybC5cXG48cHJlIGNsYXNzPWVycm9yPlwiICsgdXJsICsgXCI8L3ByZT5cXG5UaGUgc2VydmVyIHJlcG9ydGVkIHN0YXR1cy5cXG48cHJlIGNsYXNzPWVycm9yPlwiICsgeGhyLnN0YXR1cyArIFwiPC9wcmU+XFxuVGhlIGVycm9yIHR5cGUuXFxuPHByZSBjbGFzcz1lcnJvcj5cIiArIHR5cGUgKyBcIjwvcHJlPlxcblRoZSBlcnJvciBtZXNzYWdlLlxcbjxwcmUgY2xhc3M9ZXJyb3I+XCIgKyBtc2cgKyBcIjwvcHJlPlxcblRoZXNlIHByb2JsZW1zIGFyZSByYXJlbHkgc29sdmVkIGJ5IHJlcG9ydGluZyBpc3N1ZXMuXFxuVGhlcmUgY291bGQgYmUgYWRkaXRpb25hbCBpbmZvcm1hdGlvbiByZXBvcnRlZCBpbiB0aGUgYnJvd3NlcidzIGNvbnNvbGUubG9nLlxcbk1vcmUgaW5mb3JtYXRpb24gbWlnaHQgYmUgYWNjZXNzaWJsZSBieSBmZXRjaGluZyB0aGUgcGFnZSBvdXRzaWRlIG9mIHdpa2kuXFxuPGEgaHJlZj1cXFwiXCIgKyB1cmwgKyBcIlxcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiPnRyeS1ub3c8L2E+XCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB3aGVuR290dGVuKHRyb3VibGVQYWdlT2JqZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsb2NhbENvbnRleHQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWN1cnNpdmVHZXQoe1xuICAgICAgICAgICAgICAgICAgICBwYWdlSW5mb3JtYXRpb246IHBhZ2VJbmZvcm1hdGlvbixcbiAgICAgICAgICAgICAgICAgICAgd2hlbkdvdHRlbjogd2hlbkdvdHRlbixcbiAgICAgICAgICAgICAgICAgICAgd2hlbk5vdEdvdHRlbjogd2hlbk5vdEdvdHRlbixcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxDb250ZXh0OiBsb2NhbENvbnRleHRcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdoZW5Ob3RHb3R0ZW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxucGFnZUhhbmRsZXIuZ2V0ID0gZnVuY3Rpb24gKGFyZykge1xuICAgIHZhciBsb2NhbFBhZ2UsIHBhZ2VJbmZvcm1hdGlvbiwgd2hlbkdvdHRlbiwgd2hlbk5vdEdvdHRlbjtcbiAgICB3aGVuR290dGVuID0gYXJnLndoZW5Hb3R0ZW4sIHdoZW5Ob3RHb3R0ZW4gPSBhcmcud2hlbk5vdEdvdHRlbiwgcGFnZUluZm9ybWF0aW9uID0gYXJnLnBhZ2VJbmZvcm1hdGlvbjtcbiAgICBpZiAoIXBhZ2VJbmZvcm1hdGlvbi5zaXRlKSB7XG4gICAgICAgIGlmIChsb2NhbFBhZ2UgPSBwYWdlRnJvbUxvY2FsU3RvcmFnZShwYWdlSW5mb3JtYXRpb24uc2x1ZykpIHtcbiAgICAgICAgICAgIGlmIChwYWdlSW5mb3JtYXRpb24ucmV2KSB7XG4gICAgICAgICAgICAgICAgbG9jYWxQYWdlID0gcmV2aXNpb24uY3JlYXRlKHBhZ2VJbmZvcm1hdGlvbi5yZXYsIGxvY2FsUGFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gd2hlbkdvdHRlbihuZXdQYWdlKGxvY2FsUGFnZSwgJ2xvY2FsJykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghcGFnZUhhbmRsZXIuY29udGV4dC5sZW5ndGgpIHtcbiAgICAgICAgcGFnZUhhbmRsZXIuY29udGV4dCA9IFsndmlldyddO1xuICAgIH1cbiAgICByZXR1cm4gcmVjdXJzaXZlR2V0KHtcbiAgICAgICAgcGFnZUluZm9ybWF0aW9uOiBwYWdlSW5mb3JtYXRpb24sXG4gICAgICAgIHdoZW5Hb3R0ZW46IHdoZW5Hb3R0ZW4sXG4gICAgICAgIHdoZW5Ob3RHb3R0ZW46IHdoZW5Ob3RHb3R0ZW4sXG4gICAgICAgIGxvY2FsQ29udGV4dDogXy5jbG9uZShwYWdlSGFuZGxlci5jb250ZXh0KVxuICAgIH0pO1xufTtcblxucGFnZUhhbmRsZXIuY29udGV4dCA9IFtdO1xuXG5wdXNoVG9Mb2NhbCA9IGZ1bmN0aW9uICgkcGFnZSwgcGFnZVB1dEluZm8sIGFjdGlvbikge1xuICAgIHZhciBwYWdlLCBzaXRlO1xuICAgIGlmIChhY3Rpb24udHlwZSA9PT0gJ2NyZWF0ZScpIHtcbiAgICAgICAgcGFnZSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBhY3Rpb24uaXRlbS50aXRsZSxcbiAgICAgICAgICAgIHN0b3J5OiBbXSxcbiAgICAgICAgICAgIGpvdXJuYWw6IFtdXG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGFnZSA9IHBhZ2VGcm9tTG9jYWxTdG9yYWdlKHBhZ2VQdXRJbmZvLnNsdWcpO1xuICAgICAgICBwYWdlIHx8IChwYWdlID0gbGluZXVwLmF0S2V5KCRwYWdlLmRhdGEoJ2tleScpKS5nZXRSYXdQYWdlKCkpO1xuICAgICAgICBpZiAocGFnZS5qb3VybmFsID09IG51bGwpIHtcbiAgICAgICAgICAgIHBhZ2Uuam91cm5hbCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoc2l0ZSA9IGFjdGlvblsnZm9yayddKSAhPSBudWxsKSB7XG4gICAgICAgICAgICBwYWdlLmpvdXJuYWwgPSBwYWdlLmpvdXJuYWwuY29uY2F0KHtcbiAgICAgICAgICAgICAgICAndHlwZSc6ICdmb3JrJyxcbiAgICAgICAgICAgICAgICAnc2l0ZSc6IHNpdGUsXG4gICAgICAgICAgICAgICAgJ2RhdGUnOiAobmV3IERhdGUoKSkuZ2V0VGltZSgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRlbGV0ZSBhY3Rpb25bJ2ZvcmsnXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXZpc2lvbi5hcHBseShwYWdlLCBhY3Rpb24pO1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHBhZ2VQdXRJbmZvLnNsdWcsIEpTT04uc3RyaW5naWZ5KHBhZ2UpKTtcbiAgICBhZGRUb0pvdXJuYWwoJHBhZ2UuZmluZCgnLmpvdXJuYWwnKSwgYWN0aW9uKTtcbiAgICByZXR1cm4gJHBhZ2UuYWRkQ2xhc3MoXCJsb2NhbFwiKTtcbn07XG5cbnB1c2hUb1NlcnZlciA9IGZ1bmN0aW9uICgkcGFnZSwgcGFnZVB1dEluZm8sIGFjdGlvbikge1xuICAgIHZhciBidW5kbGUsIHBhZ2VPYmplY3Q7XG4gICAgYnVuZGxlID0gZGVlcENvcHkoYWN0aW9uKTtcbiAgICBwYWdlT2JqZWN0ID0gbGluZXVwLmF0S2V5KCRwYWdlLmRhdGEoJ2tleScpKTtcbiAgICBpZiAoYWN0aW9uLnR5cGUgPT09ICdmb3JrJykge1xuICAgICAgICBidW5kbGUuaXRlbSA9IGRlZXBDb3B5KHBhZ2VPYmplY3QuZ2V0UmF3UGFnZSgpKTtcbiAgICB9XG4gICAgcmV0dXJuICQuYWpheCh7XG4gICAgICAgIHR5cGU6ICdQVVQnLFxuICAgICAgICB1cmw6IFwiL3BhZ2UvXCIgKyBwYWdlUHV0SW5mby5zbHVnICsgXCIvYWN0aW9uXCIsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICdhY3Rpb24nOiBKU09OLnN0cmluZ2lmeShidW5kbGUpXG4gICAgICAgIH0sXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChwYWdlT2JqZWN0ICE9IG51bGwgPyBwYWdlT2JqZWN0LmFwcGx5IDogdm9pZCAwKSB7XG4gICAgICAgICAgICAgICAgcGFnZU9iamVjdC5hcHBseShhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWRkVG9Kb3VybmFsKCRwYWdlLmZpbmQoJy5qb3VybmFsJyksIGFjdGlvbik7XG4gICAgICAgICAgICBpZiAoYWN0aW9uLnR5cGUgPT09ICdmb3JrJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgkcGFnZS5hdHRyKCdpZCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6IGZ1bmN0aW9uICh4aHIsIHR5cGUsIG1zZykge1xuICAgICAgICAgICAgYWN0aW9uLmVycm9yID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgICAgbXNnOiBtc2csXG4gICAgICAgICAgICAgICAgcmVzcG9uc2U6IHhoci5yZXNwb25zZVRleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gcHVzaFRvTG9jYWwoJHBhZ2UsIHBhZ2VQdXRJbmZvLCBhY3Rpb24pO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5wYWdlSGFuZGxlci5wdXQgPSBmdW5jdGlvbiAoJHBhZ2UsIGFjdGlvbikge1xuICAgIHZhciBjaGVja2VkU2l0ZSwgZm9ya0Zyb20sIHBhZ2VQdXRJbmZvO1xuICAgIGNoZWNrZWRTaXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2l0ZTtcbiAgICAgICAgc3dpdGNoIChzaXRlID0gJHBhZ2UuZGF0YSgnc2l0ZScpKSB7XG4gICAgICAgICAgICBjYXNlICdvcmlnaW4nOlxuICAgICAgICAgICAgY2FzZSAnbG9jYWwnOlxuICAgICAgICAgICAgY2FzZSAndmlldyc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlIGxvY2F0aW9uLmhvc3Q6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybiBzaXRlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBwYWdlUHV0SW5mbyA9IHtcbiAgICAgICAgc2x1ZzogJHBhZ2UuYXR0cignaWQnKS5zcGxpdCgnX3JldicpWzBdLFxuICAgICAgICByZXY6ICRwYWdlLmF0dHIoJ2lkJykuc3BsaXQoJ19yZXYnKVsxXSxcbiAgICAgICAgc2l0ZTogY2hlY2tlZFNpdGUoKSxcbiAgICAgICAgbG9jYWw6ICRwYWdlLmhhc0NsYXNzKCdsb2NhbCcpXG4gICAgfTtcbiAgICBmb3JrRnJvbSA9IHBhZ2VQdXRJbmZvLnNpdGU7XG4gICAgY29uc29sZS5sb2coJ3BhZ2VIYW5kbGVyLnB1dCcsIGFjdGlvbiwgcGFnZVB1dEluZm8pO1xuICAgIGlmIChwYWdlSGFuZGxlci51c2VMb2NhbFN0b3JhZ2UoKSkge1xuICAgICAgICBpZiAocGFnZVB1dEluZm8uc2l0ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygncmVtb3RlID0+IGxvY2FsJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXBhZ2VQdXRJbmZvLmxvY2FsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnb3JpZ2luID0+IGxvY2FsJyk7XG4gICAgICAgICAgICBhY3Rpb24uc2l0ZSA9IGZvcmtGcm9tID0gbG9jYXRpb24uaG9zdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhY3Rpb24uZGF0ZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgaWYgKGFjdGlvbi5zaXRlID09PSAnb3JpZ2luJykge1xuICAgICAgICBkZWxldGUgYWN0aW9uLnNpdGU7XG4gICAgfVxuICAgIGlmIChmb3JrRnJvbSkge1xuICAgICAgICAkcGFnZS5maW5kKCdoMScpLnByb3AoJ3RpdGxlJywgbG9jYXRpb24uaG9zdCk7XG4gICAgICAgICRwYWdlLmZpbmQoJ2gxIGltZycpLmF0dHIoJ3NyYycsICcvZmF2aWNvbi5wbmcnKTtcbiAgICAgICAgJHBhZ2UuZmluZCgnaDEgYScpLmF0dHIoJ2hyZWYnLCBcIi92aWV3L2luZGV4L3ZpZXcvXCIgKyBwYWdlUHV0SW5mby5zbHVnKS5hdHRyKCd0YXJnZXQnLCBsb2NhdGlvbi5ob3N0KTtcbiAgICAgICAgJHBhZ2UuZGF0YSgnc2l0ZScsIG51bGwpO1xuICAgICAgICAkcGFnZS5yZW1vdmVDbGFzcygncmVtb3RlJyk7XG4gICAgICAgIHN0YXRlLnNldFVybCgpO1xuICAgICAgICBpZiAoYWN0aW9uLnR5cGUgIT09ICdmb3JrJykge1xuICAgICAgICAgICAgYWN0aW9uLmZvcmsgPSBmb3JrRnJvbTtcbiAgICAgICAgICAgIGFkZFRvSm91cm5hbCgkcGFnZS5maW5kKCcuam91cm5hbCcpLCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2ZvcmsnLFxuICAgICAgICAgICAgICAgIHNpdGU6IGZvcmtGcm9tLFxuICAgICAgICAgICAgICAgIGRhdGU6IGFjdGlvbi5kYXRlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAocGFnZUhhbmRsZXIudXNlTG9jYWxTdG9yYWdlKCkgfHwgcGFnZVB1dEluZm8uc2l0ZSA9PT0gJ2xvY2FsJykge1xuICAgICAgICByZXR1cm4gcHVzaFRvTG9jYWwoJHBhZ2UsIHBhZ2VQdXRJbmZvLCBhY3Rpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwdXNoVG9TZXJ2ZXIoJHBhZ2UsIHBhZ2VQdXRJbmZvLCBhY3Rpb24pO1xuICAgIH1cbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYmluZCwgZWRpdG9yLCBlbWl0LCBpdGVteiwgcmVzb2x2ZTtcblxuZWRpdG9yID0gcmVxdWlyZSgnLi9lZGl0b3InKTtcblxucmVzb2x2ZSA9IHJlcXVpcmUoJy4vcmVzb2x2ZScpO1xuXG5pdGVteiA9IHJlcXVpcmUoJy4vaXRlbXonKTtcblxuZW1pdCA9IGZ1bmN0aW9uKCRpdGVtLCBpdGVtKSB7XG4gIHZhciBpLCBsZW4sIHJlZiwgcmVzdWx0cywgdGV4dDtcbiAgcmVmID0gaXRlbS50ZXh0LnNwbGl0KC9cXG5cXG4rLyk7XG4gIHJlc3VsdHMgPSBbXTtcbiAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdGV4dCA9IHJlZltpXTtcbiAgICBpZiAodGV4dC5tYXRjaCgvXFxTLykpIHtcbiAgICAgIHJlc3VsdHMucHVzaCgkaXRlbS5hcHBlbmQoXCI8cD5cIiArIChyZXNvbHZlLnJlc29sdmVMaW5rcyh0ZXh0KSkgKyBcIjwvcD5cIikpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG5iaW5kID0gZnVuY3Rpb24oJGl0ZW0sIGl0ZW0pIHtcbiAgcmV0dXJuICRpdGVtLmRibGNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoZS5zaGlmdEtleSkge1xuICAgICAgaXRlbS50eXBlID0gJ2h0bWwnO1xuICAgICAgcmV0dXJuIGl0ZW16LnJlcGxhY2VJdGVtKCRpdGVtLCAncGFyYWdyYXBoJywgaXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBlZGl0b3IudGV4dEVkaXRvcigkaXRlbSwgaXRlbSwge1xuICAgICAgICAnYXBwZW5kJzogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBlbWl0OiBlbWl0LFxuICBiaW5kOiBiaW5kXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvd25lcikge1xuICB2YXIgZmFpbHVyZURsZztcbiAgJChcIiN1c2VyLWVtYWlsXCIpLmhpZGUoKTtcbiAgJChcIiNwZXJzb25hLWxvZ2luLWJ0blwiKS5oaWRlKCk7XG4gICQoXCIjcGVyc29uYS1sb2dvdXQtYnRuXCIpLmhpZGUoKTtcbiAgZmFpbHVyZURsZyA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJChcIjxkaXY+PC9kaXY+XCIpLmRpYWxvZyh7XG4gICAgICBvcGVuOiBmdW5jdGlvbihldmVudCwgdWkpIHtcbiAgICAgICAgcmV0dXJuICQoXCIudWktZGlhbG9nLXRpdGxlYmFyLWNsb3NlXCIpLmhpZGUoKTtcbiAgICAgIH0sXG4gICAgICBidXR0b25zOiB7XG4gICAgICAgIFwiT2tcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJCh0aGlzKS5kaWFsb2coXCJjbG9zZVwiKTtcbiAgICAgICAgICByZXR1cm4gbmF2aWdhdG9yLmlkLmxvZ291dCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY2xvc2U6IGZ1bmN0aW9uKGV2ZW50LCB1aSkge1xuICAgICAgICByZXR1cm4gJCh0aGlzKS5yZW1vdmUoKTtcbiAgICAgIH0sXG4gICAgICByZXNpemFibGU6IGZhbHNlLFxuICAgICAgdGl0bGU6IFwiTG9naW4gRmFpbHVyZVwiLFxuICAgICAgbW9kYWw6IHRydWVcbiAgICB9KS5odG1sKG1lc3NhZ2UpO1xuICB9O1xuICBuYXZpZ2F0b3IuaWQud2F0Y2goe1xuICAgIGxvZ2dlZEluVXNlcjogb3duZXIsXG4gICAgb25sb2dpbjogZnVuY3Rpb24oYXNzZXJ0aW9uKSB7XG4gICAgICByZXR1cm4gJC5wb3N0KFwiL3BlcnNvbmFfbG9naW5cIiwge1xuICAgICAgICBhc3NlcnRpb246IGFzc2VydGlvblxuICAgICAgfSwgZnVuY3Rpb24odmVyaWZpZWQpIHtcbiAgICAgICAgdmFyIGZhaWx1cmVNc2c7XG4gICAgICAgIHZlcmlmaWVkID0gSlNPTi5wYXJzZSh2ZXJpZmllZCk7XG4gICAgICAgIGlmIChcIm9rYXlcIiA9PT0gdmVyaWZpZWQuc3RhdHVzKSB7XG4gICAgICAgICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbiA9IFwiL1wiO1xuICAgICAgICB9IGVsc2UgaWYgKFwid3JvbmctYWRkcmVzc1wiID09PSB2ZXJpZmllZC5zdGF0dXMpIHtcbiAgICAgICAgICByZXR1cm4gZmFpbHVyZURsZyhcIjxwPlNpZ24gaW4gaXMgY3VycmVudGx5IG9ubHkgYXZhaWxhYmxlIGZvciB0aGUgc2l0ZSBvd25lci48L3A+XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKFwiZmFpbHVyZVwiID09PSB2ZXJpZmllZC5zdGF0dXMpIHtcbiAgICAgICAgICBpZiAoL2RvbWFpbiBtaXNtYXRjaC8udGVzdCh2ZXJpZmllZC5yZWFzb24pKSB7XG4gICAgICAgICAgICBmYWlsdXJlTXNnID0gXCI8cD5JdCBsb29rcyBhcyBpZiB5b3UgYXJlIGFjY2Vzc2luZyB0aGUgc2l0ZSB1c2luZyBhbiBhbHRlcm5hdGl2ZSBhZGRyZXNzLjwvcD5cIiArIFwiPHA+UGxlYXNlIGNoZWNrIHRoYXQgeW91IGFyZSB1c2luZyB0aGUgY29ycmVjdCBhZGRyZXNzIHRvIGFjY2VzcyB0aGlzIHNpdGUuPC9wPlwiO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmYWlsdXJlTXNnID0gXCI8cD5VbmFibGUgdG8gbG9nIHlvdSBpbi48L3A+XCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWlsdXJlRGxnKGZhaWx1cmVNc2cpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuYXZpZ2F0b3IuaWQubG9nb3V0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0sXG4gICAgb25sb2dvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICQucG9zdChcIi9wZXJzb25hX2xvZ291dFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbiA9IFwiL1wiO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBvbnJlYWR5OiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChvd25lcikge1xuICAgICAgICAkKFwiI3BlcnNvbmEtbG9naW4tYnRuXCIpLmhpZGUoKTtcbiAgICAgICAgcmV0dXJuICQoXCIjcGVyc29uYS1sb2dvdXQtYnRuXCIpLnNob3coKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICQoXCIjcGVyc29uYS1sb2dpbi1idG5cIikuc2hvdygpO1xuICAgICAgICByZXR1cm4gJChcIiNwZXJzb25hLWxvZ291dC1idG5cIikuaGlkZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG4gICQoXCIjcGVyc29uYS1sb2dpbi1idG5cIikuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICByZXR1cm4gbmF2aWdhdG9yLmlkLnJlcXVlc3Qoe30pO1xuICB9KTtcbiAgcmV0dXJuICQoXCIjcGVyc29uYS1sb2dvdXQtYnRuXCIpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5pZC5sb2dvdXQoKTtcbiAgfSk7XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGNhY2hlZFNjcmlwdCwgZXNjYXBlLCBnZXRTY3JpcHQsIHBsdWdpbiwgc2NyaXB0cyxcbiAgICBpbmRleE9mID0gW10uaW5kZXhPZiB8fCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgIH07XG5cbm1vZHVsZS5leHBvcnRzID0gcGx1Z2luID0ge307XG5cbmVzY2FwZSA9IGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuICgnJyArIHMpLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JykucmVwbGFjZSgvJy9nLCAnJiN4Mjc7JykucmVwbGFjZSgvXFwvL2csICcmI3gyRjsnKTtcbn07XG5cbmNhY2hlZFNjcmlwdCA9IGZ1bmN0aW9uICh1cmwsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gJC5leHRlbmQob3B0aW9ucyB8fCB7fSwge1xuICAgICAgICBkYXRhVHlwZTogXCJzY3JpcHRcIixcbiAgICAgICAgY2FjaGU6IHRydWUsXG4gICAgICAgIHVybDogdXJsXG4gICAgfSk7XG4gICAgcmV0dXJuICQuYWpheChvcHRpb25zKTtcbn07XG5cbnNjcmlwdHMgPSBbXTtcblxuZ2V0U2NyaXB0ID0gcGx1Z2luLmdldFNjcmlwdCA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgaWYgKGNhbGxiYWNrID09IG51bGwpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChpbmRleE9mLmNhbGwoc2NyaXB0cywgdXJsKSA+PSAwKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjYWNoZWRTY3JpcHQodXJsKS5kb25lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNjcmlwdHMucHVzaCh1cmwpO1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbnBsdWdpbi5nZXQgPSBwbHVnaW4uZ2V0UGx1Z2luID0gZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgaWYgKHdpbmRvdy5wbHVnaW5zW25hbWVdKSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayh3aW5kb3cucGx1Z2luc1tuYW1lXSk7XG4gICAgfVxuICAgIHJldHVybiBnZXRTY3JpcHQoXCIvcGx1Z2lucy9cIiArIG5hbWUgKyBcIi9cIiArIG5hbWUgKyBcIi5qc1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh3aW5kb3cucGx1Z2luc1tuYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHdpbmRvdy5wbHVnaW5zW25hbWVdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0U2NyaXB0KFwiL3BsdWdpbnMvXCIgKyBuYW1lICsgXCIuanNcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKHdpbmRvdy5wbHVnaW5zW25hbWVdKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5wbHVnaW5bXCJkb1wiXSA9IHBsdWdpbi5kb1BsdWdpbiA9IGZ1bmN0aW9uIChkaXYsIGl0ZW0sIGRvbmUpIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGRvbmUgPT0gbnVsbCkge1xuICAgICAgICBkb25lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB9O1xuICAgIH1cbiAgICBlcnJvciA9IGZ1bmN0aW9uIChleCwgc2NyaXB0KSB7XG4gICAgICAgIGRpdi5hcHBlbmQoXCI8ZGl2IGNsYXNzPVxcXCJlcnJvclxcXCI+XFxuICBcIiArIChlc2NhcGUoaXRlbS50ZXh0IHx8IFwiXCIpKSArIFwiXFxuICA8YnV0dG9uPmhlbHA8L2J1dHRvbj48YnI+XFxuPC9kaXY+XCIpO1xuICAgICAgICByZXR1cm4gZGl2LmZpbmQoJ2J1dHRvbicpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpa2kuZGlhbG9nKGV4LnRvU3RyaW5nKCksIFwiPHA+IFRoaXMgXFxcIlwiICsgaXRlbS50eXBlICsgXCJcXFwiIHBsdWdpbiB3b24ndCBzaG93LjwvcD5cXG48bGk+IElzIGl0IGF2YWlsYWJsZSBvbiB0aGlzIHNlcnZlcj9cXG48bGk+IElzIGl0cyBtYXJrdXAgY29ycmVjdD9cXG48bGk+IENhbiBpdCBmaW5kIG5lY2Vzc2FyeSBkYXRhP1xcbjxsaT4gSGFzIG5ldHdvcmsgYWNjZXNzIGJlZW4gaW50ZXJydXB0ZWQ/XFxuPGxpPiBIYXMgaXRzIGNvZGUgYmVlbiB0ZXN0ZWQ/XFxuPHA+IERldmVsb3BlcnMgbWF5IG9wZW4gZGVidWdnaW5nIHRvb2xzIGFuZCByZXRyeSB0aGUgcGx1Z2luLjwvcD5cXG48YnV0dG9uIGNsYXNzPVxcXCJyZXRyeVxcXCI+cmV0cnk8L2J1dHRvbj5cXG48cD4gTGVhcm4gbW9yZVxcbiAgPGEgY2xhc3M9XFxcImV4dGVybmFsXFxcIiB0YXJnZXQ9XFxcIl9ibGFua1xcXCIgcmVsPVxcXCJub2ZvbGxvd1xcXCJcXG4gIGhyZWY9XFxcImh0dHA6Ly9wbHVnaW5zLmZlZC53aWtpLm9yZy9hYm91dC1wbHVnaW5zLmh0bWxcXFwiXFxuICB0aXRsZT1cXFwiaHR0cDovL3BsdWdpbnMuZmVkLndpa2kub3JnL2Fib3V0LXBsdWdpbnMuaHRtbFxcXCI+XFxuICAgIEFib3V0IFBsdWdpbnNcXG4gICAgPGltZyBzcmM9XFxcIi9pbWFnZXMvZXh0ZXJuYWwtbGluay1sdHItaWNvbi5wbmdcXFwiPlxcbiAgPC9hPlxcbjwvcD5cIik7XG4gICAgICAgICAgICByZXR1cm4gJCgnLnJldHJ5Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChzY3JpcHQuZW1pdC5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzY3JpcHQuZW1pdChkaXYsIGl0ZW0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjcmlwdC5iaW5kKGRpdiwgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzY3JpcHQuZW1pdChkaXYsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICBzY3JpcHQuYmluZChkaXYsIGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIGRpdi5kYXRhKCdwYWdlRWxlbWVudCcsIGRpdi5wYXJlbnRzKFwiLnBhZ2VcIikpO1xuICAgIGRpdi5kYXRhKCdpdGVtJywgaXRlbSk7XG4gICAgcmV0dXJuIHBsdWdpbi5nZXQoaXRlbS50eXBlLCBmdW5jdGlvbiAoc2NyaXB0KSB7XG4gICAgICAgIHZhciBlcnI7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAoc2NyaXB0ID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBmaW5kIHBsdWdpbiBmb3IgJ1wiICsgaXRlbS50eXBlICsgXCInXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNjcmlwdC5lbWl0Lmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2NyaXB0LmVtaXQoZGl2LCBpdGVtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjcmlwdC5iaW5kKGRpdiwgaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjcmlwdC5lbWl0KGRpdiwgaXRlbSk7XG4gICAgICAgICAgICAgICAgc2NyaXB0LmJpbmQoZGl2LCBpdGVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgICAgIGVyciA9IF9lcnJvcjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwbHVnaW4gZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgZXJyb3IoZXJyLCBzY3JpcHQpO1xuICAgICAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxucGx1Z2luLnJlZ2lzdGVyUGx1Z2luID0gZnVuY3Rpb24gKHBsdWdpbk5hbWUsIHBsdWdpbkZuKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5wbHVnaW5zW3BsdWdpbk5hbWVdID0gcGx1Z2luRm4oJCk7XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxud2luZG93LnBsdWdpbnMgPSB7XG4gIHJlZmVyZW5jZTogcmVxdWlyZSgnLi9yZWZlcmVuY2UnKSxcbiAgZmFjdG9yeTogcmVxdWlyZSgnLi9mYWN0b3J5JyksXG4gIHBhcmFncmFwaDogcmVxdWlyZSgnLi9wYXJhZ3JhcGgnKSxcbiAgaW1hZ2U6IHJlcXVpcmUoJy4vaW1hZ2UnKSxcbiAgZnV0dXJlOiByZXF1aXJlKCcuL2Z1dHVyZScpXG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBpdGVtSWQsIHJhbmRvbUJ5dGUsIHJhbmRvbUJ5dGVzO1xuXG52YXIgcmNoYXJzID0gXCIwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYVFphYmNkZWZnaGlrbG1ub3BxcnN0dXZ3eHl6X1wiO1xucmFuZG9tQnl0ZXMgPSBmdW5jdGlvbiAobikge1xuICAgIHZhciByID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgciArPSByY2hhcnNbIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHJjaGFycy5sZW5ndGgpIF07XG4gICAgfVxuICAgIHJldHVybiByO1xufVxuXG5yYW5kb21CeXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByYW5kb21CeXRlcygxKTtcbiAgICAvL3JldHVybiAoKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMCkgfCAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xufTtcblxuLy9cbi8vcmFuZG9tQnl0ZXMgPSBmdW5jdGlvbihuKSB7XG4vLyAgcmV0dXJuICgoZnVuY3Rpb24oKSB7XG4vLyAgICB2YXIgaSwgcmVmLCByZXN1bHRzO1xuLy8gICAgcmVzdWx0cyA9IFtdO1xuLy8gICAgZm9yIChpID0gMSwgcmVmID0gbjsgMSA8PSByZWYgPyBpIDw9IHJlZiA6IGkgPj0gcmVmOyAxIDw9IHJlZiA/IGkrKyA6IGktLSkge1xuLy8gICAgICByZXN1bHRzLnB1c2gocmFuZG9tQnl0ZSgpKTtcbi8vICAgIH1cbi8vICAgIHJldHVybiByZXN1bHRzO1xuLy8gIH0pKCkpLmpvaW4oJycpO1xuLy99O1xuXG5pdGVtSWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHJhbmRvbUJ5dGVzKDgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcmFuZG9tQnl0ZTogcmFuZG9tQnl0ZSxcbiAgICByYW5kb21CeXRlczogcmFuZG9tQnl0ZXMsXG4gICAgaXRlbUlkOiBpdGVtSWRcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYmluZCwgZWRpdG9yLCBlbWl0LCBwYWdlLCByZXNvbHZlO1xuXG5lZGl0b3IgPSByZXF1aXJlKCcuL2VkaXRvcicpO1xuXG5yZXNvbHZlID0gcmVxdWlyZSgnLi9yZXNvbHZlJyk7XG5cbnBhZ2UgPSByZXF1aXJlKCcuL3BhZ2UnKTtcblxuZW1pdCA9IGZ1bmN0aW9uKCRpdGVtLCBpdGVtKSB7XG4gIHZhciBzaXRlLCBzbHVnO1xuICBzbHVnID0gaXRlbS5zbHVnO1xuICBpZiAoaXRlbS50aXRsZSAhPSBudWxsKSB7XG4gICAgc2x1ZyB8fCAoc2x1ZyA9IHBhZ2UuYXNTbHVnKGl0ZW0udGl0bGUpKTtcbiAgfVxuICBzbHVnIHx8IChzbHVnID0gJ2luZGV4Jyk7XG4gIHNpdGUgPSBpdGVtLnNpdGU7XG4gIHJldHVybiByZXNvbHZlLnJlc29sdmVGcm9tKHNpdGUsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkaXRlbS5hcHBlbmQoXCI8cCBzdHlsZT0nbWFyZ2luLWJvdHRvbTozcHg7Jz5cXG4gIDxpbWcgY2xhc3M9J3JlbW90ZSdcXG4gICAgc3JjPScvL1wiICsgc2l0ZSArIFwiL2Zhdmljb24ucG5nJ1xcbiAgICB0aXRsZT0nXCIgKyBzaXRlICsgXCInXFxuICAgIGRhdGEtc2l0ZT1cXFwiXCIgKyBzaXRlICsgXCJcXFwiXFxuICAgIGRhdGEtc2x1Zz1cXFwiXCIgKyBzbHVnICsgXCJcXFwiXFxuICA+XFxuICBcIiArIChyZXNvbHZlLnJlc29sdmVMaW5rcyhcIltbXCIgKyAoaXRlbS50aXRsZSB8fCBzbHVnKSArIFwiXV1cIikpICsgXCJcXG48L3A+XFxuPGRpdj5cXG4gIFwiICsgKHJlc29sdmUucmVzb2x2ZUxpbmtzKGl0ZW0udGV4dCkpICsgXCJcXG48L2Rpdj5cIik7XG4gIH0pO1xufTtcblxuYmluZCA9IGZ1bmN0aW9uKCRpdGVtLCBpdGVtKSB7XG4gIHJldHVybiAkaXRlbS5kYmxjbGljayhmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZWRpdG9yLnRleHRFZGl0b3IoJGl0ZW0sIGl0ZW0pO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBlbWl0OiBlbWl0LFxuICBiaW5kOiBiaW5kXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIF8sIGFjdGlvblN5bWJvbHMsIGFkZFRvSm91cm5hbCwgYWxpYXNJdGVtLCBhc1NsdWcsIGJ1aWxkUGFnZSwgY3JlYXRlRmFjdG9yeSwgY3JlYXRlTWlzc2luZ0ZsYWcsIGN5Y2xlLCBlZGl0RGF0ZSwgZW1pdENvbnRyb2xzLCBlbWl0Rm9vdGVyLCBlbWl0SGVhZGVyLCBlbWl0VGltZXN0YW1wLCBlbWl0VHdpbnMsIGdldEl0ZW0sIGdldFBhZ2VPYmplY3QsIGhhbmRsZURyYWdnaW5nLCBoYW5kbGVIZWFkZXJDbGljaywgaGFuZGxlTWVyZ2luZywgaW5pdEFkZEJ1dHRvbiwgaW5pdERyYWdnaW5nLCBpbml0TWVyZ2luZywgbGluZXVwLCBuZWlnaGJvcmhvb2QsIG5ld1BhZ2UsIHBhZ2VFbWl0dGVyLCBwYWdlSGFuZGxlciwgcGFnZU1vZHVsZSwgcGx1Z2luLCByYW5kb20sIHJlYnVpbGRQYWdlLCByZW5kZXJQYWdlSW50b1BhZ2VFbGVtZW50LCByZXNvbHZlLCBzdGF0ZTtcblxuXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKTtcblxucGFnZUhhbmRsZXIgPSByZXF1aXJlKCcuL3BhZ2VIYW5kbGVyJyk7XG5cbnBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJyk7XG5cbnN0YXRlID0gcmVxdWlyZSgnLi9zdGF0ZScpO1xuXG5uZWlnaGJvcmhvb2QgPSByZXF1aXJlKCcuL25laWdoYm9yaG9vZCcpO1xuXG5hZGRUb0pvdXJuYWwgPSByZXF1aXJlKCcuL2FkZFRvSm91cm5hbCcpO1xuXG5hY3Rpb25TeW1ib2xzID0gcmVxdWlyZSgnLi9hY3Rpb25TeW1ib2xzJyk7XG5cbmxpbmV1cCA9IHJlcXVpcmUoJy4vbGluZXVwJyk7XG5cbnJlc29sdmUgPSByZXF1aXJlKCcuL3Jlc29sdmUnKTtcblxucmFuZG9tID0gcmVxdWlyZSgnLi9yYW5kb20nKTtcblxucGFnZU1vZHVsZSA9IHJlcXVpcmUoJy4vcGFnZScpO1xuXG5uZXdQYWdlID0gcGFnZU1vZHVsZS5uZXdQYWdlO1xuXG5hc1NsdWcgPSBwYWdlTW9kdWxlLmFzU2x1ZztcblxucGFnZUVtaXR0ZXIgPSBwYWdlTW9kdWxlLnBhZ2VFbWl0dGVyO1xuXG5nZXRJdGVtID0gZnVuY3Rpb24oJGl0ZW0pIHtcbiAgaWYgKCQoJGl0ZW0pLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gJCgkaXRlbSkuZGF0YShcIml0ZW1cIikgfHwgJCgkaXRlbSkuZGF0YSgnc3RhdGljSXRlbScpO1xuICB9XG59O1xuXG5hbGlhc0l0ZW0gPSBmdW5jdGlvbigkcGFnZSwgJGl0ZW0sIG9sZEl0ZW0pIHtcbiAgdmFyIGl0ZW0sIHBhZ2VPYmplY3Q7XG4gIGl0ZW0gPSAkLmV4dGVuZCh7fSwgb2xkSXRlbSk7XG4gIHBhZ2VPYmplY3QgPSBsaW5ldXAuYXRLZXkoJHBhZ2UuZGF0YSgna2V5JykpO1xuICBpZiAocGFnZU9iamVjdC5nZXRJdGVtKGl0ZW0uaWQpICE9IG51bGwpIHtcbiAgICBpdGVtLmFsaWFzIHx8IChpdGVtLmFsaWFzID0gaXRlbS5pZCk7XG4gICAgaXRlbS5pZCA9IHJhbmRvbS5pdGVtSWQoKTtcbiAgICAkaXRlbS5hdHRyKCdkYXRhLWlkJywgaXRlbS5pZCk7XG4gIH0gZWxzZSBpZiAoaXRlbS5hbGlhcyAhPSBudWxsKSB7XG4gICAgaWYgKHBhZ2VPYmplY3QuZ2V0SXRlbShpdGVtLmFsaWFzKSA9PSBudWxsKSB7XG4gICAgICBpdGVtLmlkID0gaXRlbS5hbGlhcztcbiAgICAgIGRlbGV0ZSBpdGVtLmFsaWFzO1xuICAgICAgJGl0ZW0uYXR0cignZGF0YS1pZCcsIGl0ZW0uaWQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gaXRlbTtcbn07XG5cbmhhbmRsZURyYWdnaW5nID0gZnVuY3Rpb24oZXZ0LCB1aSkge1xuICB2YXIgJGJlZm9yZSwgJGRlc3RpbmF0aW9uUGFnZSwgJGl0ZW0sICRzb3VyY2VQYWdlLCAkdGhpc1BhZ2UsIGFjdGlvbiwgYmVmb3JlLCBlcXVhbHMsIGl0ZW0sIG1vdmVGcm9tUGFnZSwgbW92ZVRvUGFnZSwgbW92ZVdpdGhpblBhZ2UsIG9yZGVyLCBzb3VyY2VTaXRlO1xuICAkaXRlbSA9IHVpLml0ZW07XG4gIGl0ZW0gPSBnZXRJdGVtKCRpdGVtKTtcbiAgJHRoaXNQYWdlID0gJCh0aGlzKS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICAkc291cmNlUGFnZSA9ICRpdGVtLmRhdGEoJ3BhZ2VFbGVtZW50Jyk7XG4gIHNvdXJjZVNpdGUgPSAkc291cmNlUGFnZS5kYXRhKCdzaXRlJyk7XG4gICRkZXN0aW5hdGlvblBhZ2UgPSAkaXRlbS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpO1xuICBlcXVhbHMgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGEgJiYgYiAmJiBhLmdldCgwKSA9PT0gYi5nZXQoMCk7XG4gIH07XG4gIG1vdmVXaXRoaW5QYWdlID0gISRzb3VyY2VQYWdlIHx8IGVxdWFscygkc291cmNlUGFnZSwgJGRlc3RpbmF0aW9uUGFnZSk7XG4gIG1vdmVGcm9tUGFnZSA9ICFtb3ZlV2l0aGluUGFnZSAmJiBlcXVhbHMoJHRoaXNQYWdlLCAkc291cmNlUGFnZSk7XG4gIG1vdmVUb1BhZ2UgPSAhbW92ZVdpdGhpblBhZ2UgJiYgZXF1YWxzKCR0aGlzUGFnZSwgJGRlc3RpbmF0aW9uUGFnZSk7XG4gIGlmIChtb3ZlRnJvbVBhZ2UpIHtcbiAgICBpZiAoJHNvdXJjZVBhZ2UuaGFzQ2xhc3MoJ2dob3N0JykgfHwgJHNvdXJjZVBhZ2UuYXR0cignaWQnKSA9PT0gJGRlc3RpbmF0aW9uUGFnZS5hdHRyKCdpZCcpIHx8IGV2dC5zaGlmdEtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuICBhY3Rpb24gPSBtb3ZlV2l0aGluUGFnZSA/IChvcmRlciA9ICQodGhpcykuY2hpbGRyZW4oKS5tYXAoZnVuY3Rpb24oXywgdmFsdWUpIHtcbiAgICByZXR1cm4gJCh2YWx1ZSkuYXR0cignZGF0YS1pZCcpO1xuICB9KS5nZXQoKSwge1xuICAgIHR5cGU6ICdtb3ZlJyxcbiAgICBvcmRlcjogb3JkZXJcbiAgfSkgOiBtb3ZlRnJvbVBhZ2UgPyAoY29uc29sZS5sb2coJ2RyYWcgZnJvbScsICRzb3VyY2VQYWdlLmZpbmQoJ2gxJykudGV4dCgpKSwge1xuICAgIHR5cGU6ICdyZW1vdmUnXG4gIH0pIDogbW92ZVRvUGFnZSA/ICgkaXRlbS5kYXRhKCdwYWdlRWxlbWVudCcsICR0aGlzUGFnZSksICRiZWZvcmUgPSAkaXRlbS5wcmV2KCcuaXRlbScpLCBiZWZvcmUgPSBnZXRJdGVtKCRiZWZvcmUpLCBpdGVtID0gYWxpYXNJdGVtKCR0aGlzUGFnZSwgJGl0ZW0sIGl0ZW0pLCB7XG4gICAgdHlwZTogJ2FkZCcsXG4gICAgaXRlbTogaXRlbSxcbiAgICBhZnRlcjogYmVmb3JlICE9IG51bGwgPyBiZWZvcmUuaWQgOiB2b2lkIDBcbiAgfSkgOiB2b2lkIDA7XG4gIGFjdGlvbi5pZCA9IGl0ZW0uaWQ7XG4gIHJldHVybiBwYWdlSGFuZGxlci5wdXQoJHRoaXNQYWdlLCBhY3Rpb24pO1xufTtcblxuaW5pdERyYWdnaW5nID0gZnVuY3Rpb24oJHBhZ2UpIHtcbiAgdmFyICRzdG9yeSwgb3B0aW9ucztcbiAgb3B0aW9ucyA9IHtcbiAgICBjb25uZWN0V2l0aDogJy5wYWdlIC5zdG9yeScsXG4gICAgcGxhY2Vob2xkZXI6ICdpdGVtLXBsYWNlaG9sZGVyJyxcbiAgICBmb3JjZVBsYWNlaG9sZGVyU2l6ZTogdHJ1ZVxuICB9O1xuICAkc3RvcnkgPSAkcGFnZS5maW5kKCcuc3RvcnknKTtcbiAgcmV0dXJuICRzdG9yeS5zb3J0YWJsZShvcHRpb25zKS5vbignc29ydHVwZGF0ZScsIGhhbmRsZURyYWdnaW5nKTtcbn07XG5cbmdldFBhZ2VPYmplY3QgPSBmdW5jdGlvbigkam91cm5hbCkge1xuICB2YXIgJHBhZ2U7XG4gICRwYWdlID0gJCgkam91cm5hbCkucGFyZW50cygnLnBhZ2U6Zmlyc3QnKTtcbiAgcmV0dXJuIGxpbmV1cC5hdEtleSgkcGFnZS5kYXRhKCdrZXknKSk7XG59O1xuXG5oYW5kbGVNZXJnaW5nID0gZnVuY3Rpb24oZXZlbnQsIHVpKSB7XG4gIHZhciBkcmFnLCBkcm9wO1xuICBkcmFnID0gZ2V0UGFnZU9iamVjdCh1aS5kcmFnZ2FibGUpO1xuICBkcm9wID0gZ2V0UGFnZU9iamVjdChldmVudC50YXJnZXQpO1xuICByZXR1cm4gcGFnZUVtaXR0ZXIuZW1pdCgnc2hvdycsIGRyb3AubWVyZ2UoZHJhZykpO1xufTtcblxuaW5pdE1lcmdpbmcgPSBmdW5jdGlvbigkcGFnZSkge1xuICB2YXIgJGpvdXJuYWw7XG4gICRqb3VybmFsID0gJHBhZ2UuZmluZCgnLmpvdXJuYWwnKTtcbiAgJGpvdXJuYWwuZHJhZ2dhYmxlKHtcbiAgICByZXZlcnQ6IHRydWUsXG4gICAgYXBwZW5kVG86ICcubWFpbicsXG4gICAgc2Nyb2xsOiBmYWxzZSxcbiAgICBoZWxwZXI6ICdjbG9uZSdcbiAgfSk7XG4gIHJldHVybiAkam91cm5hbC5kcm9wcGFibGUoe1xuICAgIGhvdmVyQ2xhc3M6IFwidWktc3RhdGUtaG92ZXJcIixcbiAgICBkcm9wOiBoYW5kbGVNZXJnaW5nXG4gIH0pO1xufTtcblxuaW5pdEFkZEJ1dHRvbiA9IGZ1bmN0aW9uKCRwYWdlKSB7XG4gIHJldHVybiAkcGFnZS5maW5kKFwiLmFkZC1mYWN0b3J5XCIpLmxpdmUoXCJjbGlja1wiLCBmdW5jdGlvbihldnQpIHtcbiAgICBpZiAoJHBhZ2UuaGFzQ2xhc3MoJ2dob3N0JykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG4gICAgcmV0dXJuIGNyZWF0ZUZhY3RvcnkoJHBhZ2UpO1xuICB9KTtcbn07XG5cbmNyZWF0ZUZhY3RvcnkgPSBmdW5jdGlvbigkcGFnZSkge1xuICB2YXIgJGJlZm9yZSwgJGl0ZW0sIGJlZm9yZSwgaXRlbTtcbiAgaXRlbSA9IHtcbiAgICB0eXBlOiBcImZhY3RvcnlcIixcbiAgICBpZDogcmFuZG9tLml0ZW1JZCgpXG4gIH07XG4gICRpdGVtID0gJChcIjxkaXYgLz5cIiwge1xuICAgIFwiY2xhc3NcIjogXCJpdGVtIGZhY3RvcnlcIlxuICB9KS5kYXRhKCdpdGVtJywgaXRlbSkuYXR0cignZGF0YS1pZCcsIGl0ZW0uaWQpO1xuICAkaXRlbS5kYXRhKCdwYWdlRWxlbWVudCcsICRwYWdlKTtcbiAgJHBhZ2UuZmluZChcIi5zdG9yeVwiKS5hcHBlbmQoJGl0ZW0pO1xuICBwbHVnaW5bXCJkb1wiXSgkaXRlbSwgaXRlbSk7XG4gICRiZWZvcmUgPSAkaXRlbS5wcmV2KCcuaXRlbScpO1xuICBiZWZvcmUgPSBnZXRJdGVtKCRiZWZvcmUpO1xuICByZXR1cm4gcGFnZUhhbmRsZXIucHV0KCRwYWdlLCB7XG4gICAgaXRlbTogaXRlbSxcbiAgICBpZDogaXRlbS5pZCxcbiAgICB0eXBlOiBcImFkZFwiLFxuICAgIGFmdGVyOiBiZWZvcmUgIT0gbnVsbCA/IGJlZm9yZS5pZCA6IHZvaWQgMFxuICB9KTtcbn07XG5cbmhhbmRsZUhlYWRlckNsaWNrID0gZnVuY3Rpb24oZSkge1xuICB2YXIgJHBhZ2UsIGNydW1icywgZWFjaCwgbmV3V2luZG93LCB0YXJnZXQ7XG4gIGUucHJldmVudERlZmF1bHQoKTtcbiAgbGluZXVwLmRlYnVnU2VsZkNoZWNrKChmdW5jdGlvbigpIHtcbiAgICB2YXIgaiwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gJCgnLnBhZ2UnKTtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBlYWNoID0gcmVmW2pdO1xuICAgICAgcmVzdWx0cy5wdXNoKCQoZWFjaCkuZGF0YSgna2V5JykpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfSkoKSk7XG4gICRwYWdlID0gJChlLnRhcmdldCkucGFyZW50cygnLnBhZ2U6Zmlyc3QnKTtcbiAgY3J1bWJzID0gbGluZXVwLmNydW1icygkcGFnZS5kYXRhKCdrZXknKSwgbG9jYXRpb24uaG9zdCk7XG4gIHRhcmdldCA9IGNydW1ic1swXTtcbiAgbmV3V2luZG93ID0gd2luZG93Lm9wZW4oXCIvL1wiICsgKGNydW1icy5qb2luKCcvJykpLCB0YXJnZXQpO1xuICByZXR1cm4gbmV3V2luZG93LmZvY3VzKCk7XG59O1xuXG5lbWl0SGVhZGVyID0gZnVuY3Rpb24oJGhlYWRlciwgJHBhZ2UsIHBhZ2VPYmplY3QpIHtcbiAgdmFyIHJlbW90ZSwgdG9vbHRpcDtcbiAgcmVtb3RlID0gcGFnZU9iamVjdC5nZXRSZW1vdGVTaXRlKGxvY2F0aW9uLmhvc3QpO1xuICB0b29sdGlwID0gcGFnZU9iamVjdC5nZXRSZW1vdGVTaXRlRGV0YWlscyhsb2NhdGlvbi5ob3N0KTtcbiAgJGhlYWRlci5hcHBlbmQoXCI8aDEgdGl0bGU9XFxcIlwiICsgdG9vbHRpcCArIFwiXFxcIj5cXG4gIDxhIGhyZWY9XFxcIlwiICsgKHBhZ2VPYmplY3Quc2l0ZUxpbmV1cCgpKSArIFwiXFxcIiB0YXJnZXQ9XFxcIlwiICsgcmVtb3RlICsgXCJcXFwiPlxcbiAgICA8aW1nIHNyYz1cXFwiLy9cIiArIHJlbW90ZSArIFwiL2Zhdmljb24ucG5nXFxcIiBoZWlnaHQ9XFxcIjMycHhcXFwiIGNsYXNzPVxcXCJmYXZpY29uXFxcIj5cXG4gIDwvYT4gXCIgKyAocmVzb2x2ZS5lc2NhcGUocGFnZU9iamVjdC5nZXRUaXRsZSgpKSkgKyBcIlxcbjwvaDE+XCIpO1xuICByZXR1cm4gJGhlYWRlci5maW5kKCdhJykub24oJ2NsaWNrJywgaGFuZGxlSGVhZGVyQ2xpY2spO1xufTtcblxuZW1pdFRpbWVzdGFtcCA9IGZ1bmN0aW9uKCRoZWFkZXIsICRwYWdlLCBwYWdlT2JqZWN0KSB7XG4gIGlmICgkcGFnZS5hdHRyKCdpZCcpLm1hdGNoKC9fcmV2LykpIHtcbiAgICAkcGFnZS5hZGRDbGFzcygnZ2hvc3QnKTtcbiAgICAkcGFnZS5kYXRhKCdyZXYnLCBwYWdlT2JqZWN0LmdldFJldmlzaW9uKCkpO1xuICAgIHJldHVybiAkaGVhZGVyLmFwcGVuZCgkKFwiPGgyIGNsYXNzPVxcXCJyZXZpc2lvblxcXCI+XFxuICA8c3Bhbj5cXG4gICAgXCIgKyAocGFnZU9iamVjdC5nZXRUaW1lc3RhbXAoKSkgKyBcIlxcbiAgPC9zcGFuPlxcbjwvaDI+XCIpKTtcbiAgfVxufTtcblxuZW1pdENvbnRyb2xzID0gZnVuY3Rpb24oJGpvdXJuYWwpIHtcbiAgcmV0dXJuICRqb3VybmFsLmFwcGVuZChcIjxkaXYgY2xhc3M9XFxcImNvbnRyb2wtYnV0dG9uc1xcXCI+XFxuICA8YSBocmVmPVxcXCIjXFxcIiBjbGFzcz1cXFwiYnV0dG9uIGZvcmstcGFnZVxcXCIgdGl0bGU9XFxcImZvcmsgdGhpcyBwYWdlXFxcIj5cIiArIGFjdGlvblN5bWJvbHMuZm9yayArIFwiPC9hPlxcbiAgPGEgaHJlZj1cXFwiI1xcXCIgY2xhc3M9XFxcImJ1dHRvbiBhZGQtZmFjdG9yeVxcXCIgdGl0bGU9XFxcImFkZCBwYXJhZ3JhcGhcXFwiPlwiICsgYWN0aW9uU3ltYm9scy5hZGQgKyBcIjwvYT5cXG48L2Rpdj5cIik7XG59O1xuXG5lbWl0Rm9vdGVyID0gZnVuY3Rpb24oJGZvb3RlciwgcGFnZU9iamVjdCkge1xuICB2YXIgaG9zdCwgc2x1ZztcbiAgaG9zdCA9IHBhZ2VPYmplY3QuZ2V0UmVtb3RlU2l0ZShsb2NhdGlvbi5ob3N0KTtcbiAgc2x1ZyA9IHBhZ2VPYmplY3QuZ2V0U2x1ZygpO1xuICByZXR1cm4gJGZvb3Rlci5hcHBlbmQoXG4gICAgICAvL1wiPGEgaWQ9XFxcImxpY2Vuc2VcXFwiIGhyZWY9XFxcImh0dHA6Ly9jcmVhdGl2ZWNvbW1vbnMub3JnL2xpY2Vuc2VzL2J5LXNhLzQuMC9cXFwiPkNDIEJZLVNBIDQuMDwvYT4gLlxcbicgXCIgK1xuICAgICAgXCI8YSBjbGFzcz1cXFwic2hvdy1wYWdlLXNvdXJjZVxcXCIgaHJlZj1cXFwiL1wiICsgc2x1ZyArIFwiLmpzb25cIiArXG4gICAgICAgICAgXCI/cmFuZG9tPVwiICsgKHJhbmRvbS5yYW5kb21CeXRlcyg0KSkgK1xuICAgICAgXCJcXFwiIHRpdGxlPVxcXCJzb3VyY2VcXFwiPkpTT048L2E+IDxhIGhyZWY9IFxcXCIvL1wiICsgaG9zdCArIFwiL1wiICsgc2x1ZyArIFwiLmh0bWxcXFwiIHRhcmdldD1cXFwiXCIgKyBob3N0ICsgXCJcXFwiPlwiICsgaG9zdCArIFwiIDwvYT5cIik7XG59O1xuXG5lZGl0RGF0ZSA9IGZ1bmN0aW9uKGpvdXJuYWwpIHtcbiAgdmFyIGFjdGlvbiwgaiwgcmVmO1xuICByZWYgPSBqb3VybmFsIHx8IFtdO1xuICBmb3IgKGogPSByZWYubGVuZ3RoIC0gMTsgaiA+PSAwOyBqICs9IC0xKSB7XG4gICAgYWN0aW9uID0gcmVmW2pdO1xuICAgIGlmIChhY3Rpb24uZGF0ZSAmJiBhY3Rpb24udHlwZSAhPT0gJ2ZvcmsnKSB7XG4gICAgICByZXR1cm4gYWN0aW9uLmRhdGU7XG4gICAgfVxuICB9XG4gIHJldHVybiB2b2lkIDA7XG59O1xuXG5lbWl0VHdpbnMgPSBmdW5jdGlvbigkcGFnZSkge1xuICB2YXIgYmluLCBiaW5zLCBmbGFncywgaSwgaW5mbywgaXRlbSwgaiwgbGVnZW5kLCBsZW4sIHBhZ2UsIHJlZiwgcmVmMSwgcmVtb3RlU2l0ZSwgc2l0ZSwgc2x1ZywgdHdpbnMsIHZpZXdpbmc7XG4gIHBhZ2UgPSAkcGFnZS5kYXRhKCdkYXRhJyk7XG4gIGlmICghcGFnZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBzaXRlID0gJHBhZ2UuZGF0YSgnc2l0ZScpIHx8IHdpbmRvdy5sb2NhdGlvbi5ob3N0O1xuICBpZiAoc2l0ZSA9PT0gJ3ZpZXcnIHx8IHNpdGUgPT09ICdvcmlnaW4nKSB7XG4gICAgc2l0ZSA9IHdpbmRvdy5sb2NhdGlvbi5ob3N0O1xuICB9XG4gIHNsdWcgPSBhc1NsdWcocGFnZS50aXRsZSk7XG4gIGlmICh2aWV3aW5nID0gZWRpdERhdGUocGFnZS5qb3VybmFsKSkge1xuICAgIGJpbnMgPSB7XG4gICAgICBuZXdlcjogW10sXG4gICAgICBzYW1lOiBbXSxcbiAgICAgIG9sZGVyOiBbXVxuICAgIH07XG4gICAgcmVmID0gbmVpZ2hib3Job29kLnNpdGVzO1xuICAgIGZvciAocmVtb3RlU2l0ZSBpbiByZWYpIHtcbiAgICAgIGluZm8gPSByZWZbcmVtb3RlU2l0ZV07XG4gICAgICBpZiAocmVtb3RlU2l0ZSAhPT0gc2l0ZSAmJiAoaW5mby5zaXRlbWFwICE9IG51bGwpKSB7XG4gICAgICAgIHJlZjEgPSBpbmZvLnNpdGVtYXA7XG4gICAgICAgIGZvciAoaiA9IDAsIGxlbiA9IHJlZjEubGVuZ3RoOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICBpdGVtID0gcmVmMVtqXTtcbiAgICAgICAgICBpZiAoaXRlbS5zbHVnID09PSBzbHVnKSB7XG4gICAgICAgICAgICBiaW4gPSBpdGVtLmRhdGUgPiB2aWV3aW5nID8gYmlucy5uZXdlciA6IGl0ZW0uZGF0ZSA8IHZpZXdpbmcgPyBiaW5zLm9sZGVyIDogYmlucy5zYW1lO1xuICAgICAgICAgICAgYmluLnB1c2goe1xuICAgICAgICAgICAgICByZW1vdGVTaXRlOiByZW1vdGVTaXRlLFxuICAgICAgICAgICAgICBpdGVtOiBpdGVtXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdHdpbnMgPSBbXTtcbiAgICBmb3IgKGxlZ2VuZCBpbiBiaW5zKSB7XG4gICAgICBiaW4gPSBiaW5zW2xlZ2VuZF07XG4gICAgICBpZiAoIWJpbi5sZW5ndGgpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBiaW4uc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLml0ZW0uZGF0ZSA8IGIuaXRlbS5kYXRlO1xuICAgICAgfSk7XG4gICAgICBmbGFncyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGssIGxlbjEsIHJlZjIsIHJlc3VsdHM7XG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChpID0gayA9IDAsIGxlbjEgPSBiaW4ubGVuZ3RoOyBrIDwgbGVuMTsgaSA9ICsraykge1xuICAgICAgICAgIHJlZjIgPSBiaW5baV0sIHJlbW90ZVNpdGUgPSByZWYyLnJlbW90ZVNpdGUsIGl0ZW0gPSByZWYyLml0ZW07XG4gICAgICAgICAgaWYgKGkgPj0gOCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc3VsdHMucHVzaChcIjxpbWcgY2xhc3M9XFxcInJlbW90ZVxcXCJcXG5zcmM9XFxcImh0dHA6Ly9cIiArIHJlbW90ZVNpdGUgKyBcIi9mYXZpY29uLnBuZ1xcXCJcXG5kYXRhLXNsdWc9XFxcIlwiICsgc2x1ZyArIFwiXFxcIlxcbmRhdGEtc2l0ZT1cXFwiXCIgKyByZW1vdGVTaXRlICsgXCJcXFwiXFxudGl0bGU9XFxcIlwiICsgcmVtb3RlU2l0ZSArIFwiXFxcIj5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9KSgpO1xuICAgICAgdHdpbnMucHVzaCgoZmxhZ3Muam9pbignJm5ic3A7JykpICsgXCIgXCIgKyBsZWdlbmQpO1xuICAgIH1cbiAgICBpZiAodHdpbnMgJiYgdHdpbnMubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuICRwYWdlLmZpbmQoJy50d2lucycpLmh0bWwoXCI8cD5cIiArICh0d2lucy5qb2luKFwiLCBcIikpICsgXCI8L3A+XCIpO1xuICAgIH1cbiAgfVxufTtcblxucmVuZGVyUGFnZUludG9QYWdlRWxlbWVudCA9IGZ1bmN0aW9uKHBhZ2VPYmplY3QsICRwYWdlKSB7XG4gIHZhciAkZm9vdGVyLCAkaGVhZGVyLCAkam91cm5hbCwgJHN0b3J5LCAkdHdpbnMsIGVhY2gsIHJlZjtcbiAgJHBhZ2UuZGF0YShcImRhdGFcIiwgcGFnZU9iamVjdC5nZXRSYXdQYWdlKCkpO1xuICBpZiAocGFnZU9iamVjdC5pc1JlbW90ZSgpKSB7XG4gICAgJHBhZ2UuZGF0YShcInNpdGVcIiwgcGFnZU9iamVjdC5nZXRSZW1vdGVTaXRlKCkpO1xuICB9XG4gIGNvbnNvbGUubG9nKCcucGFnZSBrZXlzICcsIChmdW5jdGlvbigpIHtcbiAgICB2YXIgaiwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gJCgnLnBhZ2UnKTtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaiA8IGxlbjsgaisrKSB7XG4gICAgICBlYWNoID0gcmVmW2pdO1xuICAgICAgcmVzdWx0cy5wdXNoKCQoZWFjaCkuZGF0YSgna2V5JykpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfSkoKSk7XG4gIGNvbnNvbGUubG9nKCdsaW5ldXAga2V5cycsIGxpbmV1cC5kZWJ1Z0tleXMoKSk7XG4gIHJlc29sdmUucmVzb2x1dGlvbkNvbnRleHQgPSBwYWdlT2JqZWN0LmdldENvbnRleHQoKTtcbiAgJHBhZ2UuZW1wdHkoKTtcbiAgcmVmID0gWyd0d2lucycsICdoZWFkZXInLCAnc3RvcnknLCAnam91cm5hbCcsICdmb290ZXInXS5tYXAoZnVuY3Rpb24oY2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuICQoXCI8ZGl2IC8+XCIpLmFkZENsYXNzKGNsYXNzTmFtZSkuYXBwZW5kVG8oJHBhZ2UpO1xuICB9KSwgJHR3aW5zID0gcmVmWzBdLCAkaGVhZGVyID0gcmVmWzFdLCAkc3RvcnkgPSByZWZbMl0sICRqb3VybmFsID0gcmVmWzNdLCAkZm9vdGVyID0gcmVmWzRdO1xuICBlbWl0SGVhZGVyKCRoZWFkZXIsICRwYWdlLCBwYWdlT2JqZWN0KTtcbiAgZW1pdFRpbWVzdGFtcCgkaGVhZGVyLCAkcGFnZSwgcGFnZU9iamVjdCk7XG4gIHBhZ2VPYmplY3Quc2VxSXRlbXMoZnVuY3Rpb24oaXRlbSwgZG9uZSkge1xuICAgIHZhciAkaXRlbTtcbiAgICAkaXRlbSA9ICQoXCI8ZGl2IGNsYXNzPVxcXCJpdGVtIFwiICsgaXRlbS50eXBlICsgXCJcXFwiIGRhdGEtaWQ9XFxcIlwiICsgaXRlbS5pZCArIFwiXFxcIj5cIik7XG4gICAgJHN0b3J5LmFwcGVuZCgkaXRlbSk7XG4gICAgcmV0dXJuIHBsdWdpbltcImRvXCJdKCRpdGVtLCBpdGVtLCBkb25lKTtcbiAgfSk7XG4gIHBhZ2VPYmplY3Quc2VxQWN0aW9ucyhmdW5jdGlvbihlYWNoLCBkb25lKSB7XG4gICAgaWYgKGVhY2guc2VwYXJhdG9yKSB7XG4gICAgICBhZGRUb0pvdXJuYWwoJGpvdXJuYWwsIGVhY2guc2VwYXJhdG9yKTtcbiAgICB9XG4gICAgYWRkVG9Kb3VybmFsKCRqb3VybmFsLCBlYWNoLmFjdGlvbik7XG4gICAgcmV0dXJuIGRvbmUoKTtcbiAgfSk7XG4gIGVtaXRUd2lucygkcGFnZSk7XG4gIGVtaXRDb250cm9scygkam91cm5hbCk7XG4gIHJldHVybiBlbWl0Rm9vdGVyKCRmb290ZXIsIHBhZ2VPYmplY3QpO1xufTtcblxuY3JlYXRlTWlzc2luZ0ZsYWcgPSBmdW5jdGlvbigkcGFnZSwgcGFnZU9iamVjdCkge1xuICBpZiAoIXBhZ2VPYmplY3QuaXNSZW1vdGUoKSkge1xuICAgIHJldHVybiAkKCdpbWcuZmF2aWNvbicsICRwYWdlKS5lcnJvcihmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwbHVnaW4uZ2V0KCdmYXZpY29uJywgZnVuY3Rpb24oZmF2aWNvbikge1xuICAgICAgICByZXR1cm4gZmF2aWNvbi5jcmVhdGUoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59O1xuXG5yZWJ1aWxkUGFnZSA9IGZ1bmN0aW9uKHBhZ2VPYmplY3QsICRwYWdlKSB7XG4gIGlmIChwYWdlT2JqZWN0LmlzTG9jYWwoKSkge1xuICAgICRwYWdlLmFkZENsYXNzKCdsb2NhbCcpO1xuICB9XG4gIGlmIChwYWdlT2JqZWN0LmlzUmVtb3RlKCkpIHtcbiAgICAkcGFnZS5hZGRDbGFzcygncmVtb3RlJyk7XG4gIH1cbiAgaWYgKHBhZ2VPYmplY3QuaXNQbHVnaW4oKSkge1xuICAgICRwYWdlLmFkZENsYXNzKCdwbHVnaW4nKTtcbiAgfVxuICByZW5kZXJQYWdlSW50b1BhZ2VFbGVtZW50KHBhZ2VPYmplY3QsICRwYWdlKTtcbiAgY3JlYXRlTWlzc2luZ0ZsYWcoJHBhZ2UsIHBhZ2VPYmplY3QpO1xuICBzdGF0ZS5zZXRVcmwoKTtcbiAgaW5pdERyYWdnaW5nKCRwYWdlKTtcbiAgaW5pdE1lcmdpbmcoJHBhZ2UpO1xuICBpbml0QWRkQnV0dG9uKCRwYWdlKTtcbiAgcmV0dXJuICRwYWdlO1xufTtcblxuYnVpbGRQYWdlID0gZnVuY3Rpb24ocGFnZU9iamVjdCwgJHBhZ2UpIHtcbiAgJHBhZ2UuZGF0YSgna2V5JywgbGluZXVwLmFkZFBhZ2UocGFnZU9iamVjdCkpO1xuICByZXR1cm4gcmVidWlsZFBhZ2UocGFnZU9iamVjdCwgJHBhZ2UpO1xufTtcblxuY3ljbGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyICRwYWdlLCBjcmVhdGVHaG9zdFBhZ2UsIHBhZ2VJbmZvcm1hdGlvbiwgcmVmLCByZXYsIHNsdWcsIHdoZW5Hb3R0ZW47XG4gICRwYWdlID0gJCh0aGlzKTtcbiAgcmVmID0gJHBhZ2UuYXR0cignaWQnKS5zcGxpdCgnX3JldicpLCBzbHVnID0gcmVmWzBdLCByZXYgPSByZWZbMV07XG4gIHBhZ2VJbmZvcm1hdGlvbiA9IHtcbiAgICBzbHVnOiBzbHVnLFxuICAgIHJldjogcmV2LFxuICAgIHNpdGU6ICRwYWdlLmRhdGEoJ3NpdGUnKVxuICB9O1xuICBjcmVhdGVHaG9zdFBhZ2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGl0LCBoaXRzLCBpbmZvLCBqLCBsZW4sIHBhZ2VPYmplY3QsIHJlZjEsIHJlc3VsdCwgc2l0ZSwgdGl0bGU7XG4gICAgdGl0bGUgPSAkKFwiYVtocmVmPVxcXCIvXCIgKyBzbHVnICsgXCIuaHRtbFxcXCJdOmxhc3RcIikudGV4dCgpIHx8IHNsdWc7XG4gICAgcGFnZU9iamVjdCA9IG5ld1BhZ2UoKTtcbiAgICBwYWdlT2JqZWN0LnNldFRpdGxlKHRpdGxlKTtcbiAgICBoaXRzID0gW107XG4gICAgcmVmMSA9IG5laWdoYm9yaG9vZC5zaXRlcztcbiAgICBmb3IgKHNpdGUgaW4gcmVmMSkge1xuICAgICAgaW5mbyA9IHJlZjFbc2l0ZV07XG4gICAgICBpZiAoaW5mby5zaXRlbWFwICE9IG51bGwpIHtcbiAgICAgICAgcmVzdWx0ID0gXy5maW5kKGluZm8uc2l0ZW1hcCwgZnVuY3Rpb24oZWFjaCkge1xuICAgICAgICAgIHJldHVybiBlYWNoLnNsdWcgPT09IHNsdWc7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgICAgICBoaXRzLnB1c2goe1xuICAgICAgICAgICAgXCJ0eXBlXCI6IFwicmVmZXJlbmNlXCIsXG4gICAgICAgICAgICBcInNpdGVcIjogc2l0ZSxcbiAgICAgICAgICAgIFwic2x1Z1wiOiBzbHVnLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiByZXN1bHQudGl0bGUgfHwgc2x1ZyxcbiAgICAgICAgICAgIFwidGV4dFwiOiByZXN1bHQuc3lub3BzaXMgfHwgJydcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaGl0cy5sZW5ndGggPiAwKSB7XG4gICAgICBwYWdlT2JqZWN0LmFkZEl0ZW0oe1xuICAgICAgICAndHlwZSc6ICdmdXR1cmUnLFxuICAgICAgICAndGV4dCc6ICdXZSBjb3VsZCBub3QgZmluZCB0aGlzIHBhZ2UgaW4gdGhlIGV4cGVjdGVkIGNvbnRleHQuJyxcbiAgICAgICAgJ3RpdGxlJzogdGl0bGVcbiAgICAgIH0pO1xuICAgICAgcGFnZU9iamVjdC5hZGRJdGVtKHtcbiAgICAgICAgJ3R5cGUnOiAncGFyYWdyYXBoJyxcbiAgICAgICAgJ3RleHQnOiBcIldlIGRpZCBmaW5kIHRoZSBwYWdlIGluIHlvdXIgY3VycmVudCBuZWlnaGJvcmhvb2QuXCJcbiAgICAgIH0pO1xuICAgICAgZm9yIChqID0gMCwgbGVuID0gaGl0cy5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBoaXQgPSBoaXRzW2pdO1xuICAgICAgICBwYWdlT2JqZWN0LmFkZEl0ZW0oaGl0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcGFnZU9iamVjdC5hZGRJdGVtKHtcbiAgICAgICAgJ3R5cGUnOiAnZnV0dXJlJyxcbiAgICAgICAgJ3RleHQnOiAnV2UgY291bGQgbm90IGZpbmQgdGhpcyBwYWdlLicsXG4gICAgICAgICd0aXRsZSc6IHRpdGxlXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1aWxkUGFnZShwYWdlT2JqZWN0LCAkcGFnZSkuYWRkQ2xhc3MoJ2dob3N0Jyk7XG4gIH07XG4gIHdoZW5Hb3R0ZW4gPSBmdW5jdGlvbihwYWdlT2JqZWN0KSB7XG4gICAgdmFyIGosIGxlbiwgcmVmMSwgcmVzdWx0cywgc2l0ZTtcbiAgICBidWlsZFBhZ2UocGFnZU9iamVjdCwgJHBhZ2UpO1xuICAgIHJlZjEgPSBwYWdlT2JqZWN0LmdldE5laWdoYm9ycyhsb2NhdGlvbi5ob3N0KTtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChqID0gMCwgbGVuID0gcmVmMS5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgc2l0ZSA9IHJlZjFbal07XG4gICAgICByZXN1bHRzLnB1c2gobmVpZ2hib3Job29kLnJlZ2lzdGVyTmVpZ2hib3Ioc2l0ZSkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcbiAgcmV0dXJuIHBhZ2VIYW5kbGVyLmdldCh7XG4gICAgd2hlbkdvdHRlbjogd2hlbkdvdHRlbixcbiAgICB3aGVuTm90R290dGVuOiBjcmVhdGVHaG9zdFBhZ2UsXG4gICAgcGFnZUluZm9ybWF0aW9uOiBwYWdlSW5mb3JtYXRpb25cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3ljbGU6IGN5Y2xlLFxuICBlbWl0VHdpbnM6IGVtaXRUd2lucyxcbiAgYnVpbGRQYWdlOiBidWlsZFBhZ2UsXG4gIHJlYnVpbGRQYWdlOiByZWJ1aWxkUGFnZVxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhc1NsdWcsIGVzY2FwZSwgcmVzb2x2ZTtcblxuYXNTbHVnID0gcmVxdWlyZSgnLi9wYWdlJykuYXNTbHVnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJlc29sdmUgPSB7fTtcblxucmVzb2x2ZS5yZXNvbHV0aW9uQ29udGV4dCA9IFtdO1xuXG5yZXNvbHZlLmVzY2FwZSA9IGVzY2FwZSA9IGZ1bmN0aW9uKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLyYvZywgJyZhbXA7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn07XG5cbnJlc29sdmUucmVzb2x2ZUZyb20gPSBmdW5jdGlvbihhZGRpdGlvbiwgY2FsbGJhY2spIHtcbiAgcmVzb2x2ZS5yZXNvbHV0aW9uQ29udGV4dC5wdXNoKGFkZGl0aW9uKTtcbiAgdHJ5IHtcbiAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgfSBmaW5hbGx5IHtcbiAgICByZXNvbHZlLnJlc29sdXRpb25Db250ZXh0LnBvcCgpO1xuICB9XG59O1xuXG5yZXNvbHZlLnJlc29sdmVMaW5rcyA9IGZ1bmN0aW9uKHN0cmluZywgc2FuaXRpemUpIHtcbiAgdmFyIGV4dGVybmFsLCBpbnRlcm5hbCwgc3Rhc2gsIHN0YXNoZWQsIHVuc3Rhc2g7XG4gIGlmIChzYW5pdGl6ZSA9PSBudWxsKSB7XG4gICAgc2FuaXRpemUgPSBlc2NhcGU7XG4gIH1cbiAgc3Rhc2hlZCA9IFtdO1xuICBzdGFzaCA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICB2YXIgaGVyZTtcbiAgICBoZXJlID0gc3Rhc2hlZC5sZW5ndGg7XG4gICAgc3Rhc2hlZC5wdXNoKHRleHQpO1xuICAgIHJldHVybiBcIuOAllwiICsgaGVyZSArIFwi44CXXCI7XG4gIH07XG4gIHVuc3Rhc2ggPSBmdW5jdGlvbihtYXRjaCwgZGlnaXRzKSB7XG4gICAgcmV0dXJuIHN0YXNoZWRbK2RpZ2l0c107XG4gIH07XG4gIGludGVybmFsID0gZnVuY3Rpb24obWF0Y2gsIG5hbWUpIHtcbiAgICB2YXIgc2x1ZztcbiAgICBzbHVnID0gYXNTbHVnKG5hbWUpO1xuICAgIHJldHVybiBzdGFzaChcIjxhIGNsYXNzPVxcXCJpbnRlcm5hbFxcXCIgaHJlZj1cXFwiL1wiICsgc2x1ZyArIFwiLmh0bWxcXFwiIGRhdGEtcGFnZS1uYW1lPVxcXCJcIiArIHNsdWcgKyBcIlxcXCIgdGl0bGU9XFxcIlwiICsgKHJlc29sdmUucmVzb2x1dGlvbkNvbnRleHQuam9pbignID0+ICcpKSArIFwiXFxcIj5cIiArIChlc2NhcGUobmFtZSkpICsgXCI8L2E+XCIpO1xuICB9O1xuICBleHRlcm5hbCA9IGZ1bmN0aW9uKG1hdGNoLCBocmVmLCBwcm90b2NvbCwgcmVzdCkge1xuICAgIHJldHVybiBzdGFzaChcIjxhIGNsYXNzPVxcXCJleHRlcm5hbFxcXCIgdGFyZ2V0PVxcXCJfYmxhbmtcXFwiIGhyZWY9XFxcIlwiICsgaHJlZiArIFwiXFxcIiB0aXRsZT1cXFwiXCIgKyBocmVmICsgXCJcXFwiIHJlbD1cXFwibm9mb2xsb3dcXFwiPlwiICsgKGVzY2FwZShyZXN0KSkgKyBcIiA8aW1nIHNyYz1cXFwiL2ltYWdlcy9leHRlcm5hbC1saW5rLWx0ci1pY29uLnBuZ1xcXCI+PC9hPlwiKTtcbiAgfTtcbiAgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoL+OAlihcXGQrKeOAly9nLCBcIuOAliAkMSDjgJdcIikucmVwbGFjZSgvXFxbXFxbKFteXFxdXSspXFxdXFxdL2dpLCBpbnRlcm5hbCkucmVwbGFjZSgvXFxbKChodHRwfGh0dHBzfGZ0cCk6Lio/KSAoLio/KVxcXS9naSwgZXh0ZXJuYWwpO1xuICByZXR1cm4gc2FuaXRpemUoc3RyaW5nKS5yZXBsYWNlKC/jgJYoXFxkKynjgJcvZywgdW5zdGFzaCk7XG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIGFwcGx5LCBjcmVhdGU7XG5cbmFwcGx5ID0gZnVuY3Rpb24ocGFnZSwgYWN0aW9uKSB7XG4gIHZhciBhZGQsIGFmdGVyLCBpbmRleCwgaXRlbSwgb3JkZXIsIHJlbW92ZTtcbiAgb3JkZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSwgaXRlbSwgbGVuLCByZWYsIHJlc3VsdHM7XG4gICAgcmVmID0gcGFnZS5zdG9yeSB8fCBbXTtcbiAgICByZXN1bHRzID0gW107XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBpdGVtID0gcmVmW2ldO1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZW0gIT0gbnVsbCA/IGl0ZW0uaWQgOiB2b2lkIDApO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcbiAgYWRkID0gZnVuY3Rpb24oYWZ0ZXIsIGl0ZW0pIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSBvcmRlcigpLmluZGV4T2YoYWZ0ZXIpICsgMTtcbiAgICByZXR1cm4gcGFnZS5zdG9yeS5zcGxpY2UoaW5kZXgsIDAsIGl0ZW0pO1xuICB9O1xuICByZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaWYgKChpbmRleCA9IG9yZGVyKCkuaW5kZXhPZihhY3Rpb24uaWQpKSAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBwYWdlLnN0b3J5LnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9O1xuICBwYWdlLnN0b3J5IHx8IChwYWdlLnN0b3J5ID0gW10pO1xuICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG4gICAgY2FzZSAnY3JlYXRlJzpcbiAgICAgIGlmIChhY3Rpb24uaXRlbSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChhY3Rpb24uaXRlbS50aXRsZSAhPSBudWxsKSB7XG4gICAgICAgICAgcGFnZS50aXRsZSA9IGFjdGlvbi5pdGVtLnRpdGxlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhY3Rpb24uaXRlbS5zdG9yeSAhPSBudWxsKSB7XG4gICAgICAgICAgcGFnZS5zdG9yeSA9IGFjdGlvbi5pdGVtLnN0b3J5LnNsaWNlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FkZCc6XG4gICAgICBhZGQoYWN0aW9uLmFmdGVyLCBhY3Rpb24uaXRlbSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdlZGl0JzpcbiAgICAgIGlmICgoaW5kZXggPSBvcmRlcigpLmluZGV4T2YoYWN0aW9uLmlkKSkgIT09IC0xKSB7XG4gICAgICAgIHBhZ2Uuc3Rvcnkuc3BsaWNlKGluZGV4LCAxLCBhY3Rpb24uaXRlbSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYWdlLnN0b3J5LnB1c2goYWN0aW9uLml0ZW0pO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW92ZSc6XG4gICAgICBpbmRleCA9IGFjdGlvbi5vcmRlci5pbmRleE9mKGFjdGlvbi5pZCk7XG4gICAgICBhZnRlciA9IGFjdGlvbi5vcmRlcltpbmRleCAtIDFdO1xuICAgICAgaXRlbSA9IHBhZ2Uuc3Rvcnlbb3JkZXIoKS5pbmRleE9mKGFjdGlvbi5pZCldO1xuICAgICAgcmVtb3ZlKCk7XG4gICAgICBhZGQoYWZ0ZXIsIGl0ZW0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVtb3ZlJzpcbiAgICAgIHJlbW92ZSgpO1xuICB9XG4gIHBhZ2Uuam91cm5hbCB8fCAocGFnZS5qb3VybmFsID0gW10pO1xuICByZXR1cm4gcGFnZS5qb3VybmFsLnB1c2goYWN0aW9uKTtcbn07XG5cbmNyZWF0ZSA9IGZ1bmN0aW9uKHJldkluZGV4LCBkYXRhKSB7XG4gIHZhciBhY3Rpb24sIGksIGxlbiwgcmV2Sm91cm5hbCwgcmV2UGFnZTtcbiAgcmV2SW5kZXggPSArcmV2SW5kZXg7XG4gIHJldkpvdXJuYWwgPSBkYXRhLmpvdXJuYWwuc2xpY2UoMCwgK3JldkluZGV4ICsgMSB8fCA5ZTkpO1xuICByZXZQYWdlID0ge1xuICAgIHRpdGxlOiBkYXRhLnRpdGxlLFxuICAgIHN0b3J5OiBbXVxuICB9O1xuICBmb3IgKGkgPSAwLCBsZW4gPSByZXZKb3VybmFsLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgYWN0aW9uID0gcmV2Sm91cm5hbFtpXTtcbiAgICBhcHBseShyZXZQYWdlLCBhY3Rpb24gfHwge30pO1xuICB9XG4gIHJldHVybiByZXZQYWdlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogY3JlYXRlLFxuICBhcHBseTogYXBwbHlcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYWN0aXZlLCBjcmVhdGVTZWFyY2gsIGxpbmssIG5ld1BhZ2U7XG5cbmxpbmsgPSByZXF1aXJlKCcuL2xpbmsnKTtcblxuYWN0aXZlID0gcmVxdWlyZSgnLi9hY3RpdmUnKTtcblxubmV3UGFnZSA9IHJlcXVpcmUoJy4vcGFnZScpLm5ld1BhZ2U7XG5cbmNyZWF0ZVNlYXJjaCA9IGZ1bmN0aW9uKGFyZykge1xuICB2YXIgbmVpZ2hib3Job29kLCBwZXJmb3JtU2VhcmNoO1xuICBuZWlnaGJvcmhvb2QgPSBhcmcubmVpZ2hib3Job29kO1xuICBwZXJmb3JtU2VhcmNoID0gZnVuY3Rpb24oc2VhcmNoUXVlcnkpIHtcbiAgICB2YXIgaSwgbGVuLCByZWYsIHJlc3VsdCwgcmVzdWx0UGFnZSwgc2VhcmNoUmVzdWx0cywgdGFsbHk7XG4gICAgc2VhcmNoUmVzdWx0cyA9IG5laWdoYm9yaG9vZC5zZWFyY2goc2VhcmNoUXVlcnkpO1xuICAgIHRhbGx5ID0gc2VhcmNoUmVzdWx0cy50YWxseTtcbiAgICByZXN1bHRQYWdlID0gbmV3UGFnZSgpO1xuICAgIHJlc3VsdFBhZ2Uuc2V0VGl0bGUoXCJTZWFyY2ggZm9yICdcIiArIHNlYXJjaFF1ZXJ5ICsgXCInXCIpO1xuICAgIHJlc3VsdFBhZ2UuYWRkUGFyYWdyYXBoKFwiU3RyaW5nICdcIiArIHNlYXJjaFF1ZXJ5ICsgXCInIGZvdW5kIG9uIFwiICsgKHRhbGx5LmZpbmRzIHx8ICdub25lJykgKyBcIiBvZiBcIiArICh0YWxseS5wYWdlcyB8fCAnbm8nKSArIFwiIHBhZ2VzIGZyb20gXCIgKyAodGFsbHkuc2l0ZXMgfHwgJ25vJykgKyBcIiBzaXRlcy5cXG5UZXh0IG1hdGNoZWQgb24gXCIgKyAodGFsbHkudGl0bGUgfHwgJ25vJykgKyBcIiB0aXRsZXMsIFwiICsgKHRhbGx5LnRleHQgfHwgJ25vJykgKyBcIiBwYXJhZ3JhcGhzLCBhbmQgXCIgKyAodGFsbHkuc2x1ZyB8fCAnbm8nKSArIFwiIHNsdWdzLlxcbkVsYXBzZWQgdGltZSBcIiArIHRhbGx5Lm1zZWMgKyBcIiBtaWxsaXNlY29uZHMuXCIpO1xuICAgIHJlZiA9IHNlYXJjaFJlc3VsdHMuZmluZHM7XG4gICAgZm9yIChpID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICByZXN1bHQgPSByZWZbaV07XG4gICAgICByZXN1bHRQYWdlLmFkZEl0ZW0oe1xuICAgICAgICBcInR5cGVcIjogXCJyZWZlcmVuY2VcIixcbiAgICAgICAgXCJzaXRlXCI6IHJlc3VsdC5zaXRlLFxuICAgICAgICBcInNsdWdcIjogcmVzdWx0LnBhZ2Uuc2x1ZyxcbiAgICAgICAgXCJ0aXRsZVwiOiByZXN1bHQucGFnZS50aXRsZSxcbiAgICAgICAgXCJ0ZXh0XCI6IHJlc3VsdC5wYWdlLnN5bm9wc2lzIHx8ICcnXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGxpbmsuc2hvd1Jlc3VsdChyZXN1bHRQYWdlKTtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBwZXJmb3JtU2VhcmNoOiBwZXJmb3JtU2VhcmNoXG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVNlYXJjaDtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBiaW5kLCBjcmVhdGVTZWFyY2gsIGluamVjdCwgc2VhcmNoO1xuXG5jcmVhdGVTZWFyY2ggPSByZXF1aXJlKCcuL3NlYXJjaCcpO1xuXG5zZWFyY2ggPSBudWxsO1xuXG5pbmplY3QgPSBmdW5jdGlvbihuZWlnaGJvcmhvb2QpIHtcbiAgcmV0dXJuIHNlYXJjaCA9IGNyZWF0ZVNlYXJjaCh7XG4gICAgbmVpZ2hib3Job29kOiBuZWlnaGJvcmhvb2RcbiAgfSk7XG59O1xuXG5iaW5kID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAkKCdpbnB1dC5zZWFyY2gnKS5vbigna2V5cHJlc3MnLCBmdW5jdGlvbihlKSB7XG4gICAgdmFyIHNlYXJjaFF1ZXJ5O1xuICAgIGlmIChlLmtleUNvZGUgIT09IDEzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlYXJjaFF1ZXJ5ID0gJCh0aGlzKS52YWwoKTtcbiAgICBzZWFyY2gucGVyZm9ybVNlYXJjaChzZWFyY2hRdWVyeSk7XG4gICAgcmV0dXJuICQodGhpcykudmFsKFwiXCIpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBpbmplY3Q6IGluamVjdCxcbiAgYmluZDogYmluZFxufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBhY3RpdmUsIGxpbmV1cCwgbGluaywgc3RhdGUsXG4gICAgaW5kZXhPZiA9IFtdLmluZGV4T2YgfHwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaSBpbiB0aGlzICYmIHRoaXNbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9O1xuXG5hY3RpdmUgPSByZXF1aXJlKCcuL2FjdGl2ZScpO1xuXG5saW5ldXAgPSByZXF1aXJlKCcuL2xpbmV1cCcpO1xuXG5saW5rID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSBzdGF0ZSA9IHt9O1xuXG5zdGF0ZS5pbmplY3QgPSBmdW5jdGlvbiAobGlua18pIHtcbiAgICByZXR1cm4gbGluayA9IGxpbmtfO1xufTtcblxuc3RhdGUucGFnZXNJbkRvbSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gJC5tYWtlQXJyYXkoJChcIi5wYWdlXCIpLm1hcChmdW5jdGlvbiAoXywgZWwpIHtcbiAgICAgICAgcmV0dXJuIGVsLmlkO1xuICAgIH0pKTtcbn07XG5cbnN0YXRlLnVybFBhZ2VzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpO1xuICAgIHJldHVybiAoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGssIGxlbiwgcmVmLCByZXN1bHRzO1xuICAgICAgICByZWYgPSAkKGxvY2F0aW9uKS5hdHRyKCdwYXRobmFtZScpLnNwbGl0KCcvJyk7XG4gICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChrID0gMCwgbGVuID0gcmVmLmxlbmd0aDsgayA8IGxlbjsgayArPSAyKSB7XG4gICAgICAgICAgICBpID0gcmVmW2tdO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0pKCkpLnNsaWNlKDEpO1xufTtcblxuc3RhdGUubG9jc0luRG9tID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAkLm1ha2VBcnJheSgkKFwiLnBhZ2VcIikubWFwKGZ1bmN0aW9uIChfLCBlbCkge1xuICAgICAgICByZXR1cm4gJChlbCkuZGF0YSgnc2l0ZScpIHx8ICd2aWV3JztcbiAgICB9KSk7XG59O1xuXG5zdGF0ZS51cmxMb2NzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBqLCBrLCBsZW4sIHJlZiwgcmVzdWx0cztcbiAgICByZWYgPSAkKGxvY2F0aW9uKS5hdHRyKCdwYXRobmFtZScpLnNwbGl0KCcvJykuc2xpY2UoMSk7XG4gICAgcmVzdWx0cyA9IFtdO1xuICAgIGZvciAoayA9IDAsIGxlbiA9IHJlZi5sZW5ndGg7IGsgPCBsZW47IGsgKz0gMikge1xuICAgICAgICBqID0gcmVmW2tdO1xuICAgICAgICByZXN1bHRzLnB1c2goaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xufTtcblxuc3RhdGUuc2V0VXJsID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZHgsIGxvY3MsIHBhZ2UsIHBhZ2VzLCB1cmw7XG4gICAgZG9jdW1lbnQudGl0bGUgPSBsaW5ldXAuYmVzdFRpdGxlKCk7XG4gICAgaWYgKGhpc3RvcnkgJiYgaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgICAgbG9jcyA9IHN0YXRlLmxvY3NJbkRvbSgpO1xuICAgICAgICBwYWdlcyA9IHN0YXRlLnBhZ2VzSW5Eb20oKTtcbiAgICAgICAgdXJsID0gKChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgaywgbGVuLCByZXN1bHRzO1xuICAgICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgZm9yIChpZHggPSBrID0gMCwgbGVuID0gcGFnZXMubGVuZ3RoOyBrIDwgbGVuOyBpZHggPSArK2spIHtcbiAgICAgICAgICAgICAgICBwYWdlID0gcGFnZXNbaWR4XTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goXCIvXCIgKyAoKGxvY3MgIT0gbnVsbCA/IGxvY3NbaWR4XSA6IHZvaWQgMCkgfHwgJ3ZpZXcnKSArIFwiL1wiICsgcGFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSkoKSkuam9pbignJyk7XG4gICAgICAgIGlmICh1cmwgIT09ICQobG9jYXRpb24pLmF0dHIoJ3BhdGhuYW1lJykpIHtcbiAgICAgICAgICAgIHJldHVybiBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCB1cmwpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuc3RhdGUuc2hvdyA9IGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIGVhY2gsIGlkeCwgaywgbCwgbGVuLCBsZW4xLCBtYXRjaGluZywgbmFtZSwgbmV3TG9jcywgbmV3UGFnZXMsIG9sZCwgb2xkTG9jcywgb2xkUGFnZXM7XG4gICAgb2xkUGFnZXMgPSBzdGF0ZS5wYWdlc0luRG9tKCk7XG4gICAgbmV3UGFnZXMgPSBzdGF0ZS51cmxQYWdlcygpO1xuICAgIG9sZExvY3MgPSBzdGF0ZS5sb2NzSW5Eb20oKTtcbiAgICBuZXdMb2NzID0gc3RhdGUudXJsTG9jcygpO1xuICAgIGlmICghbG9jYXRpb24ucGF0aG5hbWUgfHwgbG9jYXRpb24ucGF0aG5hbWUgPT09ICcvJykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIG1hdGNoaW5nID0gdHJ1ZTtcbiAgICBmb3IgKGlkeCA9IGsgPSAwLCBsZW4gPSBvbGRQYWdlcy5sZW5ndGg7IGsgPCBsZW47IGlkeCA9ICsraykge1xuICAgICAgICBuYW1lID0gb2xkUGFnZXNbaWR4XTtcbiAgICAgICAgaWYgKG1hdGNoaW5nICYmIChtYXRjaGluZyA9IG5hbWUgPT09IG5ld1BhZ2VzW2lkeF0pKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBvbGQgPSAkKCcucGFnZTpsYXN0Jyk7XG4gICAgICAgIGxpbmV1cC5yZW1vdmVLZXkob2xkLmRhdGEoJ2tleScpKTtcbiAgICAgICAgb2xkLnJlbW92ZSgpO1xuICAgIH1cbiAgICBtYXRjaGluZyA9IHRydWU7XG4gICAgZm9yIChpZHggPSBsID0gMCwgbGVuMSA9IG5ld1BhZ2VzLmxlbmd0aDsgbCA8IGxlbjE7IGlkeCA9ICsrbCkge1xuICAgICAgICBuYW1lID0gbmV3UGFnZXNbaWR4XTtcbiAgICAgICAgaWYgKG1hdGNoaW5nICYmIChtYXRjaGluZyA9IG5hbWUgPT09IG9sZFBhZ2VzW2lkeF0pKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygncHVzaCcsIGlkeCwgbmFtZSk7XG4gICAgICAgIGxpbmsuc2hvd1BhZ2UobmFtZSwgbmV3TG9jc1tpZHhdKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coJ2EgLnBhZ2Uga2V5cyAnLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGVuMiwgbSwgcmVmLCByZXN1bHRzO1xuICAgICAgICByZWYgPSAkKCcucGFnZScpO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAobSA9IDAsIGxlbjIgPSByZWYubGVuZ3RoOyBtIDwgbGVuMjsgbSsrKSB7XG4gICAgICAgICAgICBlYWNoID0gcmVmW21dO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKCQoZWFjaCkuZGF0YSgna2V5JykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH0pKCkpO1xuICAgIGNvbnNvbGUubG9nKCdhIGxpbmV1cCBrZXlzJywgbGluZXVwLmRlYnVnS2V5cygpKTtcbiAgICBhY3RpdmUuc2V0KCQoJy5wYWdlJykubGFzdCgpKTtcbiAgICByZXR1cm4gZG9jdW1lbnQudGl0bGUgPSBsaW5ldXAuYmVzdFRpdGxlKCk7XG59O1xuXG5zdGF0ZS5maXJzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZmlyc3RVcmxMb2NzLCBmaXJzdFVybFBhZ2VzLCBpZHgsIGssIGxlbiwgb2xkUGFnZXMsIHJlc3VsdHMsIHVybFBhZ2U7XG4gICAgc3RhdGUuc2V0VXJsKCk7XG4gICAgZmlyc3RVcmxQYWdlcyA9IHN0YXRlLnVybFBhZ2VzKCk7XG4gICAgZmlyc3RVcmxMb2NzID0gc3RhdGUudXJsTG9jcygpO1xuICAgIG9sZFBhZ2VzID0gc3RhdGUucGFnZXNJbkRvbSgpO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBmb3IgKGlkeCA9IGsgPSAwLCBsZW4gPSBmaXJzdFVybFBhZ2VzLmxlbmd0aDsgayA8IGxlbjsgaWR4ID0gKytrKSB7XG4gICAgICAgIHVybFBhZ2UgPSBmaXJzdFVybFBhZ2VzW2lkeF07XG4gICAgICAgIGlmIChpbmRleE9mLmNhbGwob2xkUGFnZXMsIHVybFBhZ2UpIDwgMCkge1xuICAgICAgICAgICAgaWYgKHVybFBhZ2UgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKGxpbmsuY3JlYXRlUGFnZSh1cmxQYWdlLCBmaXJzdFVybExvY3NbaWR4XSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2godm9pZCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHBhZ2UpIHtcbiAgdmFyIHAxLCBwMiwgc3lub3BzaXM7XG4gIHN5bm9wc2lzID0gcGFnZS5zeW5vcHNpcztcbiAgaWYgKChwYWdlICE9IG51bGwpICYmIChwYWdlLnN0b3J5ICE9IG51bGwpKSB7XG4gICAgcDEgPSBwYWdlLnN0b3J5WzBdO1xuICAgIHAyID0gcGFnZS5zdG9yeVsxXTtcbiAgICBpZiAocDEgJiYgcDEudHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgIHN5bm9wc2lzIHx8IChzeW5vcHNpcyA9IHAxLnRleHQpO1xuICAgIH1cbiAgICBpZiAocDIgJiYgcDIudHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgIHN5bm9wc2lzIHx8IChzeW5vcHNpcyA9IHAyLnRleHQpO1xuICAgIH1cbiAgICBpZiAocDEgJiYgKHAxLnRleHQgIT0gbnVsbCkpIHtcbiAgICAgIHN5bm9wc2lzIHx8IChzeW5vcHNpcyA9IHAxLnRleHQpO1xuICAgIH1cbiAgICBpZiAocDIgJiYgKHAyLnRleHQgIT0gbnVsbCkpIHtcbiAgICAgIHN5bm9wc2lzIHx8IChzeW5vcHNpcyA9IHAyLnRleHQpO1xuICAgIH1cbiAgICBzeW5vcHNpcyB8fCAoc3lub3BzaXMgPSAocGFnZS5zdG9yeSAhPSBudWxsKSAmJiAoXCJBIHBhZ2Ugd2l0aCBcIiArIHBhZ2Uuc3RvcnkubGVuZ3RoICsgXCIgaXRlbXMuXCIpKTtcbiAgfSBlbHNlIHtcbiAgICBzeW5vcHNpcyA9ICdBIHBhZ2Ugd2l0aCBubyBzdG9yeS4nO1xuICB9XG4gIHJldHVybiBzeW5vcHNpcztcbn07XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuOS4xXG52YXIgYWN0aW9uLCBhbGlnbkl0ZW0sIGJpbmQsIGVudGVyQWN0aW9uLCBlbnRlckl0ZW0sIGl0ZW0sIGxlYXZlQWN0aW9uLCBsZWF2ZUl0ZW0sIHN0YXJ0VGFyZ2V0aW5nLCBzdG9wVGFyZ2V0aW5nLCB0YXJnZXRpbmc7XG5cbnRhcmdldGluZyA9IGZhbHNlO1xuXG5pdGVtID0gbnVsbDtcblxuYWN0aW9uID0gbnVsbDtcblxuYmluZCA9IGZ1bmN0aW9uKCkge1xuICAkKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uKGUpIHtcbiAgICBpZiAoZS5rZXlDb2RlID09PSAxNikge1xuICAgICAgcmV0dXJuIHN0YXJ0VGFyZ2V0aW5nKGUpO1xuICAgIH1cbiAgfSkua2V5dXAoZnVuY3Rpb24oZSkge1xuICAgIGlmIChlLmtleUNvZGUgPT09IDE2KSB7XG4gICAgICByZXR1cm4gc3RvcFRhcmdldGluZyhlKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gJCgnLm1haW4nKS5kZWxlZ2F0ZSgnLml0ZW0nLCAnbW91c2VlbnRlcicsIGVudGVySXRlbSkuZGVsZWdhdGUoJy5pdGVtJywgJ21vdXNlbGVhdmUnLCBsZWF2ZUl0ZW0pLmRlbGVnYXRlKCcuYWN0aW9uJywgJ21vdXNlZW50ZXInLCBlbnRlckFjdGlvbikuZGVsZWdhdGUoJy5hY3Rpb24nLCAnbW91c2VsZWF2ZScsIGxlYXZlQWN0aW9uKS5kZWxlZ2F0ZSgnLnBhZ2UnLCAnYWxpZ24taXRlbScsIGFsaWduSXRlbSk7XG59O1xuXG5zdGFydFRhcmdldGluZyA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIGlkO1xuICB0YXJnZXRpbmcgPSBlLnNoaWZ0S2V5O1xuICBpZiAodGFyZ2V0aW5nKSB7XG4gICAgaWYgKGlkID0gaXRlbSB8fCBhY3Rpb24pIHtcbiAgICAgIHJldHVybiAkKFwiW2RhdGEtaWQ9XCIgKyBpZCArIFwiXVwiKS5hZGRDbGFzcygndGFyZ2V0Jyk7XG4gICAgfVxuICB9XG59O1xuXG5zdG9wVGFyZ2V0aW5nID0gZnVuY3Rpb24oZSkge1xuICB0YXJnZXRpbmcgPSBlLnNoaWZ0S2V5O1xuICBpZiAoIXRhcmdldGluZykge1xuICAgIHJldHVybiAkKCcuaXRlbSwgLmFjdGlvbicpLnJlbW92ZUNsYXNzKCd0YXJnZXQnKTtcbiAgfVxufTtcblxuZW50ZXJJdGVtID0gZnVuY3Rpb24oZSkge1xuICB2YXIgJGl0ZW0sICRwYWdlLCBrZXksIHBsYWNlO1xuICBpdGVtID0gKCRpdGVtID0gJCh0aGlzKSkuYXR0cignZGF0YS1pZCcpO1xuICBpZiAodGFyZ2V0aW5nKSB7XG4gICAgJChcIltkYXRhLWlkPVwiICsgaXRlbSArIFwiXVwiKS5hZGRDbGFzcygndGFyZ2V0Jyk7XG4gICAga2V5ID0gKCRwYWdlID0gJCh0aGlzKS5wYXJlbnRzKCcucGFnZTpmaXJzdCcpKS5kYXRhKCdrZXknKTtcbiAgICBwbGFjZSA9ICRpdGVtLm9mZnNldCgpLnRvcDtcbiAgICByZXR1cm4gJCgnLnBhZ2UnKS50cmlnZ2VyKCdhbGlnbi1pdGVtJywge1xuICAgICAga2V5OiBrZXksXG4gICAgICBpZDogaXRlbSxcbiAgICAgIHBsYWNlOiBwbGFjZVxuICAgIH0pO1xuICB9XG59O1xuXG5sZWF2ZUl0ZW0gPSBmdW5jdGlvbihlKSB7XG4gIGlmICh0YXJnZXRpbmcpIHtcbiAgICAkKCcuaXRlbSwgLmFjdGlvbicpLnJlbW92ZUNsYXNzKCd0YXJnZXQnKTtcbiAgfVxuICByZXR1cm4gaXRlbSA9IG51bGw7XG59O1xuXG5lbnRlckFjdGlvbiA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIGtleTtcbiAgYWN0aW9uID0gJCh0aGlzKS5kYXRhKCdpZCcpO1xuICBpZiAodGFyZ2V0aW5nKSB7XG4gICAgJChcIltkYXRhLWlkPVwiICsgYWN0aW9uICsgXCJdXCIpLmFkZENsYXNzKCd0YXJnZXQnKTtcbiAgICBrZXkgPSAkKHRoaXMpLnBhcmVudHMoJy5wYWdlOmZpcnN0JykuZGF0YSgna2V5Jyk7XG4gICAgcmV0dXJuICQoJy5wYWdlJykudHJpZ2dlcignYWxpZ24taXRlbScsIHtcbiAgICAgIGtleToga2V5LFxuICAgICAgaWQ6IGFjdGlvblxuICAgIH0pO1xuICB9XG59O1xuXG5sZWF2ZUFjdGlvbiA9IGZ1bmN0aW9uKGUpIHtcbiAgaWYgKHRhcmdldGluZykge1xuICAgICQoXCJbZGF0YS1pZD1cIiArIGFjdGlvbiArIFwiXVwiKS5yZW1vdmVDbGFzcygndGFyZ2V0Jyk7XG4gIH1cbiAgcmV0dXJuIGFjdGlvbiA9IG51bGw7XG59O1xuXG5hbGlnbkl0ZW0gPSBmdW5jdGlvbihlLCBhbGlnbikge1xuICB2YXIgJGl0ZW0sICRwYWdlLCBvZmZzZXQsIHBsYWNlO1xuICAkcGFnZSA9ICQodGhpcyk7XG4gIGlmICgkcGFnZS5kYXRhKCdrZXknKSA9PT0gYWxpZ24ua2V5KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gICRpdGVtID0gJHBhZ2UuZmluZChcIi5pdGVtW2RhdGEtaWQ9XCIgKyBhbGlnbi5pZCArIFwiXVwiKTtcbiAgaWYgKCEkaXRlbS5sZW5ndGgpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgcGxhY2UgPSBhbGlnbi5wbGFjZSB8fCAkcGFnZS5oZWlnaHQoKSAvIDI7XG4gIG9mZnNldCA9ICRpdGVtLm9mZnNldCgpLnRvcCArICRwYWdlLnNjcm9sbFRvcCgpIC0gcGxhY2U7XG4gIHJldHVybiAkcGFnZS5zdG9wKCkuYW5pbWF0ZSh7XG4gICAgc2Nyb2xsVG9wOiBvZmZzZXRcbiAgfSwgJ3Nsb3cnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBiaW5kOiBiaW5kXG59O1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjkuMVxudmFyIHV0aWw7XG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbCA9IHt9O1xuXG51dGlsLmZvcm1hdFRpbWUgPSBmdW5jdGlvbih0aW1lKSB7XG4gIHZhciBhbSwgZCwgaCwgbWksIG1vO1xuICBkID0gbmV3IERhdGUoKHRpbWUgPiAxMDAwMDAwMDAwMCA/IHRpbWUgOiB0aW1lICogMTAwMCkpO1xuICBtbyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXVtkLmdldE1vbnRoKCldO1xuICBoID0gZC5nZXRIb3VycygpO1xuICBhbSA9IGggPCAxMiA/ICdBTScgOiAnUE0nO1xuICBoID0gaCA9PT0gMCA/IDEyIDogaCA+IDEyID8gaCAtIDEyIDogaDtcbiAgbWkgPSAoZC5nZXRNaW51dGVzKCkgPCAxMCA/IFwiMFwiIDogXCJcIikgKyBkLmdldE1pbnV0ZXMoKTtcbiAgcmV0dXJuIGggKyBcIjpcIiArIG1pICsgXCIgXCIgKyBhbSArIFwiPGJyPlwiICsgKGQuZ2V0RGF0ZSgpKSArIFwiIFwiICsgbW8gKyBcIiBcIiArIChkLmdldEZ1bGxZZWFyKCkpO1xufTtcblxudXRpbC5mb3JtYXREYXRlID0gZnVuY3Rpb24obXNTaW5jZUVwb2NoKSB7XG4gIHZhciBhbSwgZCwgZGF5LCBoLCBtaSwgbW8sIHNlYywgd2ssIHlyO1xuICBkID0gbmV3IERhdGUobXNTaW5jZUVwb2NoKTtcbiAgd2sgPSBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddW2QuZ2V0RGF5KCldO1xuICBtbyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLCAnT2N0JywgJ05vdicsICdEZWMnXVtkLmdldE1vbnRoKCldO1xuICBkYXkgPSBkLmdldERhdGUoKTtcbiAgeXIgPSBkLmdldEZ1bGxZZWFyKCk7XG4gIGggPSBkLmdldEhvdXJzKCk7XG4gIGFtID0gaCA8IDEyID8gJ0FNJyA6ICdQTSc7XG4gIGggPSBoID09PSAwID8gMTIgOiBoID4gMTIgPyBoIC0gMTIgOiBoO1xuICBtaSA9IChkLmdldE1pbnV0ZXMoKSA8IDEwID8gXCIwXCIgOiBcIlwiKSArIGQuZ2V0TWludXRlcygpO1xuICBzZWMgPSAoZC5nZXRTZWNvbmRzKCkgPCAxMCA/IFwiMFwiIDogXCJcIikgKyBkLmdldFNlY29uZHMoKTtcbiAgcmV0dXJuIHdrICsgXCIgXCIgKyBtbyArIFwiIFwiICsgZGF5ICsgXCIsIFwiICsgeXIgKyBcIjxicj5cIiArIGggKyBcIjpcIiArIG1pICsgXCI6XCIgKyBzZWMgKyBcIiBcIiArIGFtO1xufTtcblxudXRpbC5mb3JtYXRFbGFwc2VkVGltZSA9IGZ1bmN0aW9uKG1zU2luY2VFcG9jaCkge1xuICB2YXIgZGF5cywgaHJzLCBtaW5zLCBtb250aHMsIG1zZWNzLCBzZWNzLCB3ZWVrcywgeWVhcnM7XG4gIG1zZWNzID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBtc1NpbmNlRXBvY2g7XG4gIGlmICgoc2VjcyA9IG1zZWNzIC8gMTAwMCkgPCAyKSB7XG4gICAgcmV0dXJuIChNYXRoLmZsb29yKG1zZWNzKSkgKyBcIiBtaWxsaXNlY29uZHMgYWdvXCI7XG4gIH1cbiAgaWYgKChtaW5zID0gc2VjcyAvIDYwKSA8IDIpIHtcbiAgICByZXR1cm4gKE1hdGguZmxvb3Ioc2VjcykpICsgXCIgc2Vjb25kcyBhZ29cIjtcbiAgfVxuICBpZiAoKGhycyA9IG1pbnMgLyA2MCkgPCAyKSB7XG4gICAgcmV0dXJuIChNYXRoLmZsb29yKG1pbnMpKSArIFwiIG1pbnV0ZXMgYWdvXCI7XG4gIH1cbiAgaWYgKChkYXlzID0gaHJzIC8gMjQpIDwgMikge1xuICAgIHJldHVybiAoTWF0aC5mbG9vcihocnMpKSArIFwiIGhvdXJzIGFnb1wiO1xuICB9XG4gIGlmICgod2Vla3MgPSBkYXlzIC8gNykgPCAyKSB7XG4gICAgcmV0dXJuIChNYXRoLmZsb29yKGRheXMpKSArIFwiIGRheXMgYWdvXCI7XG4gIH1cbiAgaWYgKChtb250aHMgPSBkYXlzIC8gMzEpIDwgMikge1xuICAgIHJldHVybiAoTWF0aC5mbG9vcih3ZWVrcykpICsgXCIgd2Vla3MgYWdvXCI7XG4gIH1cbiAgaWYgKCh5ZWFycyA9IGRheXMgLyAzNjUpIDwgMikge1xuICAgIHJldHVybiAoTWF0aC5mbG9vcihtb250aHMpKSArIFwiIG1vbnRocyBhZ29cIjtcbiAgfVxuICByZXR1cm4gKE1hdGguZmxvb3IoeWVhcnMpKSArIFwiIHllYXJzIGFnb1wiO1xufTtcbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS45LjFcbnZhciBkaWFsb2csIGVkaXRvciwgaXRlbXosIGxpbmssIHBhZ2VIYW5kbGVyLCBwbHVnaW4sIHJlc29sdmUsIHdpa2ksXG4gIHNsaWNlID0gW10uc2xpY2U7XG5cbndpa2kgPSB7fTtcblxud2lraS5hc1NsdWcgPSByZXF1aXJlKCcuL3BhZ2UnKS5hc1NsdWc7XG5cbml0ZW16ID0gcmVxdWlyZSgnLi9pdGVteicpO1xuXG53aWtpLnJlbW92ZUl0ZW0gPSBpdGVtei5yZW1vdmVJdGVtO1xuXG53aWtpLmNyZWF0ZUl0ZW0gPSBpdGVtei5jcmVhdGVJdGVtO1xuXG53aWtpLmdldEl0ZW0gPSBpdGVtei5nZXRJdGVtO1xuXG5kaWFsb2cgPSByZXF1aXJlKCcuL2RpYWxvZycpO1xuXG53aWtpLmRpYWxvZyA9IGRpYWxvZy5vcGVuO1xuXG5saW5rID0gcmVxdWlyZSgnLi9saW5rJyk7XG5cbndpa2kuY3JlYXRlUGFnZSA9IGxpbmsuY3JlYXRlUGFnZTtcblxud2lraS5kb0ludGVybmFsTGluayA9IGxpbmsuZG9JbnRlcm5hbExpbms7XG5cbnBsdWdpbiA9IHJlcXVpcmUoJy4vcGx1Z2luJyk7XG5cbndpa2kuZ2V0U2NyaXB0ID0gcGx1Z2luLmdldFNjcmlwdDtcblxud2lraS5nZXRQbHVnaW4gPSBwbHVnaW4uZ2V0UGx1Z2luO1xuXG53aWtpLmRvUGx1Z2luID0gcGx1Z2luLmRvUGx1Z2luO1xuXG53aWtpLnJlZ2lzdGVyUGx1Z2luID0gcGx1Z2luLnJlZ2lzdGVyUGx1Z2luO1xuXG53aWtpLmdldERhdGEgPSBmdW5jdGlvbih2aXMpIHtcbiAgdmFyIGlkeCwgd2hvO1xuICBpZiAodmlzKSB7XG4gICAgaWR4ID0gJCgnLml0ZW0nKS5pbmRleCh2aXMpO1xuICAgIHdobyA9ICQoXCIuaXRlbTpsdChcIiArIGlkeCArIFwiKVwiKS5maWx0ZXIoJy5jaGFydCwuZGF0YSwuY2FsY3VsYXRvcicpLmxhc3QoKTtcbiAgICBpZiAod2hvICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB3aG8uZGF0YSgnaXRlbScpLmRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgd2hvID0gJCgnLmNoYXJ0LC5kYXRhLC5jYWxjdWxhdG9yJykubGFzdCgpO1xuICAgIGlmICh3aG8gIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHdoby5kYXRhKCdpdGVtJykuZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgfVxufTtcblxud2lraS5nZXREYXRhTm9kZXMgPSBmdW5jdGlvbih2aXMpIHtcbiAgdmFyIGlkeCwgd2hvO1xuICBpZiAodmlzKSB7XG4gICAgaWR4ID0gJCgnLml0ZW0nKS5pbmRleCh2aXMpO1xuICAgIHdobyA9ICQoXCIuaXRlbTpsdChcIiArIGlkeCArIFwiKVwiKS5maWx0ZXIoJy5jaGFydCwuZGF0YSwuY2FsY3VsYXRvcicpLnRvQXJyYXkoKS5yZXZlcnNlKCk7XG4gICAgcmV0dXJuICQod2hvKTtcbiAgfSBlbHNlIHtcbiAgICB3aG8gPSAkKCcuY2hhcnQsLmRhdGEsLmNhbGN1bGF0b3InKS50b0FycmF5KCkucmV2ZXJzZSgpO1xuICAgIHJldHVybiAkKHdobyk7XG4gIH1cbn07XG5cbndpa2kubG9nID0gZnVuY3Rpb24oKSB7XG4gIHZhciB0aGluZ3M7XG4gIHRoaW5ncyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICBpZiAoKHR5cGVvZiBjb25zb2xlICE9PSBcInVuZGVmaW5lZFwiICYmIGNvbnNvbGUgIT09IG51bGwgPyBjb25zb2xlLmxvZyA6IHZvaWQgMCkgIT0gbnVsbCkge1xuICAgIHJldHVybiBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCB0aGluZ3MpO1xuICB9XG59O1xuXG53aWtpLm5laWdoYm9yaG9vZCA9IHJlcXVpcmUoJy4vbmVpZ2hib3Job29kJykuc2l0ZXM7XG5cbndpa2kubmVpZ2hib3Job29kT2JqZWN0ID0gcmVxdWlyZSgnLi9uZWlnaGJvcmhvb2QnKTtcblxucGFnZUhhbmRsZXIgPSByZXF1aXJlKCcuL3BhZ2VIYW5kbGVyJyk7XG5cbndpa2kucGFnZUhhbmRsZXIgPSBwYWdlSGFuZGxlcjtcblxud2lraS51c2VMb2NhbFN0b3JhZ2UgPSBwYWdlSGFuZGxlci51c2VMb2NhbFN0b3JhZ2U7XG5cbnJlc29sdmUgPSByZXF1aXJlKCcuL3Jlc29sdmUnKTtcblxud2lraS5yZXNvbHZlRnJvbSA9IHJlc29sdmUucmVzb2x2ZUZyb207XG5cbndpa2kucmVzb2x2ZUxpbmtzID0gcmVzb2x2ZS5yZXNvbHZlTGlua3M7XG5cbndpa2kucmVzb2x1dGlvbkNvbnRleHQgPSByZXNvbHZlLnJlc29sdXRpb25Db250ZXh0O1xuXG5lZGl0b3IgPSByZXF1aXJlKCcuL2VkaXRvcicpO1xuXG53aWtpLnRleHRFZGl0b3IgPSBlZGl0b3IudGV4dEVkaXRvcjtcblxud2lraS51dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbndpa2kucGVyc29uYSA9IHJlcXVpcmUoJy4vcGVyc29uYScpO1xuXG53aWtpLmNyZWF0ZVN5bm9wc2lzID0gcmVxdWlyZSgnLi9zeW5vcHNpcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHdpa2k7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iXX0=
