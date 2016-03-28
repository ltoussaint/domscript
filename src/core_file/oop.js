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