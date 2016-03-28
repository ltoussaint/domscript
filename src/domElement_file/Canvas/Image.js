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