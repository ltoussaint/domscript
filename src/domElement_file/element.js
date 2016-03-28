var cacheMicroTemplate = {};

var
    ELEMENT_NODE = 1,
    ATTRIBUTE_NODE = 2,
    TEXT_NODE = 3,
    CDATA_SECTION_NODE = 4,
    ENTITY_REFERENCE_NODE = 5,
    ENTITY_NODE = 6,
    PROCESSING_INSTRUCTION_NODE = 7,
    COMMENT_NODE = 8,
    DOCUMENT_NODE = 9,
    DOCUMENT_TYPE_NODE = 10,
    DOCUMENT_FRAGMENT_NODE = 11,
    NOTATION_NODE = 12;

$.Class('$.Dom.Element', function (that) {
    that.__id = null;
    that.__container = null;
    that.__template = null;
    that.__class = null;

    this.__construct = function (sTagName, sNS) {

        // Create the DOM Element
        if ($.isString(sTagName)) {
            // If element id given
            if (0 === sTagName.indexOf('#')) {
                that.domElement = document.getElementById(sTagName.substring(1));
                if (null == that.domElement) {
                    throw new Error('Element with specified id not found : ' + sTagName);
                }
            }
            else if (!$.isUndefined(sNS)) {
                that.domElement = document.createElementNS(sNS, sTagName.toLowerCase());
            }
            else {
                that.domElement = document.createElement(sTagName.toLowerCase());
            }
        } else if (!$.isUndefined(sTagName)) {
            that.domElement = sTagName;
        }
        else {
            that.domElement = document.createElement('div');
        }

        // Check micro template
        if (!$.isNull(that.__template)) {
            loadMicroTemplate.call(this);
        }

        // Check attributes
        if (!$.isNull(that.__id)) {
            that.domElement.setAttribute('id', that.__id);
        }
        if (!$.isNull(that.__class)) {
            that.domElement.className = that.__class;
        }

        // Check container
        if (!$.isNull(that.__container)) {
            if (that.__container.isDomScript) {
                that.__container.appendChild(this);
            } else {
                var $el = $.Load('$.Dom.Element', that.__container);
                $el.appendChild(this);
            }
        }

        return this;
    };

    this.getDomElementFromTemplate = function () {
        var templateContent = this.getTemplateContent();
        var regExp = new RegExp("^[ \t\r\n\v\f]*<([a-z]+)[^>]*>(.*)</\\1>", "im");
        var match = regExp.exec(templateContent);

        if (null != match) {
            that.domElement = document.createElement(match[1]);
            that.domContent = match[2];

            this.reloadContent();
        } else {
            //this.reloadContent();
            throw Error("Can't parse microtemplate");
        }
    };

    this.getTemplateContent = function () {
        if (0 === that.__template.indexOf('<')) {
            return that.__template;
        } else {
            try {
                return document.getElementById(that.__template).innerHTML;
            } catch (e) {
                throw Error("Can't find microTemplate with id " + that.__template);
            }
        }
    };

    this.getAttribute = function (sName) {
        return $.getAttribute(that.domElement, sName);
    };

    this.setAttribute = function (sName, sValue) {
        $.setAttribute(that.domElement, sName, sValue);
        return this;
    };

    this.onClick = function (fnCallback) {
        if ($.isFunction(fnCallback)) {
            this.addEvent("click", fnCallback);
            return this;
        }
        else {
            throw new Exception('Onclick need callback function as first parameter.');
        }
    };

    this.html = function (sHtml) {
        that.domElement.innerHTML = sHtml;
    };

    this.text = function (sText) {
        that.domElement.textContent = sText;
    };

    this.reloadTemplate = function () {
        if (!$.isNull(that.__template)) {
            loadMicroTemplate.call(this);
        }
    };


    function loadMicroTemplate() {
        var templateCompiled = $.template(that.__template);
        this.html(templateCompiled({$this: this, $that: that}));
    }

}).Extend('$.Dom.Abstract');