(function () {

    var _extent = function (series, field) {
        var maxs = [], mins = [];
        _.each(series, function (d) {
            if(!d.data.length) return;
            var values = _.pluck(d.data, field);
            maxs.push(d3.max(values));
            mins.push(d3.min(values));
        });

        //
        if(!mins.length || !maxs.length) return [];

        return [_.min(mins), _.max(maxs)];
    };


    var _stackedExtent = function (data) {
        var dataSets = _.pluck(data, 'data');
        var maxLength = _.max(_.map(dataSets, function (d) { return d.length; }));
        var stackY = [];

        for (var j=0; j<maxLength; j++) {
            _.each(dataSets, function (set) {
                stackY[j] = set[j] ? (stackY[j] || 0) + set[j].y : (stackY[j] || 0);
            });
        }

        return [_.min(stackY), _.max(stackY)];
    };

    var _xExtent = _.partialRight(_extent, 'x');
    var _yExtent = _.partialRight(_extent, 'y');

    function VisInstanceContainer(data, options, type, renderer, context) {
        this.type = type;
        this.renderer = renderer;
        this.ctx = context;

        this.init(data, options);
    }

    VisInstanceContainer.prototype = {

        init: function (data, options) {
            // set the options first and then the data
            this.setOptions(options);
            this.setData(data);
        },

        render: function (layer, options) {
            this.renderer.call(this.ctx, this.data, layer, options);

            return this.ctx;
        },

        setData: function (data) {
            this.data = _.nw.normalizeSeries(data);
            this._updateDomain();

            return this.ctx;
        },

        setOptions: function (options) {
            var opt = {};
            opt[this.type] = options || {};
            this.options = {};
            this.options = _.merge({}, this.renderer.defaults || {}, opt);

            return this.ctx;
        },

        _updateDomain: function () {
            if(!this.options[this.type]) throw new Error('Set the options before calling setData or _updateDomain');

            if (_.nw.isSupportedDataFormat(this.data)) {
                this.xDomain = _.flatten(_.map(this.data, function (set) { return _.pluck(set.data, 'x'); }));
                this.xExtent = _xExtent(this.data, 'x');
                this.yExtent = this.options[this.type].stacked ? _stackedExtent(this.data) : _yExtent(this.data);
            }
        }

    };

    Contour.VisualizationContainer = VisInstanceContainer;

})();
