$.Class('$.Dom.Svg.Path', function(that){
    var _this = this;

    this.__construct = function(sPoints, oOptions){
        var oOptions = oOptions || {};

        this.parentCall("__construct", 'path', oOptions);

        this.setAttribute("d", sPoints);
    };



}).Extend('$.Dom.Svg.Abstract');