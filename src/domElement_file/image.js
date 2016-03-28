$.Class('$.Dom.Image', function($that){
    var src;

    this.__construct = function(newSrc) {
        src = newSrc || null;
        $that.domElement = new Image();

        if (!$.isUndefined($that.container) && !$.isUndefined(document.getElementById($that.container))) {
            document.getElementById($that.container).appendChild($that.domElement);
        }
    };

    this.setSrc = function(src) {
        $that.domElement.src = src;
        return this;
    };

    this.setHeight = function(height) {
        $that.domElement.height = height;
        return this;
    };

    this.setWidth = function(width) {
        $that.domElement.width = width;
        return this;
    };

    this.load = function() {
        $that.domElement.src = src;
    };

    this.onload = function(callback, context) {
        this.addEvent("load", callback, context || this);
        return this;
    };

    return true;


}).Extend('$.Dom.Element');