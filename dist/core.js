(function(window) {
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

    // Baseline setup
    // --------------

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self == 'object' && self.self === self && self ||
        typeof global == 'object' && global.global === global && global ||
        this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype, ObjProto = Object.prototype;
    var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

    // Create quick reference variables for speed access to core prototypes.
    var push = ArrayProto.push,
        slice = ArrayProto.slice,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeCreate = Object.create;

    // Naked function reference for surrogate-prototype-swapping.
    var Ctor = function(){};

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for their old module API. If we're in
    // the browser, add `_` as a global object.
    // (`nodeType` is checked to ensure that `module`
    // and `exports` are not HTML elements.)
    if (typeof exports != 'undefined' && !exports.nodeType) {
        if (typeof module != 'undefined' && !module.nodeType && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }

    // Current version.
    _.VERSION = '1.8.3';

    // Internal function that returns an efficient (for current engines) version
    // of the passed-in callback, to be repeatedly applied in other Underscore
    // functions.
    var optimizeCb = function(func, context, argCount) {
        if (context === void 0) return func;
        switch (argCount == null ? 3 : argCount) {
            case 1: return function(value) {
                return func.call(context, value);
            };
            // The 2-parameter case has been omitted only because no current consumers
            // made use of it.
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

    // An internal function to generate callbacks that can be applied to each
    // element in a collection, returning the desired result — either `identity`,
    // an arbitrary callback, a property matcher, or a property accessor.
    var cb = function(value, context, argCount) {
        if (value == null) return _.identity;
        if (_.isFunction(value)) return optimizeCb(value, context, argCount);
        if (_.isObject(value)) return _.matcher(value);
        return _.property(value);
    };

    // An external wrapper for the internal callback generator.
    _.iteratee = function(value, context) {
        return cb(value, context, Infinity);
    };

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    var restArgs = function(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
                case 2: return func.call(this, arguments[0], arguments[1], rest);
            }
            var args = Array(startIndex + 1);
            for (index = 0; index < startIndex; index++) {
                args[index] = arguments[index];
            }
            args[startIndex] = rest;
            return func.apply(this, args);
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

    var property = function(key) {
        return function(obj) {
            return obj == null ? void 0 : obj[key];
        };
    };

    // Helper for collection methods to determine whether a collection
    // should be iterated as an array or as an object.
    // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
    // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var getLength = property('length');
    var isArrayLike = function(collection) {
        var length = getLength(collection);
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
    var createReduce = function(dir) {
        // Wrap code that reassigns argument variables in a separate function than
        // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
        var reducer = function(obj, iteratee, memo, initial) {
            var keys = !isArrayLike(obj) && _.keys(obj),
                length = (keys || obj).length,
                index = dir > 0 ? 0 : length - 1;
            if (!initial) {
                memo = obj[keys ? keys[index] : index];
                index += dir;
            }
            for (; index >= 0 && index < length; index += dir) {
                var currentKey = keys ? keys[index] : index;
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
        };

        return function(obj, iteratee, memo, context) {
            var initial = arguments.length >= 3;
            return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
        };
    };

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

    // Determine if the array or object contains a given item (using `===`).
    // Aliased as `includes` and `include`.
    _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
        if (!isArrayLike(obj)) obj = _.values(obj);
        if (typeof fromIndex != 'number' || guard) fromIndex = 0;
        return _.indexOf(obj, item, fromIndex) >= 0;
    };

    // Invoke a method (with arguments) on every item in a collection.
    _.invoke = restArgs(function(obj, method, args) {
        var isFunc = _.isFunction(method);
        return _.map(obj, function(value) {
            var func = isFunc ? method : value[method];
            return func == null ? func : func.apply(value, args);
        });
    });

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
        if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value != null && value > result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function(v, index, list) {
                computed = iteratee(v, index, list);
                if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                    result = v;
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
        if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value != null && value < result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function(v, index, list) {
                computed = iteratee(v, index, list);
                if (computed < lastComputed || computed === Infinity && result === Infinity) {
                    result = v;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };

    // Shuffle a collection.
    _.shuffle = function(obj) {
        return _.sample(obj, Infinity);
    };

    // Sample **n** random values from a collection using the modern version of the
    // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
    // If **n** is not specified, returns a single random element.
    // The internal `guard` argument allows it to work with `map`.
    _.sample = function(obj, n, guard) {
        if (n == null || guard) {
            if (!isArrayLike(obj)) obj = _.values(obj);
            return obj[_.random(obj.length - 1)];
        }
        var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
        var length = getLength(sample);
        n = Math.max(Math.min(n, length), 0);
        var last = length - 1;
        for (var index = 0; index < n; index++) {
            var rand = _.random(index, last);
            var temp = sample[index];
            sample[index] = sample[rand];
            sample[rand] = temp;
        }
        return sample.slice(0, n);
    };

    // Sort the object's values by a criterion produced by an iteratee.
    _.sortBy = function(obj, iteratee, context) {
        var index = 0;
        iteratee = cb(iteratee, context);
        return _.pluck(_.map(obj, function(value, key, list) {
            return {
                value: value,
                index: index++,
                criteria: iteratee(value, key, list)
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
    var group = function(behavior, partition) {
        return function(obj, iteratee, context) {
            var result = partition ? [[], []] : {};
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

    var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
    // Safely create a real, live array from anything iterable.
    _.toArray = function(obj) {
        if (!obj) return [];
        if (_.isArray(obj)) return slice.call(obj);
        if (_.isString(obj)) {
            // Keep surrogate pair characters together
            return obj.match(reStrSymbol);
        }
        if (isArrayLike(obj)) return _.map(obj);
        return _.values(obj);
    };

    // Return the number of elements in an object.
    _.size = function(obj) {
        if (obj == null) return 0;
        return isArrayLike(obj) ? obj.length : _.keys(obj).length;
    };

    // Split a collection into two arrays: one whose elements all satisfy the given
    // predicate, and one whose elements all do not satisfy the predicate.
    _.partition = group(function(result, value, pass) {
        result[pass ? 0 : 1].push(value);
    }, true);

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
        return _.filter(array);
    };

    // Internal implementation of a recursive `flatten` function.
    var flatten = function(input, shallow, strict, output) {
        output = output || [];
        var idx = output.length;
        for (var i = 0, length = getLength(input); i < length; i++) {
            var value = input[i];
            if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                // Flatten current level of array or arguments object.
                if (shallow) {
                    var j = 0, len = value.length;
                    while (j < len) output[idx++] = value[j++];
                } else {
                    flatten(value, shallow, strict, output);
                    idx = output.length;
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
    _.without = restArgs(function(array, otherArrays) {
        return _.difference(array, otherArrays);
    });

    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // Aliased as `unique`.
    _.uniq = _.unique = function(array, isSorted, iteratee, context) {
        if (!_.isBoolean(isSorted)) {
            context = iteratee;
            iteratee = isSorted;
            isSorted = false;
        }
        if (iteratee != null) iteratee = cb(iteratee, context);
        var result = [];
        var seen = [];
        for (var i = 0, length = getLength(array); i < length; i++) {
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
    _.union = restArgs(function(arrays) {
        return _.uniq(flatten(arrays, true, true));
    });

    // Produce an array that contains every item shared between all the
    // passed-in arrays.
    _.intersection = function(array) {
        var result = [];
        var argsLength = arguments.length;
        for (var i = 0, length = getLength(array); i < length; i++) {
            var item = array[i];
            if (_.contains(result, item)) continue;
            var j;
            for (j = 1; j < argsLength; j++) {
                if (!_.contains(arguments[j], item)) break;
            }
            if (j === argsLength) result.push(item);
        }
        return result;
    };

    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    _.difference = restArgs(function(array, rest) {
        rest = flatten(rest, true, true);
        return _.filter(array, function(value){
            return !_.contains(rest, value);
        });
    });

    // Complement of _.zip. Unzip accepts an array of arrays and groups
    // each array's elements on shared indices.
    _.unzip = function(array) {
        var length = array && _.max(array, getLength).length || 0;
        var result = Array(length);

        for (var index = 0; index < length; index++) {
            result[index] = _.pluck(array, index);
        }
        return result;
    };

    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    _.zip = restArgs(_.unzip);

    // Converts lists into objects. Pass either a single array of `[key, value]`
    // pairs, or two parallel arrays of the same length -- one of keys, and one of
    // the corresponding values.
    _.object = function(list, values) {
        var result = {};
        for (var i = 0, length = getLength(list); i < length; i++) {
            if (values) {
                result[list[i]] = values[i];
            } else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };

    // Generator function to create the findIndex and findLastIndex functions.
    var createPredicateIndexFinder = function(dir) {
        return function(array, predicate, context) {
            predicate = cb(predicate, context);
            var length = getLength(array);
            var index = dir > 0 ? 0 : length - 1;
            for (; index >= 0 && index < length; index += dir) {
                if (predicate(array[index], index, array)) return index;
            }
            return -1;
        };
    };

    // Returns the first index on an array-like that passes a predicate test.
    _.findIndex = createPredicateIndexFinder(1);
    _.findLastIndex = createPredicateIndexFinder(-1);

    // Use a comparator function to figure out the smallest index at which
    // an object should be inserted so as to maintain order. Uses binary search.
    _.sortedIndex = function(array, obj, iteratee, context) {
        iteratee = cb(iteratee, context, 1);
        var value = iteratee(obj);
        var low = 0, high = getLength(array);
        while (low < high) {
            var mid = Math.floor((low + high) / 2);
            if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
        }
        return low;
    };

    // Generator function to create the indexOf and lastIndexOf functions.
    var createIndexFinder = function(dir, predicateFind, sortedIndex) {
        return function(array, item, idx) {
            var i = 0, length = getLength(array);
            if (typeof idx == 'number') {
                if (dir > 0) {
                    i = idx >= 0 ? idx : Math.max(idx + length, i);
                } else {
                    length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
                }
            } else if (sortedIndex && idx && length) {
                idx = sortedIndex(array, item);
                return array[idx] === item ? idx : -1;
            }
            if (item !== item) {
                idx = predicateFind(slice.call(array, i, length), _.isNaN);
                return idx >= 0 ? idx + i : -1;
            }
            for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
                if (array[idx] === item) return idx;
            }
            return -1;
        };
    };

    // Return the position of the first occurrence of an item in an array,
    // or -1 if the item is not included in the array.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
    _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    _.range = function(start, stop, step) {
        if (stop == null) {
            stop = start || 0;
            start = 0;
        }
        if (!step) {
            step = stop < start ? -1 : 1;
        }

        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);

        for (var idx = 0; idx < length; idx++, start += step) {
            range[idx] = start;
        }

        return range;
    };

    // Split an **array** into several arrays containing **count** or less elements
    // of initial array.
    _.chunk = function(array, count) {
        if (count == null || count < 1) return [];

        var result = [];
        var i = 0, length = array.length;
        while (i < length) {
            result.push(slice.call(array, i, i += count));
        }
        return result;
    };

    // Function (ahem) Functions
    // ------------------

    // Determines whether to execute a function as a constructor
    // or a normal function with the provided arguments.
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
    _.bind = restArgs(function(func, context, args) {
        if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
        var bound = restArgs(function(callArgs) {
            return executeBound(func, bound, context, this, args.concat(callArgs));
        });
        return bound;
    });

    // Partially apply a function by creating a version that has had some of its
    // arguments pre-filled, without changing its dynamic `this` context. _ acts
    // as a placeholder by default, allowing any combination of arguments to be
    // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
    _.partial = restArgs(function(func, boundArgs) {
        var placeholder = _.partial.placeholder;
        var bound = function() {
            var position = 0, length = boundArgs.length;
            var args = Array(length);
            for (var i = 0; i < length; i++) {
                args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
            }
            while (position < arguments.length) args.push(arguments[position++]);
            return executeBound(func, bound, this, this, args);
        };
        return bound;
    });

    _.partial.placeholder = _;

    // Bind a number of an object's methods to that object. Remaining arguments
    // are the method names to be bound. Useful for ensuring that all callbacks
    // defined on an object belong to it.
    _.bindAll = restArgs(function(obj, keys) {
        keys = flatten(keys, false, false);
        var index = keys.length;
        if (index < 1) throw new Error('bindAll must be passed function names');
        while (index--) {
            var key = keys[index];
            obj[key] = _.bind(obj[key], obj);
        }
    });

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
    _.delay = restArgs(function(func, wait, args) {
        return setTimeout(function() {
            return func.apply(null, args);
        }, wait);
    });

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    _.defer = _.partial(_.delay, _, 1);

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    _.throttle = function(func, wait, options) {
        var timeout, context, args, result;
        var previous = 0;
        if (!options) options = {};

        var later = function() {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };

        var throttled = function() {
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

        throttled.cancel = function() {
            clearTimeout(timeout);
            previous = 0;
            timeout = context = args = null;
        };

        return throttled;
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    _.debounce = function(func, wait, immediate) {
        var timeout, result;

        var later = function(context, args) {
            timeout = null;
            if (args) result = func.apply(context, args);
        };

        var debounced = restArgs(function(args) {
            var callNow = immediate && !timeout;
            if (timeout) clearTimeout(timeout);
            if (callNow) {
                timeout = setTimeout(later, wait);
                result = func.apply(this, args);
            } else if (!immediate) {
                timeout = _.delay(later, wait, this, args);
            }

            return result;
        });

        debounced.cancel = function() {
            clearTimeout(timeout);
            timeout = null;
        };

        return debounced;
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

    _.restArgs = restArgs;

    // Object Functions
    // ----------------

    // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
    var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
    var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
        'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

    var collectNonEnumProps = function(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;
        var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

        // Constructor is a special case.
        var prop = 'constructor';
        if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

        while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                keys.push(prop);
            }
        }
    };

    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`.
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

    // Returns the results of applying the iteratee to each element of the object.
    // In contrast to _.map it returns an object.
    _.mapObject = function(obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = _.keys(obj),
            length = keys.length,
            results = {};
        for (var index = 0; index < length; index++) {
            var currentKey = keys[index];
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
    // Aliased as `methods`.
    _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };

    // An internal function for creating assigner functions.
    var createAssigner = function(keysFunc, defaults) {
        return function(obj) {
            var length = arguments.length;
            if (defaults) obj = Object(obj);
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
                var source = arguments[index],
                    keys = keysFunc(source),
                    l = keys.length;
                for (var i = 0; i < l; i++) {
                    var key = keys[i];
                    if (!defaults || obj[key] === void 0) obj[key] = source[key];
                }
            }
            return obj;
        };
    };

    // Extend a given object with all the properties in passed-in object(s).
    _.extend = createAssigner(_.allKeys);

    // Assigns a given object with all the own properties in the passed-in object(s).
    // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
    _.extendOwn = _.assign = createAssigner(_.keys);

    // Returns the first key on an object that passes a predicate test.
    _.findKey = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = _.keys(obj), key;
        for (var i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (predicate(obj[key], key, obj)) return key;
        }
    };

    // Internal pick helper function to determine if `obj` has key `key`.
    var keyInObj = function(value, key, obj) {
        return key in obj;
    };

    // Return a copy of the object only containing the whitelisted properties.
    _.pick = restArgs(function(obj, keys) {
        var result = {}, iteratee = keys[0];
        if (obj == null) return result;
        if (_.isFunction(iteratee)) {
            if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
            keys = _.allKeys(obj);
        } else {
            iteratee = keyInObj;
            keys = flatten(keys, false, false);
            obj = Object(obj);
        }
        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var value = obj[key];
            if (iteratee(value, key, obj)) result[key] = value;
        }
        return result;
    });

    // Return a copy of the object without the blacklisted properties.
    _.omit = restArgs(function(obj, keys) {
        var iteratee = keys[0], context;
        if (_.isFunction(iteratee)) {
            iteratee = _.negate(iteratee);
            if (keys.length > 1) context = keys[1];
        } else {
            keys = _.map(flatten(keys, false, false), String);
            iteratee = function(value, key) {
                return !_.contains(keys, key);
            };
        }
        return _.pick(obj, iteratee, context);
    });

    // Fill in a given object with default properties.
    _.defaults = createAssigner(_.allKeys, true);

    // Creates an object that inherits from the given prototype object.
    // If additional properties are provided then they will be added to the
    // created object.
    _.create = function(prototype, props) {
        var result = baseCreate(prototype);
        if (props) _.extendOwn(result, props);
        return result;
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
    var eq, deepEq;
    eq = function(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // `NaN`s are equivalent, but non-reflexive.
        if (a !== a) return b !== b;
        // Exhaust primitive checks
        var type = typeof a;
        if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
        return deepEq(a, b, aStack, bStack);
    };

    // Internal recursive comparison function for `isEqual`.
    deepEq = function(a, b, aStack, bStack) {
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
                // Object(NaN) is equivalent to NaN.
                if (+a !== +a) return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
            case '[object Symbol]':
                return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
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

    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
    _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
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
    // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
    var nodelist = root.document && root.document.childNodes;
    if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
        _.isFunction = function(obj) {
            return typeof obj == 'function' || false;
        };
    }

    // Is a given object a finite number?
    _.isFinite = function(obj) {
        return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
    };

    // Is the given value `NaN`?
    _.isNaN = function(obj) {
        return _.isNumber(obj) && isNaN(obj);
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

    _.property = property;

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
        // Regexes for identifying a key that needs to be escaped.
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
    _.result = function(object, prop, fallback) {
        var value = object == null ? void 0 : object[prop];
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
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

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
            source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
            index = offset + match.length;

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offset.
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + 'return __p;\n';

        var render;
        try {
            render = new Function(settings.variable || 'obj', '_', source);
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
    var chainResult = function(instance, obj) {
        return instance._chain ? _(obj).chain() : obj;
    };

    // Add your own custom functions to the Underscore object.
    _.mixin = function(obj) {
        _.each(_.functions(obj), function(name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function() {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return chainResult(this, func.apply(_, args));
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
            return chainResult(this, obj);
        };
    });

    // Add all accessor Array functions to the wrapper.
    _.each(['concat', 'join', 'slice'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            return chainResult(this, method.apply(this._wrapped, arguments));
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
    if (typeof define == 'function' && define.amd) {
        define('underscore', [], function() {
            return _;
        });
    }
}());

window.$ = _.noConflict();


/*
 * Underscore.string
 * (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>
 * Underscore.string is freely distributable under the terms of the MIT license.
 * Documentation: https://github.com/epeli/underscore.string
 * Some code is borrowed from MooTools and Alexandru Marasteanu.
 * Version '3.3.4'
 * @preserve
 */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.s = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    var trim = require('./trim');
    var decap = require('./decapitalize');

    module.exports = function camelize(str, decapitalize) {
        str = trim(str).replace(/[-_\s]+(.)?/g, function(match, c) {
            return c ? c.toUpperCase() : '';
        });

        if (decapitalize === true) {
            return decap(str);
        } else {
            return str;
        }
    };

},{"./decapitalize":10,"./trim":65}],2:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function capitalize(str, lowercaseRest) {
        str = makeString(str);
        var remainingChars = !lowercaseRest ? str.slice(1) : str.slice(1).toLowerCase();

        return str.charAt(0).toUpperCase() + remainingChars;
    };

},{"./helper/makeString":20}],3:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function chars(str) {
        return makeString(str).split('');
    };

},{"./helper/makeString":20}],4:[function(require,module,exports){
    module.exports = function chop(str, step) {
        if (str == null) return [];
        str = String(str);
        step = ~~step;
        return step > 0 ? str.match(new RegExp('.{1,' + step + '}', 'g')) : [str];
    };

},{}],5:[function(require,module,exports){
    var capitalize = require('./capitalize');
    var camelize = require('./camelize');
    var makeString = require('./helper/makeString');

    module.exports = function classify(str) {
        str = makeString(str);
        return capitalize(camelize(str.replace(/[\W_]/g, ' ')).replace(/\s/g, ''));
    };

},{"./camelize":1,"./capitalize":2,"./helper/makeString":20}],6:[function(require,module,exports){
    var trim = require('./trim');

    module.exports = function clean(str) {
        return trim(str).replace(/\s\s+/g, ' ');
    };

},{"./trim":65}],7:[function(require,module,exports){

    var makeString = require('./helper/makeString');

    var from  = 'ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșşšŝťțţŭùúüűûñÿýçżźž',
        to    = 'aaaaaaaaaccceeeeeghiiiijllnnoooooooossssstttuuuuuunyyczzz';

    from += from.toUpperCase();
    to += to.toUpperCase();

    to = to.split('');

// for tokens requireing multitoken output
    from += 'ß';
    to.push('ss');


    module.exports = function cleanDiacritics(str) {
        return makeString(str).replace(/.{1}/g, function(c){
            var index = from.indexOf(c);
            return index === -1 ? c : to[index];
        });
    };

},{"./helper/makeString":20}],8:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function(str, substr) {
        str = makeString(str);
        substr = makeString(substr);

        if (str.length === 0 || substr.length === 0) return 0;

        return str.split(substr).length - 1;
    };

},{"./helper/makeString":20}],9:[function(require,module,exports){
    var trim = require('./trim');

    module.exports = function dasherize(str) {
        return trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
    };

},{"./trim":65}],10:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function decapitalize(str) {
        str = makeString(str);
        return str.charAt(0).toLowerCase() + str.slice(1);
    };

},{"./helper/makeString":20}],11:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    function getIndent(str) {
        var matches = str.match(/^[\s\\t]*/gm);
        var indent = matches[0].length;

        for (var i = 1; i < matches.length; i++) {
            indent = Math.min(matches[i].length, indent);
        }

        return indent;
    }

    module.exports = function dedent(str, pattern) {
        str = makeString(str);
        var indent = getIndent(str);
        var reg;

        if (indent === 0) return str;

        if (typeof pattern === 'string') {
            reg = new RegExp('^' + pattern, 'gm');
        } else {
            reg = new RegExp('^[ \\t]{' + indent + '}', 'gm');
        }

        return str.replace(reg, '');
    };

},{"./helper/makeString":20}],12:[function(require,module,exports){
    var makeString = require('./helper/makeString');
    var toPositive = require('./helper/toPositive');

    module.exports = function endsWith(str, ends, position) {
        str = makeString(str);
        ends = '' + ends;
        if (typeof position == 'undefined') {
            position = str.length - ends.length;
        } else {
            position = Math.min(toPositive(position), str.length) - ends.length;
        }
        return position >= 0 && str.indexOf(ends, position) === position;
    };

},{"./helper/makeString":20,"./helper/toPositive":22}],13:[function(require,module,exports){
    var makeString = require('./helper/makeString');
    var escapeChars = require('./helper/escapeChars');

    var regexString = '[';
    for(var key in escapeChars) {
        regexString += key;
    }
    regexString += ']';

    var regex = new RegExp( regexString, 'g');

    module.exports = function escapeHTML(str) {

        return makeString(str).replace(regex, function(m) {
            return '&' + escapeChars[m] + ';';
        });
    };

},{"./helper/escapeChars":17,"./helper/makeString":20}],14:[function(require,module,exports){
    module.exports = function() {
        var result = {};

        for (var prop in this) {
            if (!this.hasOwnProperty(prop) || prop.match(/^(?:include|contains|reverse|join|map|wrap)$/)) continue;
            result[prop] = this[prop];
        }

        return result;
    };

},{}],15:[function(require,module,exports){
    var makeString = require('./makeString');

    module.exports = function adjacent(str, direction) {
        str = makeString(str);
        if (str.length === 0) {
            return '';
        }
        return str.slice(0, -1) + String.fromCharCode(str.charCodeAt(str.length - 1) + direction);
    };

},{"./makeString":20}],16:[function(require,module,exports){
    var escapeRegExp = require('./escapeRegExp');

    module.exports = function defaultToWhiteSpace(characters) {
        if (characters == null)
            return '\\s';
        else if (characters.source)
            return characters.source;
        else
            return '[' + escapeRegExp(characters) + ']';
    };

},{"./escapeRegExp":18}],17:[function(require,module,exports){
    /* We're explicitly defining the list of entities we want to escape.
     nbsp is an HTML entity, but we don't want to escape all space characters in a string, hence its omission in this map.

     */
    var escapeChars = {
        '¢' : 'cent',
        '£' : 'pound',
        '¥' : 'yen',
        '€': 'euro',
        '©' :'copy',
        '®' : 'reg',
        '<' : 'lt',
        '>' : 'gt',
        '"' : 'quot',
        '&' : 'amp',
        '\'' : '#39'
    };

    module.exports = escapeChars;

},{}],18:[function(require,module,exports){
    var makeString = require('./makeString');

    module.exports = function escapeRegExp(str) {
        return makeString(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
    };

},{"./makeString":20}],19:[function(require,module,exports){
    /*
     We're explicitly defining the list of entities that might see in escape HTML strings
     */
    var htmlEntities = {
        nbsp: ' ',
        cent: '¢',
        pound: '£',
        yen: '¥',
        euro: '€',
        copy: '©',
        reg: '®',
        lt: '<',
        gt: '>',
        quot: '"',
        amp: '&',
        apos: '\''
    };

    module.exports = htmlEntities;

},{}],20:[function(require,module,exports){
    /**
     * Ensure some object is a coerced to a string
     **/
    module.exports = function makeString(object) {
        if (object == null) return '';
        return '' + object;
    };

},{}],21:[function(require,module,exports){
    module.exports = function strRepeat(str, qty){
        if (qty < 1) return '';
        var result = '';
        while (qty > 0) {
            if (qty & 1) result += str;
            qty >>= 1, str += str;
        }
        return result;
    };

},{}],22:[function(require,module,exports){
    module.exports = function toPositive(number) {
        return number < 0 ? 0 : (+number || 0);
    };

},{}],23:[function(require,module,exports){
    var capitalize = require('./capitalize');
    var underscored = require('./underscored');
    var trim = require('./trim');

    module.exports = function humanize(str) {
        return capitalize(trim(underscored(str).replace(/_id$/, '').replace(/_/g, ' ')));
    };

},{"./capitalize":2,"./trim":65,"./underscored":67}],24:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function include(str, needle) {
        if (needle === '') return true;
        return makeString(str).indexOf(needle) !== -1;
    };

},{"./helper/makeString":20}],25:[function(require,module,exports){
    /*
     * Underscore.string
     * (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>
     * Underscore.string is freely distributable under the terms of the MIT license.
     * Documentation: https://github.com/epeli/underscore.string
     * Some code is borrowed from MooTools and Alexandru Marasteanu.
     * Version '3.3.4'
     * @preserve
     */

    'use strict';

    function s(value) {
        /* jshint validthis: true */
        if (!(this instanceof s)) return new s(value);
        this._wrapped = value;
    }

    s.VERSION = '3.3.4';

    s.isBlank          = require('./isBlank');
    s.stripTags        = require('./stripTags');
    s.capitalize       = require('./capitalize');
    s.decapitalize     = require('./decapitalize');
    s.chop             = require('./chop');
    s.trim             = require('./trim');
    s.clean            = require('./clean');
    s.cleanDiacritics  = require('./cleanDiacritics');
    s.count            = require('./count');
    s.chars            = require('./chars');
    s.swapCase         = require('./swapCase');
    s.escapeHTML       = require('./escapeHTML');
    s.unescapeHTML     = require('./unescapeHTML');
    s.splice           = require('./splice');
    s.insert           = require('./insert');
    s.replaceAll       = require('./replaceAll');
    s.include          = require('./include');
    s.join             = require('./join');
    s.lines            = require('./lines');
    s.dedent           = require('./dedent');
    s.reverse          = require('./reverse');
    s.startsWith       = require('./startsWith');
    s.endsWith         = require('./endsWith');
    s.pred             = require('./pred');
    s.succ             = require('./succ');
    s.titleize         = require('./titleize');
    s.camelize         = require('./camelize');
    s.underscored      = require('./underscored');
    s.dasherize        = require('./dasherize');
    s.classify         = require('./classify');
    s.humanize         = require('./humanize');
    s.ltrim            = require('./ltrim');
    s.rtrim            = require('./rtrim');
    s.truncate         = require('./truncate');
    s.prune            = require('./prune');
    s.words            = require('./words');
    s.pad              = require('./pad');
    s.lpad             = require('./lpad');
    s.rpad             = require('./rpad');
    s.lrpad            = require('./lrpad');
    s.sprintf          = require('./sprintf');
    s.vsprintf         = require('./vsprintf');
    s.toNumber         = require('./toNumber');
    s.numberFormat     = require('./numberFormat');
    s.strRight         = require('./strRight');
    s.strRightBack     = require('./strRightBack');
    s.strLeft          = require('./strLeft');
    s.strLeftBack      = require('./strLeftBack');
    s.toSentence       = require('./toSentence');
    s.toSentenceSerial = require('./toSentenceSerial');
    s.slugify          = require('./slugify');
    s.surround         = require('./surround');
    s.quote            = require('./quote');
    s.unquote          = require('./unquote');
    s.repeat           = require('./repeat');
    s.naturalCmp       = require('./naturalCmp');
    s.levenshtein      = require('./levenshtein');
    s.toBoolean        = require('./toBoolean');
    s.exports          = require('./exports');
    s.escapeRegExp     = require('./helper/escapeRegExp');
    s.wrap             = require('./wrap');
    s.map              = require('./map');

// Aliases
    s.strip     = s.trim;
    s.lstrip    = s.ltrim;
    s.rstrip    = s.rtrim;
    s.center    = s.lrpad;
    s.rjust     = s.lpad;
    s.ljust     = s.rpad;
    s.contains  = s.include;
    s.q         = s.quote;
    s.toBool    = s.toBoolean;
    s.camelcase = s.camelize;
    s.mapChars  = s.map;


// Implement chaining
    s.prototype = {
        value: function value() {
            return this._wrapped;
        }
    };

    function fn2method(key, fn) {
        if (typeof fn !== 'function') return;
        s.prototype[key] = function() {
            var args = [this._wrapped].concat(Array.prototype.slice.call(arguments));
            var res = fn.apply(null, args);
            // if the result is non-string stop the chain and return the value
            return typeof res === 'string' ? new s(res) : res;
        };
    }

// Copy functions to instance methods for chaining
    for (var key in s) fn2method(key, s[key]);

    fn2method('tap', function tap(string, fn) {
        return fn(string);
    });

    function prototype2method(methodName) {
        fn2method(methodName, function(context) {
            var args = Array.prototype.slice.call(arguments, 1);
            return String.prototype[methodName].apply(context, args);
        });
    }

    var prototypeMethods = [
        'toUpperCase',
        'toLowerCase',
        'split',
        'replace',
        'slice',
        'substring',
        'substr',
        'concat'
    ];

    for (var method in prototypeMethods) prototype2method(prototypeMethods[method]);


    module.exports = s;

},{"./camelize":1,"./capitalize":2,"./chars":3,"./chop":4,"./classify":5,"./clean":6,"./cleanDiacritics":7,"./count":8,"./dasherize":9,"./decapitalize":10,"./dedent":11,"./endsWith":12,"./escapeHTML":13,"./exports":14,"./helper/escapeRegExp":18,"./humanize":23,"./include":24,"./insert":26,"./isBlank":27,"./join":28,"./levenshtein":29,"./lines":30,"./lpad":31,"./lrpad":32,"./ltrim":33,"./map":34,"./naturalCmp":35,"./numberFormat":38,"./pad":39,"./pred":40,"./prune":41,"./quote":42,"./repeat":43,"./replaceAll":44,"./reverse":45,"./rpad":46,"./rtrim":47,"./slugify":48,"./splice":49,"./sprintf":50,"./startsWith":51,"./strLeft":52,"./strLeftBack":53,"./strRight":54,"./strRightBack":55,"./stripTags":56,"./succ":57,"./surround":58,"./swapCase":59,"./titleize":60,"./toBoolean":61,"./toNumber":62,"./toSentence":63,"./toSentenceSerial":64,"./trim":65,"./truncate":66,"./underscored":67,"./unescapeHTML":68,"./unquote":69,"./vsprintf":70,"./words":71,"./wrap":72}],26:[function(require,module,exports){
    var splice = require('./splice');

    module.exports = function insert(str, i, substr) {
        return splice(str, i, 0, substr);
    };

},{"./splice":49}],27:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function isBlank(str) {
        return (/^\s*$/).test(makeString(str));
    };

},{"./helper/makeString":20}],28:[function(require,module,exports){
    var makeString = require('./helper/makeString');
    var slice = [].slice;

    module.exports = function join() {
        var args = slice.call(arguments),
            separator = args.shift();

        return args.join(makeString(separator));
    };

},{"./helper/makeString":20}],29:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    /**
     * Based on the implementation here: https://github.com/hiddentao/fast-levenshtein
     */
    module.exports = function levenshtein(str1, str2) {
        'use strict';
        str1 = makeString(str1);
        str2 = makeString(str2);

        // Short cut cases
        if (str1 === str2) return 0;
        if (!str1 || !str2) return Math.max(str1.length, str2.length);

        // two rows
        var prevRow = new Array(str2.length + 1);

        // initialise previous row
        for (var i = 0; i < prevRow.length; ++i) {
            prevRow[i] = i;
        }

        // calculate current row distance from previous row
        for (i = 0; i < str1.length; ++i) {
            var nextCol = i + 1;

            for (var j = 0; j < str2.length; ++j) {
                var curCol = nextCol;

                // substution
                nextCol = prevRow[j] + ( (str1.charAt(i) === str2.charAt(j)) ? 0 : 1 );
                // insertion
                var tmp = curCol + 1;
                if (nextCol > tmp) {
                    nextCol = tmp;
                }
                // deletion
                tmp = prevRow[j + 1] + 1;
                if (nextCol > tmp) {
                    nextCol = tmp;
                }

                // copy current col value into previous (in preparation for next iteration)
                prevRow[j] = curCol;
            }

            // copy last col value into previous (in preparation for next iteration)
            prevRow[j] = nextCol;
        }

        return nextCol;
    };

},{"./helper/makeString":20}],30:[function(require,module,exports){
    module.exports = function lines(str) {
        if (str == null) return [];
        return String(str).split(/\r\n?|\n/);
    };

},{}],31:[function(require,module,exports){
    var pad = require('./pad');

    module.exports = function lpad(str, length, padStr) {
        return pad(str, length, padStr);
    };

},{"./pad":39}],32:[function(require,module,exports){
    var pad = require('./pad');

    module.exports = function lrpad(str, length, padStr) {
        return pad(str, length, padStr, 'both');
    };

},{"./pad":39}],33:[function(require,module,exports){
    var makeString = require('./helper/makeString');
    var defaultToWhiteSpace = require('./helper/defaultToWhiteSpace');
    var nativeTrimLeft = String.prototype.trimLeft;

    module.exports = function ltrim(str, characters) {
        str = makeString(str);
        if (!characters && nativeTrimLeft) return nativeTrimLeft.call(str);
        characters = defaultToWhiteSpace(characters);
        return str.replace(new RegExp('^' + characters + '+'), '');
    };

},{"./helper/defaultToWhiteSpace":16,"./helper/makeString":20}],34:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function(str, callback) {
        str = makeString(str);

        if (str.length === 0 || typeof callback !== 'function') return str;

        return str.replace(/./g, callback);
    };

},{"./helper/makeString":20}],35:[function(require,module,exports){
    module.exports = function naturalCmp(str1, str2) {
        if (str1 == str2) return 0;
        if (!str1) return -1;
        if (!str2) return 1;

        var cmpRegex = /(\.\d+|\d+|\D+)/g,
            tokens1 = String(str1).match(cmpRegex),
            tokens2 = String(str2).match(cmpRegex),
            count = Math.min(tokens1.length, tokens2.length);

        for (var i = 0; i < count; i++) {
            var a = tokens1[i],
                b = tokens2[i];

            if (a !== b) {
                var num1 = +a;
                var num2 = +b;
                if (num1 === num1 && num2 === num2) {
                    return num1 > num2 ? 1 : -1;
                }
                return a < b ? -1 : 1;
            }
        }

        if (tokens1.length != tokens2.length)
            return tokens1.length - tokens2.length;

        return str1 < str2 ? -1 : 1;
    };

},{}],36:[function(require,module,exports){
    (function(window) {
        var re = {
            not_string: /[^s]/,
            number: /[diefg]/,
            json: /[j]/,
            not_json: /[^j]/,
            text: /^[^\x25]+/,
            modulo: /^\x25{2}/,
            placeholder: /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-gijosuxX])/,
            key: /^([a-z_][a-z_\d]*)/i,
            key_access: /^\.([a-z_][a-z_\d]*)/i,
            index_access: /^\[(\d+)\]/,
            sign: /^[\+\-]/
        }

        function sprintf() {
            var key = arguments[0], cache = sprintf.cache
            if (!(cache[key] && cache.hasOwnProperty(key))) {
                cache[key] = sprintf.parse(key)
            }
            return sprintf.format.call(null, cache[key], arguments)
        }

        sprintf.format = function(parse_tree, argv) {
            var cursor = 1, tree_length = parse_tree.length, node_type = "", arg, output = [], i, k, match, pad, pad_character, pad_length, is_positive = true, sign = ""
            for (i = 0; i < tree_length; i++) {
                node_type = get_type(parse_tree[i])
                if (node_type === "string") {
                    output[output.length] = parse_tree[i]
                }
                else if (node_type === "array") {
                    match = parse_tree[i] // convenience purposes only
                    if (match[2]) { // keyword argument
                        arg = argv[cursor]
                        for (k = 0; k < match[2].length; k++) {
                            if (!arg.hasOwnProperty(match[2][k])) {
                                throw new Error(sprintf("[sprintf] property '%s' does not exist", match[2][k]))
                            }
                            arg = arg[match[2][k]]
                        }
                    }
                    else if (match[1]) { // positional argument (explicit)
                        arg = argv[match[1]]
                    }
                    else { // positional argument (implicit)
                        arg = argv[cursor++]
                    }

                    if (get_type(arg) == "function") {
                        arg = arg()
                    }

                    if (re.not_string.test(match[8]) && re.not_json.test(match[8]) && (get_type(arg) != "number" && isNaN(arg))) {
                        throw new TypeError(sprintf("[sprintf] expecting number but found %s", get_type(arg)))
                    }

                    if (re.number.test(match[8])) {
                        is_positive = arg >= 0
                    }

                    switch (match[8]) {
                        case "b":
                            arg = arg.toString(2)
                            break
                        case "c":
                            arg = String.fromCharCode(arg)
                            break
                        case "d":
                        case "i":
                            arg = parseInt(arg, 10)
                            break
                        case "j":
                            arg = JSON.stringify(arg, null, match[6] ? parseInt(match[6]) : 0)
                            break
                        case "e":
                            arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential()
                            break
                        case "f":
                            arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg)
                            break
                        case "g":
                            arg = match[7] ? parseFloat(arg).toPrecision(match[7]) : parseFloat(arg)
                            break
                        case "o":
                            arg = arg.toString(8)
                            break
                        case "s":
                            arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg)
                            break
                        case "u":
                            arg = arg >>> 0
                            break
                        case "x":
                            arg = arg.toString(16)
                            break
                        case "X":
                            arg = arg.toString(16).toUpperCase()
                            break
                    }
                    if (re.json.test(match[8])) {
                        output[output.length] = arg
                    }
                    else {
                        if (re.number.test(match[8]) && (!is_positive || match[3])) {
                            sign = is_positive ? "+" : "-"
                            arg = arg.toString().replace(re.sign, "")
                        }
                        else {
                            sign = ""
                        }
                        pad_character = match[4] ? match[4] === "0" ? "0" : match[4].charAt(1) : " "
                        pad_length = match[6] - (sign + arg).length
                        pad = match[6] ? (pad_length > 0 ? str_repeat(pad_character, pad_length) : "") : ""
                        output[output.length] = match[5] ? sign + arg + pad : (pad_character === "0" ? sign + pad + arg : pad + sign + arg)
                    }
                }
            }
            return output.join("")
        }

        sprintf.cache = {}

        sprintf.parse = function(fmt) {
            var _fmt = fmt, match = [], parse_tree = [], arg_names = 0
            while (_fmt) {
                if ((match = re.text.exec(_fmt)) !== null) {
                    parse_tree[parse_tree.length] = match[0]
                }
                else if ((match = re.modulo.exec(_fmt)) !== null) {
                    parse_tree[parse_tree.length] = "%"
                }
                else if ((match = re.placeholder.exec(_fmt)) !== null) {
                    if (match[2]) {
                        arg_names |= 1
                        var field_list = [], replacement_field = match[2], field_match = []
                        if ((field_match = re.key.exec(replacement_field)) !== null) {
                            field_list[field_list.length] = field_match[1]
                            while ((replacement_field = replacement_field.substring(field_match[0].length)) !== "") {
                                if ((field_match = re.key_access.exec(replacement_field)) !== null) {
                                    field_list[field_list.length] = field_match[1]
                                }
                                else if ((field_match = re.index_access.exec(replacement_field)) !== null) {
                                    field_list[field_list.length] = field_match[1]
                                }
                                else {
                                    throw new SyntaxError("[sprintf] failed to parse named argument key")
                                }
                            }
                        }
                        else {
                            throw new SyntaxError("[sprintf] failed to parse named argument key")
                        }
                        match[2] = field_list
                    }
                    else {
                        arg_names |= 2
                    }
                    if (arg_names === 3) {
                        throw new Error("[sprintf] mixing positional and named placeholders is not (yet) supported")
                    }
                    parse_tree[parse_tree.length] = match
                }
                else {
                    throw new SyntaxError("[sprintf] unexpected placeholder")
                }
                _fmt = _fmt.substring(match[0].length)
            }
            return parse_tree
        }

        var vsprintf = function(fmt, argv, _argv) {
            _argv = (argv || []).slice(0)
            _argv.splice(0, 0, fmt)
            return sprintf.apply(null, _argv)
        }

        /**
         * helpers
         */
        function get_type(variable) {
            return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase()
        }

        function str_repeat(input, multiplier) {
            return Array(multiplier + 1).join(input)
        }

        /**
         * export to either browser or node.js
         */
        if (typeof exports !== "undefined") {
            exports.sprintf = sprintf
            exports.vsprintf = vsprintf
        }
        else {
            window.sprintf = sprintf
            window.vsprintf = vsprintf

            if (typeof define === "function" && define.amd) {
                define(function() {
                    return {
                        sprintf: sprintf,
                        vsprintf: vsprintf
                    }
                })
            }
        }
    })(typeof window === "undefined" ? this : window);

},{}],37:[function(require,module,exports){
    (function (global){

        /**
         * Module exports.
         */

        module.exports = deprecate;

        /**
         * Mark that a method should not be used.
         * Returns a modified function which warns once by default.
         *
         * If `localStorage.noDeprecation = true` is set, then it is a no-op.
         *
         * If `localStorage.throwDeprecation = true` is set, then deprecated functions
         * will throw an Error when invoked.
         *
         * If `localStorage.traceDeprecation = true` is set, then deprecated functions
         * will invoke `console.trace()` instead of `console.error()`.
         *
         * @param {Function} fn - the function to deprecate
         * @param {String} msg - the string to print to the console when `fn` is invoked
         * @returns {Function} a new "deprecated" version of `fn`
         * @api public
         */

        function deprecate (fn, msg) {
            if (config('noDeprecation')) {
                return fn;
            }

            var warned = false;
            function deprecated() {
                if (!warned) {
                    if (config('throwDeprecation')) {
                        throw new Error(msg);
                    } else if (config('traceDeprecation')) {
                        console.trace(msg);
                    } else {
                        console.warn(msg);
                    }
                    warned = true;
                }
                return fn.apply(this, arguments);
            }

            return deprecated;
        }

        /**
         * Checks `localStorage` for boolean values for the given `name`.
         *
         * @param {String} name
         * @returns {Boolean}
         * @api private
         */

        function config (name) {
            // accessing global.localStorage can trigger a DOMException in sandboxed iframes
            try {
                if (!global.localStorage) return false;
            } catch (_) {
                return false;
            }
            var val = global.localStorage[name];
            if (null == val) return false;
            return String(val).toLowerCase() === 'true';
        }

    }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],38:[function(require,module,exports){
    module.exports = function numberFormat(number, dec, dsep, tsep) {
        if (isNaN(number) || number == null) return '';

        number = number.toFixed(~~dec);
        tsep = typeof tsep == 'string' ? tsep : ',';

        var parts = number.split('.'),
            fnums = parts[0],
            decimals = parts[1] ? (dsep || '.') + parts[1] : '';

        return fnums.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + tsep) + decimals;
    };

},{}],39:[function(require,module,exports){
    var makeString = require('./helper/makeString');
    var strRepeat = require('./helper/strRepeat');

    module.exports = function pad(str, length, padStr, type) {
        str = makeString(str);
        length = ~~length;

        var padlen = 0;

        if (!padStr)
            padStr = ' ';
        else if (padStr.length > 1)
            padStr = padStr.charAt(0);

        switch (type) {
            case 'right':
                padlen = length - str.length;
                return str + strRepeat(padStr, padlen);
            case 'both':
                padlen = length - str.length;
                return strRepeat(padStr, Math.ceil(padlen / 2)) + str + strRepeat(padStr, Math.floor(padlen / 2));
            default: // 'left'
                padlen = length - str.length;
                return strRepeat(padStr, padlen) + str;
        }
    };

},{"./helper/makeString":20,"./helper/strRepeat":21}],40:[function(require,module,exports){
    var adjacent = require('./helper/adjacent');

    module.exports = function succ(str) {
        return adjacent(str, -1);
    };

},{"./helper/adjacent":15}],41:[function(require,module,exports){
    /**
     * _s.prune: a more elegant version of truncate
     * prune extra chars, never leaving a half-chopped word.
     * @author github.com/rwz
     */
    var makeString = require('./helper/makeString');
    var rtrim = require('./rtrim');

    module.exports = function prune(str, length, pruneStr) {
        str = makeString(str);
        length = ~~length;
        pruneStr = pruneStr != null ? String(pruneStr) : '...';

        if (str.length <= length) return str;

        var tmpl = function(c) {
                return c.toUpperCase() !== c.toLowerCase() ? 'A' : ' ';
            },
            template = str.slice(0, length + 1).replace(/.(?=\W*\w*$)/g, tmpl); // 'Hello, world' -> 'HellAA AAAAA'

        if (template.slice(template.length - 2).match(/\w\w/))
            template = template.replace(/\s*\S+$/, '');
        else
            template = rtrim(template.slice(0, template.length - 1));

        return (template + pruneStr).length > str.length ? str : str.slice(0, template.length) + pruneStr;
    };

},{"./helper/makeString":20,"./rtrim":47}],42:[function(require,module,exports){
    var surround = require('./surround');

    module.exports = function quote(str, quoteChar) {
        return surround(str, quoteChar || '"');
    };

},{"./surround":58}],43:[function(require,module,exports){
    var makeString = require('./helper/makeString');
    var strRepeat = require('./helper/strRepeat');

    module.exports = function repeat(str, qty, separator) {
        str = makeString(str);

        qty = ~~qty;

        // using faster implementation if separator is not needed;
        if (separator == null) return strRepeat(str, qty);

        // this one is about 300x slower in Google Chrome
        /*eslint no-empty: 0*/
        for (var repeat = []; qty > 0; repeat[--qty] = str) {}
        return repeat.join(separator);
    };

},{"./helper/makeString":20,"./helper/strRepeat":21}],44:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function replaceAll(str, find, replace, ignorecase) {
        var flags = (ignorecase === true)?'gi':'g';
        var reg = new RegExp(find, flags);

        return makeString(str).replace(reg, replace);
    };

},{"./helper/makeString":20}],45:[function(require,module,exports){
    var chars = require('./chars');

    module.exports = function reverse(str) {
        return chars(str).reverse().join('');
    };

},{"./chars":3}],46:[function(require,module,exports){
    var pad = require('./pad');

    module.exports = function rpad(str, length, padStr) {
        return pad(str, length, padStr, 'right');
    };

},{"./pad":39}],47:[function(require,module,exports){
    var makeString = require('./helper/makeString');
    var defaultToWhiteSpace = require('./helper/defaultToWhiteSpace');
    var nativeTrimRight = String.prototype.trimRight;

    module.exports = function rtrim(str, characters) {
        str = makeString(str);
        if (!characters && nativeTrimRight) return nativeTrimRight.call(str);
        characters = defaultToWhiteSpace(characters);
        return str.replace(new RegExp(characters + '+$'), '');
    };

},{"./helper/defaultToWhiteSpace":16,"./helper/makeString":20}],48:[function(require,module,exports){
    var trim = require('./trim');
    var dasherize = require('./dasherize');
    var cleanDiacritics = require('./cleanDiacritics');

    module.exports = function slugify(str) {
        return trim(dasherize(cleanDiacritics(str).replace(/[^\w\s-]/g, '-').toLowerCase()), '-');
    };

},{"./cleanDiacritics":7,"./dasherize":9,"./trim":65}],49:[function(require,module,exports){
    var chars = require('./chars');

    module.exports = function splice(str, i, howmany, substr) {
        var arr = chars(str);
        arr.splice(~~i, ~~howmany, substr);
        return arr.join('');
    };

},{"./chars":3}],50:[function(require,module,exports){
    var deprecate = require('util-deprecate');

    module.exports = deprecate(require('sprintf-js').sprintf,
        'sprintf() will be removed in the next major release, use the sprintf-js package instead.');

},{"sprintf-js":36,"util-deprecate":37}],51:[function(require,module,exports){
    var makeString = require('./helper/makeString');
    var toPositive = require('./helper/toPositive');

    module.exports = function startsWith(str, starts, position) {
        str = makeString(str);
        starts = '' + starts;
        position = position == null ? 0 : Math.min(toPositive(position), str.length);
        return str.lastIndexOf(starts, position) === position;
    };

},{"./helper/makeString":20,"./helper/toPositive":22}],52:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function strLeft(str, sep) {
        str = makeString(str);
        sep = makeString(sep);
        var pos = !sep ? -1 : str.indexOf(sep);
        return~ pos ? str.slice(0, pos) : str;
    };

},{"./helper/makeString":20}],53:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function strLeftBack(str, sep) {
        str = makeString(str);
        sep = makeString(sep);
        var pos = str.lastIndexOf(sep);
        return~ pos ? str.slice(0, pos) : str;
    };

},{"./helper/makeString":20}],54:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function strRight(str, sep) {
        str = makeString(str);
        sep = makeString(sep);
        var pos = !sep ? -1 : str.indexOf(sep);
        return~ pos ? str.slice(pos + sep.length, str.length) : str;
    };

},{"./helper/makeString":20}],55:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function strRightBack(str, sep) {
        str = makeString(str);
        sep = makeString(sep);
        var pos = !sep ? -1 : str.lastIndexOf(sep);
        return~ pos ? str.slice(pos + sep.length, str.length) : str;
    };

},{"./helper/makeString":20}],56:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function stripTags(str) {
        return makeString(str).replace(/<\/?[^>]+>/g, '');
    };

},{"./helper/makeString":20}],57:[function(require,module,exports){
    var adjacent = require('./helper/adjacent');

    module.exports = function succ(str) {
        return adjacent(str, 1);
    };

},{"./helper/adjacent":15}],58:[function(require,module,exports){
    module.exports = function surround(str, wrapper) {
        return [wrapper, str, wrapper].join('');
    };

},{}],59:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function swapCase(str) {
        return makeString(str).replace(/\S/g, function(c) {
            return c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase();
        });
    };

},{"./helper/makeString":20}],60:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function titleize(str) {
        return makeString(str).toLowerCase().replace(/(?:^|\s|-)\S/g, function(c) {
            return c.toUpperCase();
        });
    };

},{"./helper/makeString":20}],61:[function(require,module,exports){
    var trim = require('./trim');

    function boolMatch(s, matchers) {
        var i, matcher, down = s.toLowerCase();
        matchers = [].concat(matchers);
        for (i = 0; i < matchers.length; i += 1) {
            matcher = matchers[i];
            if (!matcher) continue;
            if (matcher.test && matcher.test(s)) return true;
            if (matcher.toLowerCase() === down) return true;
        }
    }

    module.exports = function toBoolean(str, trueValues, falseValues) {
        if (typeof str === 'number') str = '' + str;
        if (typeof str !== 'string') return !!str;
        str = trim(str);
        if (boolMatch(str, trueValues || ['true', '1'])) return true;
        if (boolMatch(str, falseValues || ['false', '0'])) return false;
    };

},{"./trim":65}],62:[function(require,module,exports){
    module.exports = function toNumber(num, precision) {
        if (num == null) return 0;
        var factor = Math.pow(10, isFinite(precision) ? precision : 0);
        return Math.round(num * factor) / factor;
    };

},{}],63:[function(require,module,exports){
    var rtrim = require('./rtrim');

    module.exports = function toSentence(array, separator, lastSeparator, serial) {
        separator = separator || ', ';
        lastSeparator = lastSeparator || ' and ';
        var a = array.slice(),
            lastMember = a.pop();

        if (array.length > 2 && serial) lastSeparator = rtrim(separator) + lastSeparator;

        return a.length ? a.join(separator) + lastSeparator + lastMember : lastMember;
    };

},{"./rtrim":47}],64:[function(require,module,exports){
    var toSentence = require('./toSentence');

    module.exports = function toSentenceSerial(array, sep, lastSep) {
        return toSentence(array, sep, lastSep, true);
    };

},{"./toSentence":63}],65:[function(require,module,exports){
    var makeString = require('./helper/makeString');
    var defaultToWhiteSpace = require('./helper/defaultToWhiteSpace');
    var nativeTrim = String.prototype.trim;

    module.exports = function trim(str, characters) {
        str = makeString(str);
        if (!characters && nativeTrim) return nativeTrim.call(str);
        characters = defaultToWhiteSpace(characters);
        return str.replace(new RegExp('^' + characters + '+|' + characters + '+$', 'g'), '');
    };

},{"./helper/defaultToWhiteSpace":16,"./helper/makeString":20}],66:[function(require,module,exports){
    var makeString = require('./helper/makeString');

    module.exports = function truncate(str, length, truncateStr) {
        str = makeString(str);
        truncateStr = truncateStr || '...';
        length = ~~length;
        return str.length > length ? str.slice(0, length) + truncateStr : str;
    };

},{"./helper/makeString":20}],67:[function(require,module,exports){
    var trim = require('./trim');

    module.exports = function underscored(str) {
        return trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
    };

},{"./trim":65}],68:[function(require,module,exports){
    var makeString = require('./helper/makeString');
    var htmlEntities = require('./helper/htmlEntities');

    module.exports = function unescapeHTML(str) {
        return makeString(str).replace(/\&([^;]+);/g, function(entity, entityCode) {
            var match;

            if (entityCode in htmlEntities) {
                return htmlEntities[entityCode];
                /*eslint no-cond-assign: 0*/
            } else if (match = entityCode.match(/^#x([\da-fA-F]+)$/)) {
                return String.fromCharCode(parseInt(match[1], 16));
                /*eslint no-cond-assign: 0*/
            } else if (match = entityCode.match(/^#(\d+)$/)) {
                return String.fromCharCode(~~match[1]);
            } else {
                return entity;
            }
        });
    };

},{"./helper/htmlEntities":19,"./helper/makeString":20}],69:[function(require,module,exports){
    module.exports = function unquote(str, quoteChar) {
        quoteChar = quoteChar || '"';
        if (str[0] === quoteChar && str[str.length - 1] === quoteChar)
            return str.slice(1, str.length - 1);
        else return str;
    };

},{}],70:[function(require,module,exports){
    var deprecate = require('util-deprecate');

    module.exports = deprecate(require('sprintf-js').vsprintf,
        'vsprintf() will be removed in the next major release, use the sprintf-js package instead.');

},{"sprintf-js":36,"util-deprecate":37}],71:[function(require,module,exports){
    var isBlank = require('./isBlank');
    var trim = require('./trim');

    module.exports = function words(str, delimiter) {
        if (isBlank(str)) return [];
        return trim(str, delimiter).split(delimiter || /\s+/);
    };

},{"./isBlank":27,"./trim":65}],72:[function(require,module,exports){
// Wrap
// wraps a string by a certain width

    var makeString = require('./helper/makeString');

    module.exports = function wrap(str, options){
        str = makeString(str);

        options = options || {};

        var width = options.width || 75;
        var seperator = options.seperator || '\n';
        var cut = options.cut || false;
        var preserveSpaces = options.preserveSpaces || false;
        var trailingSpaces = options.trailingSpaces || false;

        var result;

        if(width <= 0){
            return str;
        }

        else if(!cut){

            var words = str.split(' ');
            var current_column = 0;
            result = '';

            while(words.length > 0){

                // if adding a space and the next word would cause this line to be longer than width...
                if(1 + words[0].length + current_column > width){
                    //start a new line if this line is not already empty
                    if(current_column > 0){
                        // add a space at the end of the line is preserveSpaces is true
                        if (preserveSpaces){
                            result += ' ';
                            current_column++;
                        }
                        // fill the rest of the line with spaces if trailingSpaces option is true
                        else if(trailingSpaces){
                            while(current_column < width){
                                result += ' ';
                                current_column++;
                            }
                        }
                        //start new line
                        result += seperator;
                        current_column = 0;
                    }
                }

                // if not at the begining of the line, add a space in front of the word
                if(current_column > 0){
                    result += ' ';
                    current_column++;
                }

                // tack on the next word, update current column, a pop words array
                result += words[0];
                current_column += words[0].length;
                words.shift();

            }

            // fill the rest of the line with spaces if trailingSpaces option is true
            if(trailingSpaces){
                while(current_column < width){
                    result += ' ';
                    current_column++;
                }
            }

            return result;

        }

        else {

            var index = 0;
            result = '';

            // walk through each character and add seperators where appropriate
            while(index < str.length){
                if(index % width == 0 && index > 0){
                    result += seperator;
                }
                result += str.charAt(index);
                index++;
            }

            // fill the rest of the line with spaces if trailingSpaces option is true
            if(trailingSpaces){
                while(index % width > 0){
                    result += ' ';
                    index++;
                }
            }

            return result;
        }
    };

},{"./helper/makeString":20}]},{},[25])(25)
});

$.mixin(s.exports());
(function(){
    var myMixin = {};

    myMixin.getLength = function(obj) {
        if (!$.isUndefined(obj.length)) {
            return obj.length;
        }

        var i = 0;
        for (var sIndex in obj) {
            if (obj.hasOwnProperty(sIndex)) {
                i++;
            }
        }
        return i;
    };

    // For Firefox
    function t() {
    };
    if (false && !$.isUndefined(t.name)) {
        myMixin.getFunctionName = function (fnFunction) {
            return fnFunction.name;
        };
    } else {
        myMixin.getFunctionName = function (fnFunction) {
            var sFunctionContent = fnFunction.toString();

            var oRegex = new RegExp("function[ ]*([^\\( ]*)[ ]*\\(", "ig");
            var aRes = oRegex.exec(sFunctionContent);

            if (!$.isUndefined(aRes[1])) {
                return aRes[1];
            }

            return null;
        };
    }

    myMixin.isWindow = function (oObject) {return false;
        return oObject != null && oObject == oObject.window;
    };

    $.mixin(myMixin);
})($);

/********************************************************************************/
/**                                                                            **/
/**                          Framework ajax functions                          **/
/**                                                                            **/
/********************************************************************************/
$.ajax = function(url, options, callbackContext) {
    var xhr = getXmlHttpRequest(),
        successCallback = options.success || null,
        errorCallback = options.error || null,
        readyStateChangeCallback = options.readyStateChange || null,
        callbackContext = callbackContext || null,
        method = options.method || "get",
        async = options.async || true;

    xhr.open(method, url, async);

    completeHeader();
    bindOnReadyStateChange();


    xhr.send();

    function getXmlHttpRequest() {
        if (window.XMLHttpRequest)
        {
            return new XMLHttpRequest();
        }
        else if (window.ActiveXObject)
        {// code for IE6, IE5
            return new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            throw new Error('Your browser does not support XmlHttpRequest object');
        }
    }

    function completeHeader() {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        if (!$.isUndefined(options.header)) {
            $.each(options.header, function(value, key){
                xhr.setRequestHeader(key, value);
            });
        }
    }

    function bindOnReadyStateChange() {
        xhr.onreadystatechange = function(){
            if (xhr.readyState==4 && xhr.status==200)
            {
                callCallback(successCallback, [parseResponse(), xhr]);
            } else if (xhr.readyState==4) {
                callCallback(errorCallback, [xhr]);
            } else {
                callCallback(readyStateChangeCallback, [xhr]);
            }
        };
    }

    function parseResponse() {
        var type = options.responseType || "text";
        switch(type) {
            case "json" :
                return JSON.parse(xhr.responseText);
            case "text" :
            default :
                return xhr.responseText;
        }
    }

    function callCallback(callback, params) {
        if (!$.isEmpty(callback)) {
            if (!$.isEmpty(callbackContext)) {
                callback.apply(callbackContext, params);
            } else {
                callback(xhr);
            }
        }
    }
};


/********************************************************************************/
/**                                                                            **/
/**                               Dom functions                                **/
/**                                                                            **/
/********************************************************************************/

var _aMatchAttributes = {
    "for" : "htmlFor",
    "class" : "className",
    "readonly" : "readOnly",
    "maxlength" : "maxLength",
    "cellspacing" : "cellSpacing",
    "rowspan" : "rowSpan",
    "colspan" : "colSpan",
    "tabindex" : "tabIndex"
};

/**
 * Get the value of an attribute
 * @param domElement
 * @param sName
 */
$.getAttribute = function(domElement, sName) {
    var sProperty = _aMatchAttributes[sName] || sName;

    return domElement[sProperty] && sName !== "style" ? domElement[sProperty] : domElement.getAttribute(sName);
};

/**
 * Set the value of an attribute
 * @param domElement
 * @param sName
 * @param sValue
 */
$.setAttribute = function(domElement, sName, sValue) {
    var sProperty = _aMatchAttributes[sName] || sName;

    if (domElement[sProperty] && sName !== "style") {
        domElement[sProperty] = sValue;
    } else {
        domElement.setAttribute(sName, sValue);
    }
};

$.addClass = function(domElement, sClassName) {
    domElement.className = $.ltrim(domElement.className.concat(' ', sClassName));
    return $;
};

$.removeClass = function(domElement, sClassName) {
    domElement.className = domElement.className.replace(
        new RegExp('\\b'.concat(sClassName, '\\b'), 'g'), '').trim();
    return $;
};

$.hasClass = function(domElement, sClassName) {
    return domElement.className.match(new RegExp('\\b'.concat(sClassName, '\\b'))) !== null;
};

$.addStyle = function(domElement, sName, mValue) {
    domElement.style[$.formatCssKey(sName)] = mValue;
    return $;
};

$.formatCssKey = function(sName) {
    var oRegExp = new RegExp('-([a-z])', 'i');
    sName = sName.replace(oRegExp, function(sMatch, sData, iPos) {
        return sData.toUpperCase();
    });
    return sName;
};

$.addCss = function(domElement, oCss) {
    if ($.isObject(oCss)) {
        $.each(oCss, function(sValue, sName) {
            $.addStyle(domElement, sName, sValue);
        });
    }
};
/********************************************************************************/
/**                                                                            **/
/**                         Framework events functions                         **/
/**                                                                            **/
/********************************************************************************/

var iNextGuid = 1;

$.addEvent = function (domElement, sType, fnCallback, context) {
    var domElement = domElement || window.document,
        context = context || domElement;

    if ("DOMContentLoaded" == sType || "DomReady" == sType) {
        $.onDomReady(fnCallback);
        return this;
    }

    var oData = getElementData(domElement);

    if ($.isUndefined(oData.handlers)) {
        oData.handlers = {};
    }

    if (!oData.handlers[sType]) {
        oData.handlers[sType] = [];
    }

    if (!fnCallback.guid) {
        fnCallback.guid = iNextGuid++;
    }

    oData.handlers[sType].push({callback: fnCallback, context: context});

    // Create dispatcher function
    if ($.isUndefined(oData.dispatcher)) {
        oData.disabled = false;

        oData.dispatcher = function (oRealEvent, extraParams) {
            if (oData.disabled) {
                return;
            }

            var oEvent = formatEvent(oRealEvent);

            if (oData.handlers[oEvent.type]) {
                var iLength = oData.handlers[oEvent.type].length;
                for (var i = 0; i < iLength; i++) {
                    handler = oData.handlers[oEvent.type][i];
                    if (false === handler.callback.call(handler.context, oEvent, extraParams)) {
                        oEvent.preventDefault();
                        oEvent.stopPropagation();
                        return;
                    }
                }
            }
        };
    }

    // Listen event
    if (oData.handlers[sType].length == 1) {
        if (document.addEventListener) {
            domElement.addEventListener(sType, oData.dispatcher, false);
        } else if (document.attachEvent) {
            domElement.attachEvent("on" + sType, oData.dispatcher);
        }
    }
};

$.removeEvent = function (domElement, sType, fnCallback) {
    var oData = getElementData(domElement);

    if ($.isUndefined(oData.handlers)) {
        return;
    }

    var removeEvent = function (sType) {
        oData.handlers[sType] = [];
        cleanUpElement(domElement, sType);
    };

    if (!sType) {
        for (var t in oData.handlers)
            removeEvent(t);
        return;
    }

    var handlers = oData.handlers[sType];
    if (!handlers)
        return;
    if (!fnCallback) {
        removeEvent(sType);
        return;
    }

    if (fnCallback.guid) {
        for (var n = 0; n < handlers.length; n++) {
            if (handlers[n].callback.guid === fnCallback.guid) {
                handlers = handlers.splice(n, 1);
                break;
            }
        }
    }

    cleanUpElement(domElement, sType);
};

$.triggerEvent = function (domElement, sType, extraParams) {
    var oData = getElementData(domElement),
        domParent = domElement.parentNode || domElement.ownerDocument;

    var oEvent = {
        type: sType,
        target: domElement
    };

    oEvent = formatEvent(oEvent);

    if (oData.dispatcher) {
        oData.dispatcher.call(domElement, oEvent, extraParams);
    }

    if (domParent && !oEvent.isPropagationStopped()) {
        $.triggerEvent(domParent, oEvent, extraParams);
    } else if (!domParent && !oEvent.isDefaultPrevented()) {
        var oTargetData = getElementData(oEvent.target);
        if (oEvent.target[oEvent.type]) {
            oTargetData.disabled = true;
            oEvent.target[oEvent.type]();
            oTargetData.disabled = false;
        }
    }
};

function cleanUpElement(domElement, sType) {
    var oData = getElementData(domElement);

    if (oData.handlers[sType].length === 0) {
        delete oData.handlers[sType];
        if (document.removeEventListener) {
            domElement.removeEventListener(sType, oData.dispatcher, false);
        } else if (document.detachEvent) {
            domElement.detachEvent("on" + sType, oData.dispatcher);
        }
    }
    if ($.isEmpty(oData.handlers)) {
        delete oData.handlers;
        delete oData.dispatcher;
    }
    if ($.isEmpty(oData)) {
        removeElementData(domElement);
    }
}

var oElementData = {}, iELementIdCounter = 1, sExpando = "data"
    + (new Date).getTime();

/**
 * Retreive data about a dom element
 * @param domElement
 * @return Object
 */
function getElementData(domElement) {
    var iId = domElement[sExpando];
    if (!iId) {
        iId = domElement[sExpando] = iELementIdCounter++;
        oElementData[iId] = {};
    }
    return oElementData[iId];
}

/**
 * Remove data about a dom element
 * @param domElement
 */
function removeElementData(domElement) {
    var iId = domElement[sExpando];
    if (!iId)
        return;

    delete oElementData[iId];

    try {
        delete domElement[sExpando];
    } catch (e) {
        if (domElement.removeAttribute) {
            domElement.removeAttribute(sExpando);
        }
    }
}

function formatEvent(oEvent) {
    // Declare several used functions
    function returnTrue() {
        return true;
    }

    function returnFalse() {
        return false;
    }

    if (!oEvent || !oEvent.stopPropagation) {
        var oOldEvent = oEvent || window.event;

        // Clone the old object so that we can modify the values
        oEvent = {};
        for (var sPropertyName in oOldEvent) {
            oEvent[sPropertyName] = oOldEvent[sPropertyName];
        }

        // The event occurred on this element
        if (!oEvent.target) {
            oEvent.target = oEvent.srcElement || document;
        }

        // Handle which other element the event is related to
        oEvent.relatedTarget = oEvent.fromElement === oEvent.target ? oEvent.toElement
            : oEvent.fromElement;

        // Stop the default browser action
        oEvent.preventDefault = function () {
            evoEventent.returnValue = false;
            oEvent.isDefaultPrevented = returnTrue;
        };
        oEvent.isDefaultPrevented = returnFalse;

        // Stop the event from bubbling
        oEvent.stopPropagation = function () {
            oEvent.cancelBubble = true;
            oEvent.isPropagationStopped = returnTrue;
        };
        oEvent.isPropagationStopped = returnFalse;

        // Stop the event from bubbling and executing other handlers
        oEvent.stopImmediatePropagation = function () {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        };
        oEvent.isImmediatePropagationStopped = returnFalse;

        // Handle mouse position
        if (oEvent.clientX != null) {
            var doc = document.documentElement, body = document.body;

            oEvent.pageX = oEvent.clientX
                + (doc && doc.scrollLeft || body && body.scrollLeft || 0)
                - (doc && doc.clientLeft || body && body.clientLeft || 0);
            oEvent.pageY = oEvent.clientY
                + (doc && doc.scrollTop || body && body.scrollTop || 0)
                - (doc && doc.clientTop || body && body.clientTop || 0);
        }

        // Handle key presses
        oEvent.which = oEvent.charCode || oEvent.keyCode;

        // Fix button for mouse clicks:
        // 0 == left; 1 == middle; 2 == right
        if (oEvent.button != null) {
            oEvent.button = (oEvent.button & 1 ? 0 : (oEvent.button & 4 ? 1
                : (oEvent.button & 2 ? 2 : 0)));
        }
    }
    return oEvent;
}

/********************************************************************************/
/**                                  DomReady                                  **/
/********************************************************************************/

var
    isDomReady = false,
    isContentLoaded = false,
    aBindList = {
        'domReady': [],
        'contentLoaded': []
    };

$.onDomReady = function (fnCallback, context) {
    var context = context || window.document, oCallback = {
        "callback": fnCallback,
        "context": context
    };

    // Bind one callback
    function bindOne(oCallback) {
        return setTimeout(function () {
            oCallback.callback.apply(oCallback.context)
        }, 0);
    }

    // Bind all saved callbacks
    function bindAll() {
        for (var i in aBindList.domReady) {
            if ($.isObject(aBindList.domReady[i])) {
                bindOne(aBindList.domReady[i]);
            }
        }
        aBindList.domReady = [];
    }

    function DOMContentLoaded() {
        isDomReady = true;
        if (document.addEventListener) {
            document.removeEventListener("DOMContentLoaded", DOMContentLoaded, false);
            bindAll();
        } else if (document.attachEvent) {
            // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
            if (document.readyState === "complete") {
                document.detachEvent("onreadystatechange", DOMContentLoaded);
                bindAll();
            }
        }
    }

    // If dom is already ready
    if (true === isDomReady) {
        bindOne(oCallback);
    }

    // If first time we call onDomReady, prepare event
    if ($.isEmpty(aBindList.domReady)) {
        if (document.readyState === "complete") {
            isDomReady = true;
            bindAll();
            return;
        }

        // Mozilla, Opera and webkit nightlies currently support this event
        if (document.addEventListener) {
            // Use the handy event callback
            document.addEventListener("DOMContentLoaded", DOMContentLoaded, false);

            // A fallback to window.onload, that will always work
            window.addEventListener("load", bindAll, false);

            // If IE event model is used
        } else if (document.attachEvent) {
            // ensure firing before onload,
            // maybe late but safe also for iframes
            document.attachEvent("onreadystatechange", DOMContentLoaded);

            // A fallback to window.onload, that will always work
            window.attachEvent("onload", bindAll);

            // If IE and not a frame
            // continually check to see if the document is ready
            var toplevel = false;

            try {
                toplevel = window.frameElement == null;
            } catch (e) {
            }

            if (document.documentElement.doScroll && toplevel) {
                doScrollCheck();
            }
        }

    }

    aBindList.domReady.push(oCallback);
};
var
    // Store classes here
    classList = {},
    singletonLoaded = {};
/**
 * Set a new class
 * @param String classname Name of the class we create
 * @param Function fnClass Function used to instanciate class
 * @param boolean isAbstract If class is abstract or not
 */
$.Class = function(classname, fnClass, isSingleton) {
    _setClass(classname, fnClass, isSingleton || false);

    // Create Extend method
    fnClass.Extend = function(sParentName) {
        var oChild = this;

        if (!$.isUndefined(oChild.parentName)) {
            throw new Error('Class ' + oChild.toString + ' can\'t inheritance several classes.');
        }
        fnClass.parentName = sParentName;

        // Check if parent is singleton to set this class as singleton too
        var parent = _getClass(sParentName);
        if (parent.isSingleton === true) {
            _setClass(classname, fnClass, true);
        }
        return fnClass;
    };

    return fnClass;
};

/**
 * Load function is used to instanciate a class
 * @param string sClassName
 * @return Object
 */
var instanceIdInc = 0;
$.Load = function(sClassName) {
    var aClass = new _getClass(sClassName);
    var fnClass = aClass.fnClass;
    var isSingleton = aClass.isSingleton;

    if (isSingleton && singletonLoaded[sClassName]) {
        return singletonLoaded[sClassName];
    }

    var oProperty = {
        "oProtected" : {},
        "aParentProtected" : []
    };

    /**
     *  Inheritance is done when loading object
     *  This allows to have a specific protected object for class and inherited classes
     */

    if (!$.isUndefined(fnClass.parentName)) {
        var _oParent = _loadParent(fnClass.parentName, oProperty.oProtected);

        oProperty.aParentProtected[fnClass.parentName] = $.clone(oProperty.oProtected);

        fnClass.prototype = _oParent;
        fnClass.prototype.constructor = _getClass(fnClass.parentName).fnClass;
    }

    var oInstance = new fnClass(oProperty.oProtected);
    oInstance.__classname = sClassName;
    oInstance.__instanceId = instanceIdInc++;

    if (!$.isUndefined(fnClass.parentName)) {
        var oTmpProto = Object.getPrototypeOf(oInstance);

        var mResult = null;

        delete oTmpProto.oProtected;

        oInstance.parentCall = function(sFunction) {
            var oParent = _getParent();

            if (!$.isUndefined(oParent[sFunction])) {

                var oParentProto = Object.getPrototypeOf(oParent);
                if( !$.isUndefined(oParentProto[sFunction]) && oParent[sFunction] == oParentProto[sFunction] ) {
                    oInstance.parentCall.apply(oParent, arguments);
                }
                else if( !$.isUndefined(oInstance[sFunction]) && oParent[sFunction] == oInstance[sFunction] ) {
                    oInstance.parentCall.apply(oParent, arguments);
                }
                else
                {
                    mResult = oParent[sFunction].apply(oInstance, Array.prototype.slice.call(arguments, 1));
                }


            } else if (!$.isUndefined(oProperty.aParentProtected[oParent.__classname][sFunction])) {
                mResult = oProperty.aParentProtected[oParent.__classname][sFunction]
                    .apply(oInstance, Array.prototype.slice.call(
                    arguments, 1));
            } else {
                throw ReferenceError("Method " + sFunction
                    + " does not exist.");
            }

            delete _getParent.parent;

            return mResult;
        };

        function _getParent() {
            var self = arguments.callee;

            return self.parent = (self.parent ? Object
                .getPrototypeOf(self.parent) : _oParent);
        }
    }

    if (!$.isUndefined(oInstance.__construct)
        && $.isFunction(oInstance.__construct)) {
        oInstance.__construct.apply(oInstance, Array.prototype.slice.call(
            arguments, 1));
    }

    if (!$.isUndefined(oInstance.__ready) && $.isFunction(oInstance.__ready)) {
        $.onDomReady(function() {
            oInstance.__ready.apply(oInstance);
        });
    }

    if (isSingleton) {
        singletonLoaded[sClassName] = oInstance;
    }

    return oInstance;

    /**
     * Load class as parent of inheritance
     * @param string sParentName
     * @param Object Protected object
     */
    function _loadParent(sParentName, oProtected) {
        var fnParent = _getClass(sParentName).fnClass;

        // For multiple inheritance
        if (!$.isUndefined(fnParent.parentName)) {
            var _oParent = _loadParent(fnParent.parentName, oProtected);

            oProperty.aParentProtected[fnParent.parentName] = $.clone(oProperty.oProtected);

            fnParent.prototype = _oParent;
            fnParent.prototype.constructor = _getClass(fnParent.parentName).fnClass;
        }

        var oParent = new fnParent(oProtected);
        oParent.__classname = sParentName;

        return oParent;
    }
};

$.isInstanceOf = function(instance, className) {
    var currentInstance = instance;
    while (!$.isUndefined(currentInstance.__classname)) {
        if (currentInstance.__classname === className) {
            return true;
        }
        currentInstance = currentInstance.__proto__;
    }
    return false;
};

/**
 * Get a class
 * @param String sClassName
 * @return mixed
 */
function _getClass(sClassName) {
    var aNamespaces = sClassName.split('.'), sShortClassName = aNamespaces
        .pop();

    var oNamespace = _getNamespace(aNamespaces);

    if ($.isUndefined(oNamespace[sShortClassName])) {

        throw new Error('Class not found : ' + sClassName);
    }

    return oNamespace[sShortClassName];
}


/**
 * Set a class
 * @param {string} classname
 * @param {function} fnClass
 * @return {function}
 * @private
 */
function _setClass(classname, fnClass, isSingleton) {
    var aNamespaces = classname.split('.'),
        sShortClassName = aNamespaces.pop();

    var oNamespace = _getNamespace(aNamespaces);

    if (!$.isUndefined(oNamespace[sShortClassName])
        && $.isObject(oNamespace[sShortClassName])) {
        for (sName in oNamespace[sShortClassName]) {
            fnClass[sName] = oNamespace[sShortClassName][sName];
        }
    }

    return oNamespace[sShortClassName] = {
        fnClass: fnClass,
        isSingleton: isSingleton
    };
}

/**
 *
 * @param aNamespaces
 * @return {window}
 * @private
 */
function _getNamespace(aNamespaces) {
    var oCurrentNamespace = classList;

    $.each(aNamespaces, function(sNamespaceName) {
        if ($.isUndefined(oCurrentNamespace[sNamespaceName])) {
            oCurrentNamespace[sNamespaceName] = {};
        }

        oCurrentNamespace = oCurrentNamespace[sNamespaceName];
    });

    return oCurrentNamespace;
}
})(window);
