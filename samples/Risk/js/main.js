$.Class("main", function () {
    var oGame;

    this.__construct = function () {
        oGame = $.Load("core.Game");
    };
});

oMain = $.Load('main');