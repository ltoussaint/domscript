$.Class('core.Menu.Information', function (that) {

    that.selectedState = null;
    that.selectedPlayer = null;

    var defaultTemplate = '<div class="title">Infos</div>';

    var stateTemplate =
        '<div class="title"><%=$that.selectedState.getName()%></div>' +
            '<div class="item">' +
                '<span class="label">Continent</span>' +
                '<span class="value"><%=$that.selectedState.getContinent().getName()%></span>' +
            '</div>' +
            '<div class="item">' +
                '<span class="label">Player</span>' +
                '<span class="value"><%=$that.selectedState.getOwnedPlayer().getName()%></span>' +
            '</div>' +
            '<div class="item">' +
                '<span class="label">Soldiers</span>' +
                '<span class="value"><%=$that.selectedState.getNbSoldiers()%></span>' +
            '</div>' +
            '<div class="item">' +
                '<% var neighbors = $that.selectedState.getNeighbors();%>' +
                '<span class="label labelLong">Neighbors (<%=$that.selectedState.getNbNeighbors()%>)</span>' +
                '<ul>' +
                    '<% for (var i in neighbors) { %>' +
                    '<li><%=neighbors[i].getName()%></li>' +
                    '<% } %>' +
                '</ul>' +
            '</div>' +
        '</div>';

    var playerTemplate =
        '<div class="title"><%=$that.selectedPlayer.getName()%></div>' +
            '<div class="item">' +
                '<span class="label">Name</span>' +
                '<span class="value"><%=$that.selectedPlayer.getName()%></span>' +
            '</div>' +
            '<div class="item">' +
                '<span class="label">Soldiers</span>' +
                '<span class="value"><%=$that.selectedPlayer.getNbTotalSoldiers()%></span>' +
            '</div>' +
            '<div class="item">' +
                '<span class="label labelLong">States (<%=$that.selectedPlayer.getNbStates()%>)</span>' +
                '<ul>' +
                    '<% var states = $that.selectedPlayer.getStates(); for (var i in states) { %>' +
                    '<li><%=states[i].getName()%></li>' +
                    '<% } %>' +
                '</ul>' +
            '</div>' +
        '</div>';


    that.__template = defaultTemplate;

    this.__construct = function() {
        this.parentCall('__construct', 'div');
        this
            .setAttribute('id', 'menuInfo')
            .addClass('menuItem');

        initEvent.call(this);
    };

    function initEvent() {
        $.addEvent(document, "selectPlayer", eventSelectPlayer, this);
        $.addEvent(document, "selectState", eventSelectState, this);
        $.addEvent(document, "unselectPlayer", eventUnselect, this);
        $.addEvent(document, "unselectState", eventUnselect, this);
    }

    function eventSelectPlayer (event, data) {
        that.selectedState = null;
        that.selectedPlayer = data.player;
        that.__template = playerTemplate;
        this.reloadTemplate();
    }

    function eventSelectState (event, data) {
        that.selectedState = data.state;
        that.selectedPlayer = null;
        that.__template = stateTemplate;
        this.reloadTemplate();
    }

    function eventUnselect (event, data) {
        that.selectedState = null;
        that.selectedPlayer = null;
        that.__template = defaultTemplate;
        this.reloadTemplate();
    }

}).Extend('$.Dom.Element');