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