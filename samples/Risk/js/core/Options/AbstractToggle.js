$.Class('core.Options.AbstractToggle', function(that) {

    that.checked = false;
    that.__class = 'optionToggle';

    var input;

    this.__construct = function() {
        this.parentCall('__construct', 'div');

        initUI();
        initEvent();
        initState();
    };

    var initUI = (function() {
        var identifier = 'option' + $.capitalize(that.name);
        input = $.Load('$.Dom.Element', 'input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('id', identifier);
        input.addClass(identifier);

        var label = $.Load('$.Dom.Element', 'label');
        label.addClass('toggle');
        label.setAttribute('for', identifier);

        var button = $.Load('$.Dom.Element', 'span');
        button.addClass('toggle_button');
        label.appendChild(button);

        var displayLabel = $.Load('$.Dom.Element', 'div');
        displayLabel.addClass('optionLabel');
        displayLabel.text(that.displayLabel);


        this.appendChild(input).appendChild(label).appendChild(displayLabel);


    }).bind(this);

    var initState = (function() {
        if (that.checked) {
            input.check();
        } else {
            input.uncheck();
        }
        triggerEvent();
    }).bind(this);

    var initEvent = (function() {
        input.addEvent('change', changeOption, this);
    }).bind(this);

    var changeOption = (function(event) {
        that.checked = event.$domTarget.isChecked();
        triggerEvent();
    }).bind(this);

    var triggerEvent = (function() {
        if (that.checked) {
            $.triggerEvent(document, that.name + 'On');
        } else {
            $.triggerEvent(document, that.name + 'Off');
        }
    }).bind(this);

}).Extend('$.Dom.Element');