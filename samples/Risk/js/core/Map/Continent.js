$.Class('core.Map.Continent', function (that) {

    that.sColor = '';
    that.sName = '';
    that.sLabel = '';
    that.aStateList = {};


    this.__construct = function (oData, sLabel) {
        that.sName = oData.name;
        that.sColor = oData.color;
        that.sLabel = sLabel;

        this.parentCall('__construct');

        this.setAttribute("fill", that.sColor);
        this.setAttribute("stroke", "#000");
    };

    this.addState = function (oState) {
        oState.setContinent(this);
        that.aStateList[oState.getName()] = oState;
        this.appendChild(oState);
        return this;
    };

    this.getName = function() {
        return that.sName;
    };

    this.getLabel = function() {
        return that.sLabel;
    };

    this.getColor = function() {
        return that.sColor;
    };

}).Extend('$.Dom.Svg.Group');