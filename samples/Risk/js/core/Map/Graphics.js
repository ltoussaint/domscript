$.Class('core.Map.Graphics', function (that) {


    this.addLink = function (points) {
        var line = $.Load('$.Dom.Svg.Polyline', points);
        line.setAttribute('fill', 'none');
        line.setAttribute('fill-rule', 'evenodd');
        line.setAttribute('stroke', '#000');
        line.setAttribute('stroke-width', '1');
        line.setAttribute('stroke-linecap', 'butt');
        line.setAttribute('stroke-linejoin', 'miter');
        line.setAttribute('stroke-miterlimit', '4');
        line.setAttribute('stroke-dasharray', '4 1');
        line.setAttribute('stroke-dashoffset', '0');
        this.appendChild(line);
        return this;
    };

}).Extend('$.Dom.Svg.Group');