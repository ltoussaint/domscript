$.Class('core.Map.State.Soldiers', function (that) {

    that.linkedState = null;

    var circle;
    var text;

    this.__construct = function (state) {
        this.parentCall('__construct');
        that.linkedState = state;

        createCircle.call(this);
        createText.call(this);
        initEvents.call(this);
    };

    this.hide = function () {
        this.addStyle('display', 'none');
        return this;
    };

    this.display = function () {
        this.addStyle('display', null);
        return this;
    };

    this.reload = function () {
        text.text(that.linkedState.getNbSoldiers());
        return this;
    };

    function createCircle() {
        var box = that.linkedState.getDomElement().getBBox();
        circle = $.Load(
            '$.Dom.Svg.Circle',
            box.x + (box.width ) / 2,
            box.y + (box.height) / 2,
            10
        );

        circle.setAttribute('fill', that.linkedState.getOwnedPlayer().getColor());
        circle.setAttribute('z-index', 99999999);
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '1');

        this.appendChild(circle);
    }

    function createText() {
        var box = that.linkedState.getDomElement().getBBox();

        text = $.Load(
            '$.Dom.Svg.Text',
            '0',
            box.x + (box.width ) / 2,
            box.y + (box.height) / 2 + 5,
            {
                'text-anchor': 'middle',
                'style': 'font-size: 12px; font-weight: bold;'
            }
        );

        this.appendChild(text);
    }

    function initEvents() {
        $.addEvent(document, 'displaySoldiersOff', this.hide, this);
        $.addEvent(document, 'displaySoldiersOn', this.display, this);

        this.addEvent('click', eventClick, this);
    }

    function eventClick() {
        that.linkedState.getOwnedPlayer().toggle();
    }

}).Extend('$.Dom.Svg.Group');