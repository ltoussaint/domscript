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