/********************************************************************************/
/**                                                                            **/
/**                               Core functions                               **/
/**                                                                            **/
/********************************************************************************/

var
    $ = {},
    $_old = window.$,
// Mapping between toString of object and type
    typeFromString = {
        "[object Array]": "array",
        "[object Boolean]": "boolean",
        "[object Date]": "date",
        "[object Error]": "error",
        "[object Function]": "function",
        "[object Number]": "number",
        "[object Object]": "object",
        "[object RegExp]": "regexp",
        "[object String]": "string"
    },

// Save a reference to some core methods
//refArrayConcat = core_deletedIds.concat,
//refArrayPush = core_deletedIds.push,
//refArraySlice = core_deletedIds.slice,
//refArrayIndexOf = core_deletedIds.indexOf,
    refObjectToString = typeFromString.toString,
//refObjectHasOwn = typeFromString.hasOwnProperty,
//refStringTrim = "".trim,
    b = ""
    ;

/**
 * Test if a variable has been set or not
 * @param {mixed} oObject
 * @return {Boolean}
 */
!$.isUndefined = function (oObject) {
    return "undefined" !== typeof oObject || null === oObject;
};

/**
 * Test if a variable is considered as empty or not
 *
 * Variable is considered as empty if its value
 * - is null
 * - is an empty object {}
 * - is an empty array []
 * - is an empty string ''
 *
 * @param {mixed} mVar
 * @return {Boolean}
 */
$.isEmpty = function (mVar) {
    if ($.isUndefined(mVar)) {
        return true;
    }

    if ($.isArray(mVar)) {
        return isEmptyArray(mVar);
    } else if ($.isObject(mVar)) {
        return isEmptyObject(mVar);
    } else {
        return !mVar
    }
};

/********************************************************************************/
/**                            Test variable type                              **/
/********************************************************************************/

$.typeOf = function (oObject) {
    // null => "null" ; undefined => "undefined"
    if (null == oObject) {
        return String(oObject);
    }
    return typeof oObject === "object" || typeof oObject === "function" ?
    typeFromString[refObjectToString.call(oObject)] || "object" :
        typeof oObject;
};

$.isFunction = function (oObject) {
    return typeof oObject === "function";
};

$.isObject = function (oObject) {
    if (oObject == null) {
        return String(oObject) == "object";
    }
    if (typeof oObject === "object" || typeof oObject === "function") {
        return ({}).toString.call(oObject) === "[object Object]";
    } else {
        return typeof oObject === "object";
    }
};

$.isArray = Array.isArray || function (oObject) {
        return typeof oObject === "array";
    };

$.isWindow = function (oObject) {
    return oObject != null && oObject == oObject.window;
};

$.isNumeric = function (oObject) {
    return !isNaN(parseFloat(oObject)) && isFinite(oObject);
};

$.isString = function (oObject) {
    return typeof oObject === "string";
};


/********************************************************************************/
/**                              String methods                                **/
/********************************************************************************/

$.trim = function (text, chars) {
    var chars = chars || '\\s';
    text = $.ltrim(text, chars);
    return $.rtrim(text, chars);
};

$.ltrim = function (text, chars) {
    var chars = chars || '\\s';
    var regExp = new RegExp("^[" + chars + "]*", "m");
    return $.isString(text) ? text.replace(regExp, '') : text;
};

$.rtrim = function (text, chars) {
    var chars = chars || '\\s';
    var regExp = new RegExp("[" + chars + "]*$", "m");
    return $.isString(text) ? text.replace(regExp, '') : text;
};

$.capitalizeFirst = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/********************************************************************************/
/**                           Object/Array methods                             **/
/********************************************************************************/

/**
 * Walk on an object an launch callback in each property
 *
 * @param {object} obj
 * @param {function} callback
 * @param {int} iStart
 */
$.each = function (obj, callback, context) {
    var i = 0,
        context = context || obj;
    if ($.isArray(obj)) {
        var length = obj.length;
        for (; i < length; ++i) {
            if (i in obj) {
                if (false === callback.call(context, obj[i], i, obj))
                    break;
            }
        }
    } else {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (false === callback.call(context, obj[i], i, obj)) {
                    break;
                }
            }
        }
    }
};

$.loop = function (start, end, increment, callback) {
    if (!$.isUndefined(callback) && $.isFunction(increment)) {
        callback = increment;
        increment = start > end ? -1 : 1;
    } else {
        increment = $.isEmpty(increment) ? 1 : increment;
        increment = start > end ? -1 * increment : increment;
    }

    var i = start;
    var min = start > end ? end : i;
    var max = start > end ? i : end;

    for (; min <= max; i += increment) {
        if (false === callback(i)) {
            break;
        }
        if (start > end) {
            max += increment;
        } else {
            min += increment;
        }
    }
    return $;
};

