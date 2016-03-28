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
