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
$.Class('$.Creative.Stage', function ($that) {

    this.__construct = function (w, h) {
        this.parentCall('__construct', w, h);
    };

}).Extend('$.Dom.Svg');

})(window.$);