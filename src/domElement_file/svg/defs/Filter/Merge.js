$.Class('$.Dom.Svg.Defs.Filter.Merge', function(that) {
	var _this = this, _sType, _sValue;

	this.__construct = function() {
		this.parentCall("__construct", 'feMerge');
	};

	this.addNode = function(oNode) {
		this.appendChild(oNode);
	};


}).Extend('$.Dom.Svg.Defs.Filter.Abstract');
