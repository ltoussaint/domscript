/********************************************************************************/
/**                                                                            **/
/**                               Dom functions                                **/
/**                                                                            **/
/********************************************************************************/

var _aMatchAttributes = {
    "for" : "htmlFor",
    "class" : "className",
    "readonly" : "readOnly",
    "maxlength" : "maxLength",
    "cellspacing" : "cellSpacing",
    "rowspan" : "rowSpan",
    "colspan" : "colSpan",
    "tabindex" : "tabIndex"
};

/**
 * Get the value of an attribute
 * @param domElement
 * @param sName
 */
$.getAttribute = function(domElement, sName) {
    var sProperty = _aMatchAttributes[sName] || sName;

    return domElement[sProperty] && sName !== "style" ? domElement[sProperty] : domElement.getAttribute(sName);
};

/**
 * Set the value of an attribute
 * @param domElement
 * @param sName
 * @param sValue
 */
$.setAttribute = function(domElement, sName, sValue) {
    var sProperty = _aMatchAttributes[sName] || sName;

    if (domElement[sProperty] && sName !== "style") {
        domElement[sProperty] = sValue;
    } else {
        domElement.setAttribute(sName, sValue);
    }
};

$.addClass = function(domElement, sClassName) {
    domElement.className = $.ltrim(domElement.className.concat(' ', sClassName));
    return $;
};

$.removeClass = function(domElement, sClassName) {
    domElement.className = domElement.className.replace(
        new RegExp('\\b'.concat(sClassName, '\\b'), 'g'), '').trim();
    return $;
};

$.hasClass = function(domElement, sClassName) {
    return domElement.className.match(new RegExp('\\b'.concat(sClassName, '\\b'))) !== null;
};

$.addStyle = function(domElement, sName, mValue) {
    domElement.style[$.formatCssKey(sName)] = mValue;
    return $;
};

$.formatCssKey = function(sName) {
    var oRegExp = new RegExp('-([a-z])', 'i');
    sName = sName.replace(oRegExp, function(sMatch, sData, iPos) {
        return sData.toUpperCase();
    });
    return sName;
};

$.addCss = function(domElement, oCss) {
    if ($.isObject(oCss)) {
        $.each(oCss, function(sValue, sName) {
            $.addStyle(domElement, sName, sValue);
        });
    }
};