var iFilterIdInc = 1;

$.Class('$.Dom.Svg.Defs.Filter.Abstract', function(that) {
	var _this = this;




	this.createId = function() {
		var sId = "fi" + (iFilterIdInc++);

		_this.setAttribute("id", sId);

		return sId;
	};

}).Extend('$.Dom.Svg.Abstract');
