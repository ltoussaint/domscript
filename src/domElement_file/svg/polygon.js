$.Class('$.Dom.Svg.Polygon', function(that){
    var _this = this;

    this.__construct = function(sPoints, oOptions){
        var oOptions = oOptions || {};

        this.parentCall("__construct", 'polygon', oOptions);

        this.setAttribute("points", sPoints);
    };



}).Extend('$.Dom.Svg.Abstract');