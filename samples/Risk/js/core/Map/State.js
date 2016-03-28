$.Class('core.Map.State', function (that) {

    var isSelected = false,
        isHover = false,
        isHighlighted = false,
        color = null,

        oStylePath, // Used for the default style
        oEventPath, // Used for style given by event/state

        soldiers,

        parentContinent,
        ownedPlayer;

    that.neighborList = {};
    that.sName = '';
    that.sLabel = '';
    that.iNbSoldiers = 0;


    this.__construct = function (oData, sLabel) {
        this.parentCall("__construct");

        that.sName = oData.name;
        that.sLabel = sLabel;

        initStylePath.call(this, oData.points);
        initEventPath.call(this, oData.points);

        initEvent.call(this);

        this.setAttribute("fill-opacity", 1);
    };

    this.setContinent = function(continent) {
        parentContinent = continent;
        color = continent.getColor();
        updateColor.call(this);
        return this;
    };

    this.getContinent = function() {
        return parentContinent
    };

    this.setOwnedPlayer = function(player) {
        ownedPlayer = player;
        initSoldiers.call(this);
        return this;
    };

    this.getOwnedPlayer = function() {
        return ownedPlayer;
    };

    this.unselect = function() {
        isSelected = false;
    };

    this.addSoldiers = function (number) {
        that.iNbSoldiers += number;
        soldiers.reload();
    };

    this.getNbSoldiers = function() {
        return that.iNbSoldiers;
    };

    this.addNeighbour = function (oNeighbour) {
        that.neighborList[oNeighbour.getLabel()] = oNeighbour;
        return this;
    };

    this.highlight = function () {
        isHighlighted = true;
        updateColor.call(this);
        return this;
    };

    this.unhighlight = function () {
        isHighlighted = false;
        updateColor.call(this);
        return this;
    };


    this.highlightNeighbours = function () {
        $.each(that.neighborList, function (oNeighbour, sName) {
            oNeighbour.highlight();
        });
        return this;
    };

    this.unhighlightNeighbours = function () {
        $.each(that.neighborList, function (oNeighbour, sName) {
            oNeighbour.unhighlight();
        });
        return this;
    };


    this.getName = function () {
        return that.sName;
    };

    this.getLabel = function () {
        return that.sLabel;
    };

    this.getNeighbors = function() {
        return that.neighborList;
    };

    this.getNbNeighbors = function() {
        return Object.keys(that.neighborList).length;
    };

    function initEvent () {
        var tooltip = $.Load('core.Lib.Tooltip');
        tooltip.add(this, that.sName, 600);

        this.addEvent("click", eventClick, this);
        this.addEvent("mouseover", eventMouseEnter, this);
        this.addEvent("mouseout", eventMouseOut, this);
        $.addEvent(document, "selectState", eventSelectState, this);
        $.addEvent(document, "selectPlayer", unselectCurrentState, this);
    }

    /**
     * Initialize style path link to the state (and its continent)
     */
    function initStylePath(points) {
        oStylePath = $.Load("$.Dom.Svg.Path", points);

        oStylePath.setAttribute("stroke-opacity", 0.2);
        oStylePath.setAttribute("stroke-width", "1px");
        oStylePath.setAttribute("fill", null);
        oStylePath.setAttribute("stroke", null);

        this.appendChild(oStylePath);
        return this;
    }

    /**
     * Initialize event path
     * Include all stuff related with actions
     */
    function initEventPath(points) {
        oEventPath = $.Load("$.Dom.Svg.Path", points);

        oEventPath.addStyle("z-index", "9999");
        oEventPath.setAttribute("fill-opacity", 0.5);

        oEventPath.setAttribute("fill", 'none');
        oEventPath.setAttribute("stroke", 'none');

        this.appendChild(oEventPath);
        return this;
    }

    /**
     * Init soldiers element
     */
    function initSoldiers() {
        soldiers = $.Load('core.Map.State.Soldiers', this);
        $.Load('core.Map').appendChild(soldiers);

    }

    /**
     * MouseEnter event handler
     */
    function eventMouseEnter() {
        isHover = true;
        updateColor.call(this);
    }

    /**
     * MouseOut event handler
     */
    function eventMouseOut() {
        isHover = false;
        updateColor.call(this);
    }

    /**
     * Click event handler
     */
    function eventClick() {
        if (isSelected) {
            $.triggerEvent(document, "unselectState", {state: this});
            unselectCurrentState.call(this);
        }
        else {
            $.triggerEvent(document, "selectState", {state: this});
            selectCurrentState.call(this);
        }
    }

    function eventSelectState(event, data) {
        if (data.state.__instanceId !== this.__instanceId) {
            unselectCurrentState.call(this);
        }
    }

    /**
     * Action when current state is selected
     */
    function selectCurrentState() {
        isSelected = true;
        updateColor.call(this);
        this.highlightNeighbours();
    }

    /**
     * Action when current state is unselected
     */
    function unselectCurrentState() {
        isSelected = false;
        updateColor.call(this);
        this.unhighlightNeighbours();
    }

    /**
     * Update SVG State color
     */
    function updateColor() {
        opacity = 1;
        if (isSelected || isHover) {
            opacity = 0.8;
            newColor = '#FFFFFF';
        } else if (isHighlighted) {
            opacity = 0.4;
            newColor = '#FFFFFF';
        } else {
            newColor = null;
        }
        oEventPath.setAttribute("fill", newColor);
        oEventPath.setAttribute("fill-opacity", opacity);
    }


}).Extend('$.Dom.Svg.Group');
