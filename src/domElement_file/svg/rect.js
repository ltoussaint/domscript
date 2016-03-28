$.Class('$.Dom.Svg.Rect', function(that){

    this.__construct = function(x, y, w, h, oOptions){
        oOptions = oOptions || {};

        $.extend(oOptions, {
            "x" : x,
            "y" : y,
            "width" : w,
            "height" : h
        });

        this.parentCall("__construct", 'rect', oOptions);
    };



}).Extend('$.Dom.Svg.Abstract');