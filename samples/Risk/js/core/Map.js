$.Class('core.Map', function (that) {
    var _aStateList = {}, _aContinentList = {};

    this.__construct = function (w, h) {
        this.parentCall("__construct", w, h);

        that.initMap(aMapData);
    };

    that.initMap = (function (oMap) {
        that.initStates(oMap.countries);
        that.initNeighbours(oMap.neighbours);
        that.initContinents(oMap.continents);
        that.initGraphics(oMap.graphics);

        // Style

        if ($.isUndefined(oMap.style)) {
            oMap.style = {};
        }

        oMap.style.translateX = oMap.style.translateX || 0;
        oMap.style.translateY = oMap.style.translateY || 0;

        this.setAttribute("transform", "translate(" + oMap.style.translateX + "," + oMap.style.translateY + ") scale(" + oMap.style.scaleX + "," + oMap.style.scaleY + ")");

        var oFilterList = $.Load("$.Dom.Svg.Defs.Filter.FilterList");

        oFilterList.addFilter($.Load("$.Dom.Svg.Defs.Filter.GaussianBlur", "SourceAlpha", "4"));
        //oFilterList.addFilter($.Load("$.Dom.Svg.Defs.Filter.ColorMatrix", "matrix", "0 0 0 0 1, 0 0 0 0 1, 0 0 0 0 1, 0 0 0 1 0"));

        var oFilterMerge = $.Load("$.Dom.Svg.Defs.Filter.Merge");
        oFilterMerge.addNode($.Load("$.Dom.Svg.Defs.Filter.Merge.Node"));
        oFilterMerge.addNode($.Load("$.Dom.Svg.Defs.Filter.Merge.Node", {"in": "SourceGraphic"}));

        oFilterList.addFilter(oFilterMerge);

        this.attachFilter(oFilterList);

    }).bind(this);

    that.initContinents = (function (aContinentNameList) {
        $.each(aContinentNameList, function (aData, sKey) {
            _aContinentList[sKey] = $.Load("core.Map.Continent", aData, sKey);
            $.each(aData.states, function (sStateLabel) {
                _aContinentList[sKey].addState(_aStateList[sStateLabel]);
            }, this);
            this.appendChild(_aContinentList[sKey]);
        }, this);
    }).bind(this);

    that.initStates = (function (aStateList) {
        $.each(aStateList, function (aData, sKey) {
            _aStateList[sKey] = $.Load("core.Map.State", aData, sKey);
        }, this);
    }).bind(this);

    /**
     * Initialize neighbours for each state
     * @param aNeighbourNameList
     */
    that.initNeighbours = (function (aNeighbourNameList) {
        $.each(_aStateList, function (oState, sKey) {
            if ($.isArray(aNeighbourNameList[oState.getLabel()])) {
                $.each(aNeighbourNameList[oState.getLabel()], function (sNeighbourLabel) {
                    oState.addNeighbour(_aStateList[sNeighbourLabel]);
                });
            }
        });
    }).bind(this);

    that.initGraphics = (function(graphicsData) {
        var graphics = $.Load("core.Map.Graphics");

        if (graphicsData.links) {
            $.each(graphicsData.links, graphics.addLink, graphics);
        }

        this.appendChild(graphics);
    }).bind(this);


    this.getStates = function () {
        return _aStateList;
    };

}, true).Extend('$.Dom.Svg.Group');