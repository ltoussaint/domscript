$.Class('core.Stage', function (that) {
    var _oMap;

    that.__container = $.Load('$.Dom.Body');

    this.__construct = function (w, h) {
        this.parentCall("__construct", w, h);
        this.addStyle("background-color", "#98b3cb");
        this.loadMap();
    };

    this.loadMap = function () {
        _oMap = $.Load(
            "core.Map"
        );

        this.appendChild(_oMap);
    };

    this.getMap = function () {
        return _oMap;
    };


}).Extend('$.Dom.Svg');