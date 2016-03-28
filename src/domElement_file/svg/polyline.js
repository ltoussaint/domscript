$.Class('$.Dom.Svg.Polyline', function(that){
    var _this = this;

    this.__construct = function(sPoints, oOptions){
        var oOptions = oOptions || {};

        this.parentCall("__construct", 'polyline', oOptions);

        this.setAttribute("points", sPoints);
    };



}).Extend('$.Dom.Svg.Abstract');