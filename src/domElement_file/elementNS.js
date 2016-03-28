$.Class('$.Dom.ElementNS', function(that){

    this.__construct = function(NS, sTagName){

        that.oOwnerSvg = null;
        that.aStyleList = [];

        if( $.isString(sTagName) )
        {
            that.domElement = document.createElementNS(NS, sTagName);
        }
        else
        {
            that.domElement = sTagName;
        }

        return this;
    };


    this.getAttribute = function(sName){
        return that.domElement.getAttributeNS(null, sName);
    };

    this.setAttribute = function(sName, sValue){
        return that.domElement.setAttributeNS(null, sName, sValue);
    };

    this.addStyle = function(sName, mValue){
        $.addStyle(that.domElement, sName, mValue);
        return this;
    };

    this.text = function (sText) {
        that.domElement.textContent = sText;
    };

    this.getOwnerSvg = function(){
        return that.oOwnerSvg;
    };

    this.setOwnerSvg = function(domSvgOwner){
        that.oOwnerSvg = domSvgOwner;
        for(var i=0; i<that.aOwnerSvgFilters.length;i++) {
            that.oOwnerSvg.attachFilter(that.aOwnerSvgFilters[i]);
        }
        return this;
    };

    function _createStyle(oStyle){

    }

}).Extend('$.Dom.Abstract');