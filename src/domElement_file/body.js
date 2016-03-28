$.Class("$.Dom.Body", function($that){

    this.__construct = function(){
        if (null == window.document.body) {
            throw new Error('To use $.Dom.Body, you need to wait dom is ready');
        }
        this.parentCall('__construct', window.document.body);
    };


}).Extend("$.Dom.Element");