$.clone = function (obj) {
    var i = 0,
        isArray = $.isArray(obj),
        newObj = isArray ? [] : {};
    if (isArray) {
        var length = obj.length;
        for (; i < length; ++i) {
            if ($.isObject(obj[i])) {
                newObj[i] = $.clone(obj[i]);
            } else {
                newObj[i] = obj[i];
            }
        }
    } else {
        for (var i in obj) {
            if ($.isObject(obj[i])) {
                newObj[i] = $.clone(obj[i]);
            } else {
                newObj[i] = obj[i];
            }
        }
    }
};

$.extend = function (oBase) {
    var sProperty, aFrom, aArgs = arguments, iLength = aArgs.length, iIndex;

    for (iIndex = 1; iIndex < iLength; ++iIndex) {
        aFrom = aArgs[iIndex];

        for (var sProperty in aFrom) {
            try {
                oBase[sProperty] = aFrom[sProperty];
            } catch (e) {
                if (typeof oBase[sProperty] == 'object') {
                    $.extend(oBase[sProperty], aFrom[sProperty]);
                }
            }
        }
    }

    return oBase;
};

$.getLength = function (obj) {
    var i = 0;

    if (!$.isUndefined(obj.length)) {
        return obj.length;
    }

    for (var sIndex in obj) {
        i++;
    }

    return i;
};

$.random = function (min, max) {
    if (max == null) {
        max = min;
        min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
};

// Shuffle a collection.
$.shuffle = function (obj) {
    return $.sample(obj, Infinity);
};

// Sample **n** random values from a collection using the modern version of the
// [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
// If **n** is not specified, returns a single random element.
// The internal `guard` argument allows it to work with `map`.
$.sample = function (obj, n, guard) {
    if (n == null || guard) {
        if (!isArrayLike(obj)) obj = _.values(obj);
        return obj[$.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? $.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
        var rand = $.random(index, last);
        var temp = sample[index];
        sample[index] = sample[rand];
        sample[rand] = temp;
    }
    return sample.slice(0, n);
};


/********************************************************************************/
/**                            Functions methods                               **/
/********************************************************************************/

// For Firefox
function t() {
};
if (false && !$.isUndefined(t.name)) {
    $.getFunctionName = function (fnFunction) {
        return fnFunction.name;
    };
} else {
    $.getFunctionName = function (fnFunction) {
        var sFunctionContent = fnFunction.toString();

        var oRegex = new RegExp("function[ ]*([^\\( ]*)[ ]*\\(", "ig");
        var aRes = oRegex.exec(sFunctionContent);

        if (!$.isUndefined(aRes[1])) {
            return aRes[1];
        }

        return null;
    };
}

var tmplCache = {};
var tmplIdInc = 0;

$.tmpl = function tmpl(str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
        tmplCache[str] = tmplCache[str] ||
            tmpl(document.getElementById(str).innerHTML) :

        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function("obj",
            "var p=[],print=function(){p.push.apply(p,arguments);};" +

                // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +

                // Convert the template into pure JavaScript
            str
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'")
            + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn(data) : fn;


    function rewriteTmpl(sTmpl) {
        var oRegExp = new RegExp("\{\{click=>([^}]+)\}\}", "mi");
        var match = oRegExp.exec(sTmpl);

        if (!$.isUndefined(match) && null != match) {
            $.addEvent("")
        } else {
            return sTmpl;
        }
    }
};

/**
 * Callback manager for context
 * @param callback
 * @param context
 * @returns {Function}
 */
$.callback = function (callback, context) {
    var context = context || null;
    return function () {
        return callback.apply(context, arguments);
    }
};

/********************************************************************************/
/**                                                                            **/
/**                          Public DomScript Object                           **/
/**                                                                            **/
/********************************************************************************/

$.noConflict = function (newName) {
    var newName = newName || null;

    if (window.$ === $) {
        window.$ = $_old;
    }

    if (null !== newName) {
        window[newName] = $;
    }
    return $;
}

window.$ = $;

/********************************************************************************/
/**                                                                            **/
/**                             Internal functions                             **/
/**                                                                            **/
/********************************************************************************/

/**
 * If array is empty
 * @param array mVar
 * @return {Boolean}
 */
function isEmptyArray(arr) {
    return 0 === arr.length;
}

/**
 * If object is empty
 * @param Object obj
 * @return {Boolean}
 */
function isEmptyObject(obj) {
    for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
            return false;
        }
    }
    return true;
}
