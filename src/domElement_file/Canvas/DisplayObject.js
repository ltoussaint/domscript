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