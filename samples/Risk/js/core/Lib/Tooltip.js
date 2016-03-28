$.Class('core.Lib.Tooltip', function (that) {

    that.__container = $.Load('$.Dom.Body');

    var isIn = false;
    var timeout;

    this.__construct = function () {
        this.parentCall("__construct", "div");
        window.document.body.appendChild(this.getDomElement());
        initStyle.call(this);
    };

    this.add = function($domElement, text, delay) {
        $domElement.addEvent("mouseover", (function (oEvent) {
            isIn = true;
            timeout = setTimeout((function() {
                this.display(text, oEvent.clientX, oEvent.clientY);
            }).bind(this), delay);
        }).bind(this));


        $domElement.addEvent("mouseout", (function (oEvent) {
            isIn = false;
            clearTimeout(timeout);
            this.hide();
        }).bind(this));
    };






    this.display = function(text, clientX, clientY) {
        this.text(text);
        setPosition.call(this, clientX, clientY);
        this.addStyle('display', 'block');
    };

    this.hide = function() {
        this.addStyle('display', 'none');
    };

    function initStyle() {
        this.addCss({
            position: 'fixed',
            'background-color': 'rgba(0, 0, 0, 0.4)',
            color: '#EEE',
            padding: '4px',
            'border-radius': '4px'

        });
    }

    function setPosition(clientX, clientY) {
        this.addCss({
            left: clientX + 'px',
            top: clientY + 'px'
        });
    }

}, true).Extend('$.Dom.Element');
