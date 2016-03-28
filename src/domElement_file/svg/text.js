$.Class('$.Dom.Svg.Text', function(that){

    this.__construct = function(text, x, y, oOptions){
        oOptions = oOptions || {};

        $.extend(oOptions, {
            "x" : x,
            "y" : y
        });

        this.parentCall("__construct", 'text', oOptions);
        this.text(text);
    };



}).Extend('$.Dom.Svg.Abstract');