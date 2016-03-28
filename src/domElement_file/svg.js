$.Class('$.Dom.Svg', function (that) {
    var _this = this;

    var _NS = "http://www.w3.org/2000/svg";

    // Included objects
    that.oDefs = null;

    this.__construct = function (w, h) {
        this.parentCall("__construct", 'svg', _NS);

        if (w && h) {
            this.setHeight(h);
            this.setWidth(w);
        }
        this.setAttribute('xmlns', _NS);

    };

    this.setHeight = function(size) {
        this.setAttribute("height", size);
        if (/^[0-9]+$/.exec(size)) {
            size = size + 'px';
        }
        this.addStyle("height", size);
    };

    this.setWidth = function(size) {
        this.setAttribute("width", size);
        if (/^[0-9]+$/.exec(size)) {
            size = size + 'px';
        }
        this.addStyle("width", size);
    };

    this.getAttribute = function (sName) {
        return $.getAttribute(that.domElement, sName);
    };

    this.setAttribute = function (sName, sValue) {
        return $.setAttribute(that.domElement, sName, sValue);
    };


    function _initOptions(oOptions) {
        var aStyleAttributes = ["height", "width"];

        _this.setAttribute('xmlns', _NS);
        _this.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");

        _this.setAttribute('version', "1.2");

        if (!$.isUndefined(oOptions)) {
            oOptions.each(function (sKey, sValue) {
                if (aStyleAttributes.inArray(sKey)) {
                    _this.addStyle(sKey, sValue);
                }

                _this.setAttribute(sKey, sValue);

            });
        }
    }

    this.attachFilter = function (oFilter) {
        if (null === that.oDefs) {
            that.oDefs = document.createElementNS(_NS, "defs");
            that.domElement.appendChild(that.oDefs);
        }

        that.oDefs.appendChild(oFilter.getDomElement());
    };

    this.appendChild = function (oDomElement) {
        oDomElement.setOwnerSvg(this);

        that.domElement.appendChild(oDomElement.getDomElement());
    };


}).Extend('$.Dom.Element');