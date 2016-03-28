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
