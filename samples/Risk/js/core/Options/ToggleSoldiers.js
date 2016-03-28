$.Class('core.Options.ToggleSoldiers', function(that) {

    that.displayLabel = 'Display soldiers';
    that.checked = false;
    that.name = 'displaySoldiers';

    this.__construct = function() {
        this.parentCall('__construct');
    };

}).Extend('core.Options.AbstractToggle');