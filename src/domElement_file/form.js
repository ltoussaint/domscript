$.Class('$.Dom.Form', function(that){
    var _this = this;

    this.__construct = function(sTagName) {
        if ( $.isString(sTagName) && "form" != sTagName.toLowerCase() ) {
            throw Error("Could only create form tag with Form class!");
        } else if ( sTagName.nodeType && "FORM" != sTagName.tagName ) {
            throw Error("Could only create form tag with Form class");
        } else if ($.isUndefined(sTagName)) {
            sTagName = "form";
        }
        this.parentCall.call(_this, "__construct", sTagName);
    };

    this.onSubmit = function(callback){
        $.addEvent(
            that.domElement,
            "submit",
            function(event){
                event.preventDefault();

                return callback(event, getFormData(event));
            }
        );
    };

    function getFormData(event) {
        var formData = {};
        $.each(that.domElement.elements, function(formElement){
            if (!$.isEmpty(formElement.name)) {
                formData[formElement.name] = $.Load("$.Dom.Form.Element", formElement); // Store custom $.Dom.Form.Element object
            }
        });
        return formData;
    }

}).Extend('$.Dom.Element');