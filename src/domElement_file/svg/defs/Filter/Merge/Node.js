$.Class('$.Dom.Svg.Defs.Filter.Merge.Node', function(that) {
	var _this = this, _sType, _sValue;

	this.__construct = function(oOptions) {
		this.parentCall("__construct", 'feMergeNode');

		that._initOptions(oOptions);
	};

	this.addNode = function(oNode) {
		this.appendChild(oNode);
	};


}).Extend('$.Dom.Svg.Defs.Filter.Abstract');
