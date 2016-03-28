$.Class('$.Dom.Svg.Circle', function(that){

    this.__construct = function(cx, cy, r, oOptions){
        oOptions = oOptions || {};

        $.extend(oOptions, {
            "cx" : cx,
            "cy" : cy,
            "r" : r
        });

        this.parentCall("__construct", 'circle', oOptions);
    };



}).Extend('$.Dom.Svg.Abstract');