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