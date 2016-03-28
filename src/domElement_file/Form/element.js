$.Class('$.Dom.Form.Element', function(that){
    var _this = this;


    this.value = function(str) {
        if ($.isUndefined(str)) {
            return that.domElement.value;
        } else {
            that.domElement.value = str;
            return this;
        }

    }

}).Extend('$.Dom.Element');