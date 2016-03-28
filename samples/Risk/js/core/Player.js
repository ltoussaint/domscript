$.Class('core.Player', function (that) {

    that.isSelected = false;
    that.name = '';
    that.color = '';
    that.stateList = [];
    that.nbTotalSoldier = 0;
    that.nbRemainingSoldier = 0;
    that.isCurrentPlayer = false;

    that.__template =
        '<span class="playerIcon" style="background-color:<%=$that.color%>"></span>' +
        '<span><%=$that.name%></span>' +
        '<span class="playerNbStates"><%=$this.getNbStates()%></span>' +
        '<span class="playerNbSoldiers"><%=$that.nbTotalSoldier%></span>';

    this.__construct = function (sName, sColor, nbSoldiers) {

        this.parentCall('__construct', 'li');
        that.name = sName;
        that.color = sColor;
        that.nbTotalSoldier = that.nbRemainingSoldier = nbSoldiers;

        initEvent.call(this);
    };

    this.addState = function (oState) {
        that.stateList.push(oState);
        this.reloadTemplate();

        return this;
    };

    this.getNbStates = function () {
        return that.stateList.length;
    };

    this.getNbTotalSoldiers = function () {
        return that.nbTotalSoldier;
    };

    this.getNbRemainingSoldiers = function () {
        return that.nbRemainingSoldier;
    };

    this.getStates = function () {
        return that.stateList;
    };

    this.getName = function () {
        return that.name;
    };

    this.getColor = function () {
        return that.color;
    };

    this.setCurrentPlayer = function () {
        that.isCurrentPlayer = true;
        this.addCss({
            "border-color": '#000'
        });
        return this;
    };

    this.isCurrentPlayer = function () {
        return that.isCurrentPlayer;
    };

    this.highlightStates = function () {
        $.each(that.stateList, function (state) {
            state.highlight();
        }, this);
        return this;
    };

    this.unhighlightStates = function () {
        $.each(that.stateList, function (state) {
            state.unhighlight();
        }, this);
        return this;
    };

    this.toggle = function () {
        that.isSelected ? this.unselect() : this.select();
        return this;
    };

    this.select = function () {
        $.triggerEvent(document, "selectPlayer", {player: this});
        selectCurrentPlayer.call(this);
        return this;
    };

    this.unselect = function () {
        $.triggerEvent(document, "unselectPlayer", {player: this});
        unselectCurrentPlayer.call(this);
        return this;
    };

    /**
     * All action when current player is selected
     */
    function selectCurrentPlayer () {
        that.isSelected = true;
        this.highlightStates();
        this.addClass('selected');
    }

    /**
     * All action when current player is unselected
     */
    function unselectCurrentPlayer () {
        that.isSelected = false;
        this.unhighlightStates();
        this.removeClass('selected');
    }

    function initEvent () {
        this.addEvent('click', eventClick, this);
        $.addEvent(document, 'selectPlayer', eventSelect, this); // Catch when another player is selected
        $.addEvent(document, 'selectState', unselectCurrentPlayer, this); // Catch when another element is selected
        $.addEvent(document, 'addSoldiersToState', enventAddSoldiersToState, this); // Catch when another element is selected
    }

    /**
     * Handler when we click no the player
     */
    function eventClick() {
        if (that.isSelected) {
            this.unselect();
        } else {
            this.select();
        }
    }

    /**
     * If another player is selected, unselect current one
     * @param event
     * @param data
     */
    function eventSelect(event, data) {
        if (data.player.__instanceId !== this.__instanceId) {
            unselectCurrentPlayer.call(this);
        }
    }

    function enventAddSoldiersToState(event, data) {
        if (data.player.__instanceId === this.__instanceId) {
            that.nbRemainingSoldier -= data.number;
            data.state.addSoldiers(data.number);
        }
    }



}).Extend('$.Dom.Element');