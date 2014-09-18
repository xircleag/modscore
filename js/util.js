/**
 * This module contains a subset of underscorejs, with some modifications where needed.
 * @class overscore.Util
 * @singleton
 * @author Michael Kantor
 *
 */

//     Miniunderscore, derived from Underscore.js 1.7.0

  // Baseline setup
  // --------------

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

  // Current version.
  _.VERSION = '1.0.0';

  /**
   * Turns strings such as "xxx_yyy_zzz" into "xxxYyyZzz".
   * @method camelCase
   * @param {string} str - The string to transform
   * @param {boolean} [firstLetter=false] - If true, automatically capitalizes the first letter of the string (even if not preceded by '_')
   * @return {string}
   */
  _.camelCase = function(str, firstLetter) {
    if (firstLetter) str = str.charAt(0).toUpperCase() + str.substring(1);
    return str.replace(/_(.)/g, function(inValue) {
      return inValue.substring(1).toUpperCase();
    });
  };

  /**
   * Returns a unique Id
   * @method uniqueId
   * @param {String} [prefix] - String to prefix your unique identifier with
   * @return {String}
   */
  var idCounters = {};
  _.uniqueId = function(prefix) {
    if (!(prefix in idCounters)) idCounters[prefix] = 0;
    var id = ++idCounters[prefix]  + '';
    return prefix ? prefix + id : id;
  };

  /**
   * The cornerstone, an `each` implementation, aka `forEach`.
   * Handles raw objects in addition to array-likes.
   * @method each
   * @param {Object} obj - Object whose properties are to be iterated, OR an array to iterate over
   * @param {Function} callback - Method to call on each iteration
   * @param {Any} callback.value - Value stored in an array or Object
   * @param {String | Number} callback.index - For Object, index is the key associated with the value. For arrays index is the index in the array.
   * @param {Object} callback.obj - Object/Array we are iterating over
   * @param {Any} [context] - Context for the callback's this pointer
   */
  _.each = function(obj, callback, context) {
    if (obj == null) return obj;
    if (_.isArray(obj)) {
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

  /**
   * Returns the first matching element in the array.
   *
      // Return the first even number in the array
      var even = m_.find([1,3,5,8,13], function(value, index) {
        if (value % 2 == 0) return true;
      });
      console.log(even);
      > 8
   *
   * @method find
   * @param {[Any]} inArray - Array to search
   * @param {Function} callback - Function; returns true to signal that its found a result to return
   * @param {Any} callback.value - Value from the array
   * @param {Number} callback.index - Index in the array
   * @param {[Any]} callback.inArray - Array that we are iterating over
   * @param {Object} [context] - The this pointer to use within the callback
   */
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

  /**
   * Simplifies sorting; instead of using Array.sort() and returning -1, 0 or 1, you can instead
   * return a value to be sorted using the standard value comparison already built into Array.sort
   *
      // Sort all anchors on the page by their href property
      var links = document.querySelectorAll("a");
      var sortedLinks = m_.sortBy(links, function(link, index) {
        return link.href;
      });
   *
   * @method sortBy
   * @param {[Any]} inArray - Array to sort
   * @param {Function} callback - Function; returns the value to use in the sort
   * @param {Any} callback.value - Value from the array
   * @param {Number} callback.index - Index in the array
   * @param {[Any]} callback.inArray - Array that we are iterating over
   * @param {Object} [context] - The this pointer to use within the callback
   */
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

  /**
   * Simplification of Array.filter that lets you specify a matching criteria

      // extract from objects array all objects where a=5
      var objects = [{a: 5, b: 1}, {a: 5, b: 10}, {a: 10, b: 10}, {a: 5, b: 15}];
      m_.filterWhere(objects, {a:5});
      > [{a:5,b:1},{a:5,b:10},{a:5,b:15}]

      // Can work recursively:
      var objects = [{a: {b: 8, c: 10}}, {a: {b: 3, c: 10}}, {a: {b: 5, c: 10}}];
      m_.filterWhere(objects, {a: {b: 5}});
      > [{a: {b: 5, c: 10}}]
  * @method filterWhere
  * @param {[Any]} inArray - Array to filter
  * @param {Object} attrs - Attributes to match
  *
  * @note Recursive filter is not supported in the original underscorejs
  */
  _.filterWhere = function(inArray, attrs) {
    return inArray.filter(_.matches(attrs));
  };

  /**
   * Simplification of m_.find that lets you specify a matching criteria

      // extract from objects array first object where a=5
      var objects = [{a: 5, b: 1}, {a: 5, b: 10}, {a: 10, b: 10}, {a: 5, b: 15}];
      m_.findWhere(objects, {a:5});
      > {a:5,b:1}

      // Can work recursively:
      var objects = [{a: {b: 8, c: 10}}, {a: {b: 3, c: 10}}, {a: {b: 5, c: 10}}];
      m_.findWhere(objects, {a: {b: 5}});
      > {a: {b: 5, c: 10}}
  * @method filterWhere
  * @param {[Any]} inArray - Array to search
  * @param {Object} attrs - Attributes to match
  *
  * @note Recursive find is not supported in the original underscorejs
  */
  _.findWhere = function(inArray, attrs) {
    return _.find(inArray, _.matches(attrs));
  };

  // Function
  // ------------------

/*
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
*/

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

  /**
   * Defers a function, scheduling it to run after the current call stack has
   * cleared.  Simplified version of window.setTimeout(f.bind(a,b,c,...), 1)
   * @method defer
   * @param {Function} func - The function to call after a delay
   * @param {Object} [context] - The this pointer; required if you are passing in function args
   * @param {...any} args - Any arguments that you want passed into func when its called
   */
  _.defer = function(func, context) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();args.shift();
    setTimeout(function(){
      func.apply(context, args);
    }, 1);
  };


  /**
   * Returns a debounced function.  The function will be called after it stops being called for
   * N milliseconds.
   *
   * Changes from underscorejs: immediate behaves diferntly.
   *
   * @method debounce
   * @param {Function} func - Function whose frequency of calling will be regulated
   * @param {number} wait - Number of miliseconds to wait
   * @param {number} immediate -
   *     - 0: Default behavior (wait x miliseconds before triggering function).
   *     - 1: Execute immediately, squelch subsequent calls until wait is completed
   *     - 2: Execute immediately, defer subsequent calls until wait is completed
   * @return {Function} - This function will call your function given the rules specified in the other parameters
   */
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = Date.now() - timestamp;

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
      timestamp = Date.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  /**
   * Returns a function that will call Your function at most one time, no matter how
   * often you call it. Useful for lazy initialization.
   * @method once
   * @param {Function} func - The function that should only be called once
   * @return {Function} - A function you can call many times, but which will only call func the first time
   */
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

  /**
   * Standard mixin method for copying all properties from object's 2, 3,... n into object 1.
   *
   * @method extend
   * @param {Object} obj - object to copy all properties into
   * @param {...Object} args - 1 or more objects whose properties will be copied into object 1.
   * Last object's properties will overwrite any similarly named properties of the previous objects.
   *
   * @return {Object} - Returns the first object after its been modified
   */
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

  /**
   * Same as extend, but only copies over a value if the property does not yet have a value.
   * Useful for passing in default values to be used if there aren't already values.
   * @method defaults
   * @param {Object} obj - object to copy all properties into
   * @param {...Object} args - 1 or more objects whose properties will be copied into object 1.
   * @return {Object} - Returns the first object after its been modified
   */
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

  /**
   * Quick clone which doesn't try to do a depth traversal.  Basically creates a new pointer
   * that points to the same values and objects as the old pointer
   * @method clone
   * @param {Object} obj - Object to clone
   * @return {Object} - Copy of obj
   */
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  /**
   * Very efficient clone method that clones the entire object.
   * Any objects contained by this object will be cloned as well.
   * If you have any pointer loops, dom nodes, listener arrays, you probably shouldn't use this.
   * @method cloneDeep
   * @param {Object} obj - Object to clone
   * @return {Object} - Copy of objv
   */
  _.cloneDeep = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  /**
   * Returns true if the specied object, array or string is empty
   * @method isEmpty
   * @param {Any} obj
   * @returns {Boolean} - True if its an object with no properties. True if its an empty array. True if its a string of length 0
   */
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || typeof obj == "string" || _.isArguments(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  /**
   * Is the parameter a Function Arguments object?
   * @method isArguments
   * @param {Any} - Any value
   * @returns {Boolean} - Is the value an Arguments object
   */
  _.isArguments = function(obj) {
      if (toString.call(arguments) === '[object Arguments]') {
        return toString.call(obj) == '[object Arguments]';
      } else {
        return _.has(obj, 'callee');
      }
  };

  /**
   * Is the parameter a DOM element?
   * @method isElement
   * @param {Any} - Any value
   * @returns {Boolean} - Is the value a DOM element
   */
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  /**
   * Is the parameter an array?
   * @method isArray
   * @param {Any} - Any value
   * @returns {Boolean} - Is the value an array
   */
  _.isArray = Array.isArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  /**
   * Is the parameter an Object?  This is particularlly important because
   * typeof null === object, which is entirely useless for people who
   * are testing to see if something is an object.
   * @method isObject
   * @param {Any} - Any value
   * @returns {Boolean} - Is the value an object
   */
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  /**
   * Is the parameter a function?
   * @method isFunction
   * @param {Any} - Any value
   * @returns {Boolean} - Is the value a function
   */
  _.isFunction = function(obj) {
    return typeof obj == 'function' || false;
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

  module.exports = _; // Used when importing this via browserify/npm

