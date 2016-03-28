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
