(function($) {



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
var cacheMicroTemplate = {};

var
    ELEMENT_NODE = 1,
    ATTRIBUTE_NODE = 2,
    TEXT_NODE = 3,
    CDATA_SECTION_NODE = 4,
    ENTITY_REFERENCE_NODE = 5,
    ENTITY_NODE = 6,
    PROCESSING_INSTRUCTION_NODE = 7,
    COMMENT_NODE = 8,
    DOCUMENT_NODE = 9,
    DOCUMENT_TYPE_NODE = 10,
    DOCUMENT_FRAGMENT_NODE = 11,
    NOTATION_NODE = 12;

$.Class('$.Dom.Element', function (that) {
    that.__id = null;
    that.__container = null;
    that.__template = null;
    that.__class = null;

    this.__construct = function (sTagName, sNS) {

        // Create the DOM Element
        if ($.isString(sTagName)) {
            // If element id given
            if (0 === sTagName.indexOf('#')) {
                that.domElement = document.getElementById(sTagName.substring(1));
                if (null == that.domElement) {
                    throw new Error('Element with specified id not found : ' + sTagName);
                }
            }
            else if (!$.isUndefined(sNS)) {
                that.domElement = document.createElementNS(sNS, sTagName.toLowerCase());
            }
            else {
                that.domElement = document.createElement(sTagName.toLowerCase());
            }
        } else if (!$.isUndefined(sTagName)) {
            that.domElement = sTagName;
        }
        else {
            that.domElement = document.createElement('div');
        }

        // Check micro template
        if (!$.isNull(that.__template)) {
            loadMicroTemplate.call(this);
        }

        // Check attributes
        if (!$.isNull(that.__id)) {
            that.domElement.setAttribute('id', that.__id);
        }
        if (!$.isNull(that.__class)) {
            that.domElement.className = that.__class;
        }

        // Check container
        if (!$.isNull(that.__container)) {
            if (that.__container.isDomScript) {
                that.__container.appendChild(this);
            } else {
                var $el = $.Load('$.Dom.Element', that.__container);
                $el.appendChild(this);
            }
        }

        return this;
    };

    this.getDomElementFromTemplate = function () {
        var templateContent = this.getTemplateContent();
        var regExp = new RegExp("^[ \t\r\n\v\f]*<([a-z]+)[^>]*>(.*)</\\1>", "im");
        var match = regExp.exec(templateContent);

        if (null != match) {
            that.domElement = document.createElement(match[1]);
            that.domContent = match[2];

            this.reloadContent();
        } else {
            //this.reloadContent();
            throw Error("Can't parse microtemplate");
        }
    };

    this.getTemplateContent = function () {
        if (0 === that.__template.indexOf('<')) {
            return that.__template;
        } else {
            try {
                return document.getElementById(that.__template).innerHTML;
            } catch (e) {
                throw Error("Can't find microTemplate with id " + that.__template);
            }
        }
    };

    this.getAttribute = function (sName) {
        return $.getAttribute(that.domElement, sName);
    };

    this.setAttribute = function (sName, sValue) {
        $.setAttribute(that.domElement, sName, sValue);
        return this;
    };

    this.onClick = function (fnCallback) {
        if ($.isFunction(fnCallback)) {
            this.addEvent("click", fnCallback);
            return this;
        }
        else {
            throw new Exception('Onclick need callback function as first parameter.');
        }
    };

    this.html = function (sHtml) {
        that.domElement.innerHTML = sHtml;
    };

    this.text = function (sText) {
        that.domElement.textContent = sText;
    };

    this.reloadTemplate = function () {
        if (!$.isNull(that.__template)) {
            loadMicroTemplate.call(this);
        }
    };


    function loadMicroTemplate() {
        var templateCompiled = $.template(that.__template);
        this.html(templateCompiled({$this: this, $that: that}));
    }

}).Extend('$.Dom.Abstract');
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
$.Class("$.Dom.Body", function($that){

    this.__construct = function(){
        if (null == window.document.body) {
            throw new Error('To use $.Dom.Body, you need to wait dom is ready');
        }
        this.parentCall('__construct', window.document.body);
    };


}).Extend("$.Dom.Element");
$.Class('$.Dom.Svg', function (that) {
    var _this = this;

    var _NS = "http://www.w3.org/2000/svg";

    // Included objects
    that.oDefs = null;

    this.__construct = function (w, h) {
        this.parentCall("__construct", 'svg', _NS);

        if (w && h) {
            this.setHeight(h);
            this.setWidth(w);
        }
        this.setAttribute('xmlns', _NS);

    };

    this.setHeight = function(size) {
        this.setAttribute("height", size);
        if (/^[0-9]+$/.exec(size)) {
            size = size + 'px';
        }
        this.addStyle("height", size);
    };

    this.setWidth = function(size) {
        this.setAttribute("width", size);
        if (/^[0-9]+$/.exec(size)) {
            size = size + 'px';
        }
        this.addStyle("width", size);
    };

    this.getAttribute = function (sName) {
        return $.getAttribute(that.domElement, sName);
    };

    this.setAttribute = function (sName, sValue) {
        return $.setAttribute(that.domElement, sName, sValue);
    };


    function _initOptions(oOptions) {
        var aStyleAttributes = ["height", "width"];

        _this.setAttribute('xmlns', _NS);
        _this.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");

        _this.setAttribute('version', "1.2");

        if (!$.isUndefined(oOptions)) {
            oOptions.each(function (sKey, sValue) {
                if (aStyleAttributes.inArray(sKey)) {
                    _this.addStyle(sKey, sValue);
                }

                _this.setAttribute(sKey, sValue);

            });
        }
    }

    this.attachFilter = function (oFilter) {
        if (null === that.oDefs) {
            that.oDefs = document.createElementNS(_NS, "defs");
            that.domElement.appendChild(that.oDefs);
        }

        that.oDefs.appendChild(oFilter.getDomElement());
    };

    this.appendChild = function (oDomElement) {
        oDomElement.setOwnerSvg(this);

        that.domElement.appendChild(oDomElement.getDomElement());
    };


}).Extend('$.Dom.Element');
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
$.Class('$.Dom.Svg.Group', function($that){
    this.__construct = function(oOptions){
        var oOptions = oOptions || {};

        this.parentCall("__construct", 'g', oOptions);
    };







}).Extend('$.Dom.Svg.Abstract');
$.Class('$.Dom.Svg.Path', function(that){
    var _this = this;

    this.__construct = function(sPoints, oOptions){
        var oOptions = oOptions || {};

        this.parentCall("__construct", 'path', oOptions);

        this.setAttribute("d", sPoints);
    };



}).Extend('$.Dom.Svg.Abstract');
$.Class('$.Dom.Svg.Polyline', function(that){
    var _this = this;

    this.__construct = function(sPoints, oOptions){
        var oOptions = oOptions || {};

        this.parentCall("__construct", 'polyline', oOptions);

        this.setAttribute("points", sPoints);
    };



}).Extend('$.Dom.Svg.Abstract');
$.Class('$.Dom.Svg.Polygon', function(that){
    var _this = this;

    this.__construct = function(sPoints, oOptions){
        var oOptions = oOptions || {};

        this.parentCall("__construct", 'polygon', oOptions);

        this.setAttribute("points", sPoints);
    };



}).Extend('$.Dom.Svg.Abstract');
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
$.Class('$.Dom.Svg.Defs.ClipPath', function(that) {
	var _this = this;

	this.__construct = function(){
		this.parentCall("__construct", "clipPath");
	};


	this.addPath = function(oPath){
		this.appendChild(oPath);
	};

	that.createId = function() {
		var sId = "fi" + (iFilterIdInc++);

		_this.setAttribute("id", sId);

		return sId;
	};

}).Extend('$.Dom.Svg.Abstract');

var iFilterIdInc = 1;

$.Class('$.Dom.Svg.Defs.Filter.Abstract', function(that) {
	var _this = this;




	this.createId = function() {
		var sId = "fi" + (iFilterIdInc++);

		_this.setAttribute("id", sId);

		return sId;
	};

}).Extend('$.Dom.Svg.Abstract');

var iGaussianBlurInc = 1;

$.Class('$.Dom.Svg.Defs.Filter.ColorMatrix', function(that) {
	var _this = this, _sType, _sValue;

	this.__construct = function(sType, sValue) {
		_sType = sType;
		_sValue = sValue;

		this.parentCall("__construct", 'feColorMatrix');

		that.initAttributes();
	};

	that.initAttributes = function() {
		_this.setAttribute("type", _sType);
		_this.setAttribute("values", _sValue);
	};

	this.writeFilter = function() {

	};

}).Extend('$.Dom.Svg.Defs.Filter.Abstract');

var iFilterInc = 1;

$.Class('$.Dom.Svg.Defs.Filter.FilterList', function(that) {
	var _this = this, _sIn, _stdDeviationX, _stdDeviationY;

	this.__construct = function(sIn, stdDeviationX, stdDeviationY) {
		_sIn = sIn || "sIn, stdDeviationX, stdDeviationY";
		_stdDeviationX = stdDeviationX || 0;
		_stdDeviationY = stdDeviationY || _stdDeviationX;


		this.parentCall("__construct", 'filter');

		var sId = that.createId();


	};

	that.initAttributes = function() {
		this.setAttribute("in", _sIn);

		if (_stdDeviationX == _stdDeviationY) {
			this.setAttribute("stdDeviation", _stdDeviationX);
		} else {
			this.setAttribute("stdDeviationX", _stdDeviationX);
			this.setAttribute("stdDeviationY", _stdDeviationY);
		}
	};

	this.addFilter = function(oFilter){
		this.appendChild(oFilter);

		return this;
	};

	that.createId = function() {
		var sId = "fi" + (iFilterInc++);

		_this.setAttribute("id", sId);


		return sId;
	};

}).Extend('$.Dom.Svg.Defs.Filter.Abstract');

var iGaussianBlurInc = 1;

$.Class('$.Dom.Svg.Defs.Filter.GaussianBlur', function(that) {
	var _this = this, _sIn, _stdDeviationX, _stdDeviationY;

	this.__construct = function(sIn, stdDeviationX, stdDeviationY) {
		_sIn = sIn || "sIn, stdDeviationX, stdDeviationY";
		_stdDeviationX = stdDeviationX || 0;
		_stdDeviationY = stdDeviationY || _stdDeviationX;

		this.parentCall("__construct", 'feGaussianBlur');

		that.initAttributes();
	};

	that.initAttributes = function() {
		_this.setAttribute("in", _sIn);

		if (_stdDeviationX == _stdDeviationY) {
			_this.setAttribute("stdDeviation", _stdDeviationX);
		} else {
			_this.setAttribute("stdDeviationX", _stdDeviationX);
			_this.setAttribute("stdDeviationY", _stdDeviationY);
		}
	};

	this.writeFilter = function() {

	};

}).Extend('$.Dom.Svg.Defs.Filter.Abstract');

$.Class('$.Dom.Svg.Defs.Filter.Merge', function(that) {
	var _this = this, _sType, _sValue;

	this.__construct = function() {
		this.parentCall("__construct", 'feMerge');
	};

	this.addNode = function(oNode) {
		this.appendChild(oNode);
	};


}).Extend('$.Dom.Svg.Defs.Filter.Abstract');

$.Class('$.Dom.Svg.Defs.Filter.Merge.Node', function(that) {
	var _this = this, _sType, _sValue;

	this.__construct = function(oOptions) {
		this.parentCall("__construct", 'feMergeNode');

		that._initOptions(oOptions);
	};

	this.addNode = function(oNode) {
		this.appendChild(oNode);
	};


}).Extend('$.Dom.Svg.Defs.Filter.Abstract');

$.Class("$.Dom.Canvas", function($that){

  $that.context;
  $that.height = 150;
  $that.width = 300;
  $that.children = [];

  $that.fillStyle = null;

  /**
   * Canvas constructor
   * @private
   */
  this.__construct = function () {
    this.parentCall('__construct', 'canvas');
  };

  this.display = function () {
    if ($that.fillStyle) {
      console.log('Display fill style');
      $that.context.fillStyle = $that.fillStyle;
    }

    console.log('Reload canvas');
    for (var i in $that.children) {
      for (var j in $that.children[i]) {
        $that.children[i][j].display();
        _clearContext.call(this);
      }
    }
  };

  /**
   * Get canvas context
   * @returns {*}
   */
  this.getContext = function (){
    return $that.context;
  };

  /**
   * Get canvas height
   * @returns int
   */
  this.getHeight = function () {
    return $that.height;
  };

  /**
   * Set canvas height
   * @param height
   * @returns $.Dom.Canvas
   */
  this.setHeight = function (height) {
    $that.height = height;
    $that.domElement.setAttribute('height', $that.height);
    return this;
  };

  /**
   * Get canvas width
   * @returns int
   */
  this.getWidth = function () {
    return $that.width;
  };

  /**
   * Set canvas width
   * @param width
   * @returns $.Dom.Canvas
   */
  this.setWidth = function (width) {
    $that.width = width;
    $that.domElement.setAttribute('width', $that.width);
    return this;
  };

  this.addChild = function(child, zIndex) {
    zIndex = zIndex || 1;
    if ($.isUndefined($that.children[zIndex])) {
      $that.children[zIndex] = [];
    }
    console.log('Add child', this);
    child.setCanvas(this);
    $that.children[zIndex].push(child);
    console.log($that.children);
    return this;
  };

  /**
   * Set object fillStyle
   * @param fillStyle
   * @returns $.Dom.Canvas.DisplayObject
   */
  this.setFillStyle = function (fillStyle) {
    $that.fillStyle = fillStyle;
    return this;
  };

  /**
   * Get object fillStyle
   * @returns {*}
   */
  this.getFillStyle = function () {
    return $that.fillStyle;
  };

  /**
   * Initialize canvas
   * @returns {*}
   * @private
   */
  $that._initCanvas = function() {
    $that.context = $that.domElement.getContext('2d');
    return this;
  };

  return;

  /**
   * Clear context using default value
   * @returns {*}
   * @private
   */
  function _clearContext() {
    $that.context.globalAlpha = 1;
    $that.context.fillStyle = '#FFFFFF';
    return this;
  }

}).Extend("$.Dom.Element");
$.Class('$.Dom.Canvas.DisplayObject', function($that) {

  $that.x = 0;
  $that.y = 0;
  $that.z = 0;
  $that.height = 0;
  $that.width = 0;

  $that.canvas;
  $that.alpha = 1;
  $that.fillStyle = null;

  /**
   * Canvas image constructor
   * @param options
   * @private
   */
  this.__construct = function (options) {
    _loadOptions.call(this, options || {});
  };

  this.display = function () {
    $that.canvas.getContext().globalAlpha = $that.alpha;
    console.log('Ok set alpha');
    if ($that.fillStyle) {
      $that.canvas.getContext().fillStyle = $that.fillStyle;
      $that.canvas.getContext().fillRect(0, 0, $that.width, $that.height);
    }
    return this;
  };

  /**
   * Set canvas parent
   * @param canvas
   * @returns $.Dom.Canvas.DisplayObject
   */
  this.setCanvas = function (canvas) {
    $that.canvas = canvas;
    return this;
  };

  /**
   * Set object x position
   * @param url
   * @returns $.Dom.Canvas.DisplayObject
   */
  this.setX = function (x) {
    $that.x = x;
    return this;
  };

  /**
   * Get object x position
   * @returns {int}
   */
  this.getX = function() {
    return $that.x;
  };

  /**
   * Set object y position
   * @param url
   * @returns $.Dom.Canvas.DisplayObject
   */
  this.setY = function (y) {
    $that.y = y;
    return this;
  };

  /**
   * Get object y position
   * @returns {int}
   */
  this.getY = function() {
    return $that.y;
  };

  /**
   * Set object z position
   * @param url
   * @returns $.Dom.Canvas.DisplayObject
   */
  this.setZ = function (z) {
    $that.z = z;
    return this;
  };

  /**
   * Get  bject z position
   * @returns {int}
   */
  this.getZ = function() {
    return $that.z;
  };

  /**
   * Set image height
   * @param height
   * @returns $.Dom.Canvas.Image
   */
  this.setHeight = function (height) {
    $that.height = height;
    return this;
  };

  /**
   * Get image height
   * @returns int
   */
  this.getHeight = function () {
    return $that.height;
  };

  /**
   * Set image width
   * @param width
   * @returns $.Dom.Canvas.Image
   */
  this.setWidth = function (width) {
    $that.width = width;
    return this;
  };

  /**
   * Get image width
   * @returns int
   */
  this.getWidth = function () {
    return $that.width;
  };

  /**
   * Set object alpha
   * @param alpha
   * @returns $.Dom.Canvas.DisplayObject
   */
  this.setAlpha = function(alpha) {
    $that.alpha = alpha;
    return this;
  };

  /**
   * Get object alpha
   * @returns {number}
   */
  this.getAlpha = function () {
    return $that.alpha;
  };

  /**
   * Set object fillStyle
   * @param fillStyle
   * @returns $.Dom.Canvas.DisplayObject
   */
  this.setFillStyle = function (fillStyle) {
    $that.fillStyle = fillStyle;
    return this;
  };

  /**
   * Get object fillStyle
   * @returns {*}
   */
  this.getFillStyle = function () {
    return $that.fillStyle;
  };

  return;


});
$.Class('$.Dom.Canvas.Image', function($that) {

    $that.url = '';

    var _isLoaded = false;
    var _image;

  /**
   * Canvas image constructor
   * @param options
   * @private
   */
  this.__construct = function (options) {
    _loadOptions.call(this, options || {});
  };

  this.display = function () {
    if (true == _isLoaded) {
      console.log('Call parent display');
      this.parentCall('display');
      $that.canvas.getContext().drawImage(_image, $that.x, $that.y, $that.width, $that.height);
    }
  };

  /**
   * Set image url
   * @param url
   * @returns $.Dom.Canvas.Image
   */
  this.setUrl = function (url) {
    _isLoaded = false;
    $that.url = url;
    _loadImage.call(this);
    return this;
  };

  /**
   * Get image url
   * @returns {string}
   */
  this.getUrl = function() {
    return $that.url;
  };

  return

  function _loadImage() {
    _image = document.createElement('img');

    _image.onload = $.callback(function() {
      _isLoaded = true;
      this.display();
    }, this);
    _image.src = $that.url;
    return this;
  }

  /**
   * Load image options
   * @param options
   * @private
   * @returns $.Dom.Canvas.Image
   */
  function _loadOptions (options) {
    $that.url = options.url || $that.url;
    $that.height = options.height || $that.height;
    $that.width = options.width || $that.width;
    return this;
  }

}).Extend('$.Dom.Canvas.DisplayObject');
$.Class('$.Dom.Canvas.Text', function($that) {

  $that.text = '';
  $that.color = '#000000';
  $that.size = '10px';
  $that.fontFamily = 'sans-serif';
  $that.textAlign = 'start';
  $that.textBaseline = 'alphabetic';
  $that.strokeWidth = 2;
  $that.strokeColor = '#FFFFFF';


  /**
   * Canvas image constructor
   * @param options
   * @private
   */
  this.__construct = function (text, options) {
    $that.text = text;
    _loadOptions.call(this, options || {});
  };

  this.display = function () {
    _initTextDefault.call(this);
    var context = $that.canvas.getContext();
    this.parentCall('display');
    context.font = $that.size + ' ' + $that.fontFamily;
    context.textAlign = $that.textAlign;
    context.textBaseline = $that.textBaseline;
    console.log($that.color);

    if (parseInt($that.strokeWidth) > 0) {
      context.fillStyle = $that.strokeColor;
      context.strokeStyle = $that.color;
      context.strokeText($that.text, $that.x, $that.y);
    } else {
      context.fillStyle = $that.color;
      context.fillText($that.text, $that.x, $that.y);
    }
    return this;
  };

  /**
   * Set text size
   * @param text
   * @returns {*}
   */
  this.setSize = function (size) {
    $that.size = size;
    return this;
  };

  /**
   * Get text size
   * @returns {string}
   */
  this.getSize = function () {
    return $that.size;
  };

  /**
   * Set text content
   * @param text
   * @returns {*}
   */
  this.setText = function (text) {
    $that.text = text;
    return this;
  };

  /**
   * Get text content
   * @returns {string}
   */
  this.getText = function () {
    return $that.text;
  };

  return

  function _initTextDefault() {
    $that.canvas.getContext().font = '10px sans-serif';
    $that.canvas.getContext().textAlign = 'start';
    $that.canvas.getContext().textBaseline = 'alphabetic';
    return this;
  }

  /**
   * Load image options
   * @param options
   * @private
   * @returns $.Dom.Canvas.Image
   */
  function _loadOptions (options) {
    $that.color = options.color || $that.color;
    $that.size = options.size || $that.size;
    return this;
  }

}).Extend('$.Dom.Canvas.DisplayObject');
})(window.$);