$.Class('core.Menu.Players', function (that) {

    that.playerList = null;

    this.__construct = function(playerList) {
        this.parentCall('__construct', 'ul');

        that.playerList = playerList;

        this.setAttribute("id", "playerList");
        this.addClass("menuItem");

        initPlayers.call(this);
    };

    function initPlayers() {
        $.each(that.playerList, function (oPlayer) {
            this.appendChild(oPlayer);
        }, this);

    }

}).Extend('$.Dom.Element');