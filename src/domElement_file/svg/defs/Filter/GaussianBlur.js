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
