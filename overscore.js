//     Miniunderscore, derived from Underscore.js 1.7.0
(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeKeys         = Object.keys;

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
    exports.m_ = _;
  }

  root.m_ = _;


  // Current version.
  _.VERSION = '1.0.0';

  _.camelCase = function(str, firstLetter) {
    if (firstLetter) str = str.charAt(0).toUpperCase() + str.substring(1);
    return str.replace(/_(.)/g, function(inValue) {
      return inValue.substring(1).toUpperCase();
    });
  };

  var id = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };


  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = function(obj, callback, context) {
    if (obj == null) return obj;
    if (m_.isArray(obj)) {
      obj.forEach(callback, context);
    } else {
      var keys = _.keys(obj);
      if (context) callback = callback.bind(context);
      for (var i = 0, length = keys.length; i < length; i++) {
        callback(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };


  // Return the first value which passes a truth test.
  _.find = function(inArray, callback, context) {
    var result;
    if (context) callback = callback.bind(context);
    inArray.some(function(value, index, inArray) {
      if (callback(value, index, inArray)) {
        result = value;
        return true;
      }
    });
    return result;
  };


  // Sort the object's values by a criterion produced by an iteratee.
  // iteratee is either a callback returning a value, or the name of a property of
  // an element of the object
  _.sortBy = function(inArray, callback, context) {
    if (context) callback = callback.bind(context);
    var mappedArray = inArray.map(function(value, index, inArray) {
      return {
        value: value,
        index: index,
        criteria: callback(value, index, inArray)
      };
    });

    mappedArray.sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    });

    return mappedArray.map(function(obj) {
      return obj.value;
    });
  };


  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.filterWhere = function(inArray, attrs) {
    return inArray.filter(_.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(inArray, attrs) {
    return _.find(inArray, _.matches(attrs));
  };


  // Function
  // ------------------

  // Memoize an expensive function by storing its results.
  _.memoize = function(func) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  /*
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };
*/

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return window.setTimeout.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  // MICHAELS CHANGES:
  // immediate=0 || immediate=false: Default behavior (wait x miliseconds before triggering function)
  // immediate=1 || immediate=true: Execute immediately, squelch subsequent calls until wait is completed
  // immediate=2: Execute immediately, defer subsequent calls until wait is completed

  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate || immediate == 2) {
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

  // Object Functions
  // ----------------

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  // MICHAEL: Filters out parent classes properties, which helps us ignore properties of Object itself.
  // WARNING: Will return functions if they are set in the constructor instead of set in the prototype.
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
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Michael: Useful primarily for _.matches function.
  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj, recursive) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    if (recursive) {
      for (var i = 0; i < length; i++) {
        if (_.isObject(pairs[i][1]) && !_.isFunction(pairs[i][1])) {
          pairs[i][1] = _.pairs(pairs[i][1], true);
        }
      }
    }
    return pairs;
  };


  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };



  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    if (!_.isObject(obj)) return obj;
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];
      for (prop in source) {
        if (hasOwnProperty.call(source, prop)) {
            obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };


  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    if (!_.isObject(obj)) return obj;
    for (var i = 1, length = arguments.length; i < length; i++) {
      var source = arguments[i];
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    }
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  _.cloneDeep = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };


  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || typeof obj == "string" || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  _.isArguments = function(obj) {
      if (toString.call(arguments) === '[object Arguments]') {
        return toString.call(obj) == '[object Arguments]';
      } else {
        return _.has(obj, 'callee');
      }
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  _.isFunction = function(obj) {
    return typeof obj == 'function' || false;
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };


    // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    var pairs = _.pairs(attrs, true), length = pairs.length;
    var returnFunc = function(obj) {
      if (obj == null) return !length;
      obj = new Object(obj);
      for (var i = 0; i < length; i++) {
        var pair = pairs[i], key = pair[0], val = pair[1];
        if (_.isArray(val)) {
          var parentPairs = pairs;
          pairs = val;
          var result = returnFunc(obj[key]);
          pairs = parentPairs;
          return result;
        } else {
          if (pair[1] !== obj[key] || !(key in obj)) return false;
        }
      }
      return true;
    };
    return returnFunc;
  };


  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('miniunderscore', [], function() {
      return _;
    });
  }
}.call(this));
