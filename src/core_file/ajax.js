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

