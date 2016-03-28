$.Class('$.Dom.Svg.Abstract', function(that){
    var _this = this;

    that.aOwnerSvgFilters = [];
    that.aChildrenOwnerSvg = [];

    var _NS = "http://www.w3.org/2000/svg";

    // http://www.w3.org/TR/SVG/coords.html#InterfaceSVGTransform
    // http://www.w3.org/TR/SVG/coords.html#TransformAttribute
    this.SVG_TRANSFORM_UNKNOWN = 0;
    this.SVG_TRANSFORM_MATRIX = 1;
    this.SVG_TRANSFORM_TRANSLATE = 2;
    this.SVG_TRANSFORM_SCALE = 3;
    this.SVG_TRANSFORM_ROTATE = 4;
    this.SVG_TRANSFORM_SKEWX = 5;
    this.SVG_TRANSFORM_SKEWY = 6;

    this.__construct = function(sTagName, oOptions){
        this.parentCall("__construct", _NS, sTagName);
        that._initOptions(oOptions);
    };

    that._initOptions = function(oOptions){
        if( !$.isUndefined(oOptions) && !$.isEmpty(oOptions) )
        {
            $.each(oOptions, function(sValue, sKey){
                _this.setAttribute(sKey, sValue);
            });
        }
    };

    this.addTransformation = function(sValue){
        var sCurrentTransform = this.getAttribute("transform");

        var sFunctionName = /^([^(]+)\(/.exec(sValue)[1];

        var oRegExp = new RegExp("\\s*\\b" + sFunctionName + "\\b\\s*\\([^)]+\\)\\s*", "i");

        sCurrentTransform = sCurrentTransform.replace(oRegExp, '');

        sCurrentTransform += " " + sValue;

        var sCurrentTransform = this.setAttribute("transform", sCurrentTransform);

        return this;
    };

    this.attachClippath = function(oClippath){
    	var sId = oClippath.createId();

    	this.setAttribute("clip-path", "url(#" + sId +")");

    	that.aOwnerSvgFilters.push(oClippath);

    	if( !$.isUndefined(that.oOwnerSvg) && null != that.oOwnerSvg) {
			that.oOwnerSvg.attachFilter(oClippath);
    	}
    };

    this.attachFilter = function(oFilter){
    	var sId = oFilter.createId();

    	this.setAttribute("filter", "url(#" + sId +")");

    	that.aOwnerSvgFilters.push(oFilter);

    	if( !$.isUndefined(that.oOwnerSvg) && null != that.oOwnerSvg ) {
			that.oOwnerSvg.attachFilter(oFilter);
    	}

    };

    that.setChildrenOwnerSvg = function(){
        $.each(that.aChildrenOwnerSvg, function(oDomElement){
    		oDomElement.setOwnerSvg(that.oOwnerSvg);
    	});
    };

    this.appendChild = function(oDomElement){
        console.log(this, oDomElement);
        console.log(this.getDomElement(), oDomElement.getDomElement());
    	that.domElement.appendChild(oDomElement.getDomElement());

    	that.aChildrenOwnerSvg.push(oDomElement);

    	if( !$.isUndefined(that.oOwnerSvg) && null != that.oOwnerSvg) {
    		oDomElement.setOwnerSvg(that.oOwnerSvg);
    	}
    };

    this.setOwnerSvg = function(oOwnerSvg){
        that.oOwnerSvg = oOwnerSvg;

        for(var i=0; i<that.aChildrenOwnerSvg.length; i++) {
            that.aChildrenOwnerSvg[i].setOwnerSvg(oOwnerSvg);
        }

        for(var i=0; i<that.aOwnerSvgFilters.length;i++) {
            that.oOwnerSvg.attachFilter(that.aOwnerSvgFilters[i]);
        }
        return this;
    };

    this.createId = function() {
		var sId = "fi" + (iFilterIdInc++);

		_this.setAttribute("id", sId);

		return sId;
	};




	function _addOwnerSvgAttributes(){
        $.each(that.aOwnerSvgFilters, function(oFilter){
			that.oOwnerSvg.appendFilter(oFilter);
		});
	}

}).Extend('$.Dom.ElementNS');