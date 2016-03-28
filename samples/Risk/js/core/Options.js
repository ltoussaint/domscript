$.Class('core.Options', function (that) {

    var isOpened = false;
    var closedElement;
    var openedElement;

    that.__container = $.Load('$.Dom.Body');

    that.__id = 'options';
    that.__class = 'closed';

    this.__construct = function () {
        this.parentCall("__construct", "div");

        initClosedElement();
        initOpenedElement();
    };

    this.toggle = function() {
        isOpened ? this.close() : this.open();
        return this;
    };

    this.close = function() {
        isOpened = false;
        closedElement.addStyle('display', null);
        openedElement.addStyle('display', 'none');
        this.removeClass('opened').addClass('closed');
    };

    this.open = function() {
        isOpened = true;
        closedElement.addStyle('display', 'none');
        openedElement.addStyle('display', null);
        this.removeClass('closed').addClass('opened');
    };

    var initClosedElement = (function() {
        closedElement = $.Load('$.Dom.Element', 'a');
        closedElement.text('options');
        closedElement.addEvent('click', this.open, this);

        this.appendChild(closedElement);
    }).bind(this);

    var initOpenedElement = (function() {
        openedElement = $.Load('$.Dom.Element', 'div');
        openedElement.addStyle('display', 'none');

        var closeButton = $.Load('$.Dom.Element', 'a');
        closeButton.text('Close options');
        closeButton.addEvent('click', this.close, this);
        openedElement.appendChild(closeButton);

        openedElement.appendChild($.Load('core.Options.ToggleSoldiers'));

        this.appendChild(openedElement);
    }).bind(this);


}).Extend('$.Dom.Element');
