$.Class('core.Menu', function (that) {

    that.__container = $.Load('$.Dom.Body');

    this.__construct = function (aPlayerList) {
        this.parentCall("__construct", "div");
        that.aPlayerList = aPlayerList;

        that.initUI.apply(this);
        this.appendChild($.Load('core.Menu.Players', aPlayerList));
        this.appendChild($.Load('core.Menu.Information'));
    };

    that.initUI = function () {
        this.addCss({
            "width": "250px",
            "height": "100%",
            "background-color": "#98B3CB",
            "float": "left"
        });
    };

}).Extend('$.Dom.Element');
