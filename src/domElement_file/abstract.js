

$.Class("$.Dom.Abstract", function($that){
    $that.domElement;
    $that.domContainer;
    $that.oOwnerSvg;

    this.getDomElement = function(){
        return $that.domElement;
    };

    this.getValue = function() {
        return $that.domElement.value || null;
    };

    this.isChecked = function() {
        return $that.domElement.checked || false;
    };

    this.check = function() {
        if (!$.isUndefined($that.domElement.checked)) {
            $that.domElement.checked = true;
        }
        return this;
    };

    this.uncheck = function() {
        if (!$.isUndefined($that.domElement.checked)) {
            $that.domElement.checked = false;
        }
        return this;
    };

    this.addClass = function(sClassName){
        $.addClass($that.domElement, sClassName);
        return this;
    };

    this.removeClass = function(sClassName){
        $.removeClass($that.domElement, sClassName);
        return this;
    };

    this.hasClass = function(sClassName){
        return $.hasClass($that.domElement, sClassName);
    };

    this.addStyle = function(sName, mValue){
        $.addStyle($that.domElement, sName, mValue);
        return this;
    };

    this.addCss = function(oCss){
        $.addCss($that.domElement, oCss);
        return this;
    };

    this.appendChild = function(oDomElement)
    {
        $that.domElement.appendChild(oDomElement.getDomElement());
        return this;
    };

    this.addEvent = function(sType, fnCallback, context)
    {
        context = context || this;
        $.addEvent($that.domElement, sType, function(oEvent, extraParameters) {
            oEvent.$domTarget = $.Load('$.Dom.Element', oEvent.target);
            fnCallback.call(context, oEvent, extraParameters);
        });
        return this;
    };

    this.delete = function() {
        $that.domElement.parentNode.removeChild($that.domElement);
        return this;
    };

    this.setOwnerSvg = function(ownerSvg) {
        $that.oOwnerSvg = ownerSvg;
        return this;
    };

    this.isDomScript = true;

    return true;




});