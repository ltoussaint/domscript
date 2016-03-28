$.Class('$.Dom.Svg.Defs.ClipPath', function(that) {
	var _this = this;

	this.__construct = function(){
		this.parentCall("__construct", "clipPath");
	};


	this.addPath = function(oPath){
		this.appendChild(oPath);
	};

	that.createId = function() {
		var sId = "fi" + (iFilterIdInc++);

		_this.setAttribute("id", sId);

		return sId;
	};

}).Extend('$.Dom.Svg.Abstract');
