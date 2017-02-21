'use strict';

var DEFAULT_CONFIG = {
    root: null,
    grid: {
        padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    },
    axis: [{
            min: 'auto',
            max: 'auto',
            calc: 'add',
            size: 400
        },
        {
            min: 'auto',
            max: 'auto',
            calc: 'add',
            size: 400
        }
    ],
    width: 400,
    height: 400,
    margin: {
        top: 20,
        right: 20,
        bottom: 25,
        left: 25
    },
    type: 'line',
    color: {
        stroke: "#000"
    },
    animation: {
        show: true,
        time: 1000,
        type: 'easeLinear'
    }
};

class chartit {

    constructor(config) {
        var config = this.mergeDeep(DEFAULT_CONFIG, config);
        this.config = config;
        this.data = [];
    }

    draw(data) {
        this.data = data;
        this.ranges = this.ranges();
        this.container = d3.select(this.config.root).append("svg")
            .attr("width", this.config.width + this.config.margin.left + this.config.margin.right)
            .attr("height", this.config.height + this.config.margin.top + this.config.margin.bottom);
        this.drawAxis();
        this.config.anim = d3.transition()
            .duration(this.config.animation.time)
            .ease(d3[this.config.animation.type])
            .on("start", function (d) { //EVENT 
            })
            .on("end", function (d) { //EVENT
            });
        if (this.config.type === 'line') {
            this.drawLines();
        }
    }

    drawLines() {
        var self = this;
        for (var j = 0; j < self.data.length; j++) {
            var x = self.ranges[0].axis;
            var y = self.ranges[1].axis;
            var line = d3.line()
                /*
                Multiple DataRows > 2
                for(var i=0;i<this.this.data[j][k].length;i++){
                    line.
                }*/
                .x(function (d, i) {
                    return x(d[0]) + self.config.margin.left;
                })
                .y(function (d) {
                    return y(d[1]) + self.config.margin.bottom;
                });
            var item = self.data[j];
            self.container
                .append("svg:path")
                .attr("fill", "none")
                .attr("stroke", self.config.color.stroke)
                .attr("d", line(item)).classed("line", true)
                .attr("stroke-dasharray", function (d) {
                    return this.getTotalLength()
                })
                .attr("stroke-dashoffset", function (d) {
                    return this.getTotalLength()
                });
        }
        self.container.selectAll(".line").transition(this.config.anim)
            .attr("stroke-dashoffset", 0);
    }

    drawAxis() {
        //TODO Minus Offset
        var svgContainer = this.container;
        for (var i = 0; i < this.ranges.length; i++) {
            switch (i) {
                case 0:
                    var axisScale = d3.scaleLinear()
                        .domain([this.ranges[i].min, this.ranges[i].max])
                        .range([this.ranges[i].min, this.config.axis[i].size]);
                    var axis = d3.axisBottom()
                        .scale(axisScale);
                    var AxisGroup = svgContainer
                        .append("g").attr("class", "x axis")
                        .attr("transform", "translate(" + this.config.margin.left + "," + (this.config.axis[i].size + this.config.margin.right) + ")")
                        .call(axis);
                    break;
                case 1:
                    var axisScale = d3.scaleLinear()
                        .domain([this.ranges[i].max, this.ranges[i].min])
                        .range([this.ranges[i].min, this.config.axis[i].size]);
                    var axis = d3.axisLeft()
                        .scale(axisScale);
                    var AxisGroup = svgContainer
                        .append("g").attr("class", "x axis")
                        .attr("transform", "translate(" + this.config.margin.left + "," + (this.config.margin.top) + ")")
                        .call(axis);
                    break;
                    //TODO
                case 2:
                    var axisScale = d3.scaleLinear()
                        .domain([this.ranges[i].min, this.ranges[i].max])
                        .range([this.ranges[i].min, this.config.axis[i].size]);
                    var axis = d3.axisRight()
                        .scale(axisScale);
                    var AxisGroup = svgContainer
                        .append("g").attr("class", "x axis")
                        .attr("transform", "translate(0," + this.config.axis[i].size + ")")
                        .call(axis);
                    break;
                case 3:
                    var axisScale = d3.scaleLinear()
                        .domain([this.ranges[i].min, this.ranges[i].max])
                        .range([this.ranges[i].min, this.config.axis[i].size]);
                    var axis = d3.axisTop()
                        .scale(axisScale);
                    var AxisGroup = svgContainer
                        .append("g").attr("class", "x axis")
                        .attr("transform", "translate(0,0)")
                        .call(axis);
                    break;
            }
            this.ranges[i].axis = axisScale;
        }
    }

    ranges() {
        var ranges = [];
        for (var i = 0; i < this.config.axis.length; i++) {
            var min = this.config.axis[i].min;
            var max = this.config.axis[i].max;
            if (min === 'auto' || max === 'auto') {
                for (var j = 0; j < this.data.length; j++) {
                    for (var k = 0; k < this.data[j].length; k++) {
                        var item = this.data[j][k][i];
                        if (min === 'auto' && max === 'auto') {
                            max = item
                        } else {
                            if (min === 'auto') {
                                if (max < item) {
                                    min = max;
                                    max = item;
                                } else {
                                    min = item;
                                }
                            } else {
                                if (item < min) {
                                    min = item;
                                }
                            }
                            if (max === 'auto') {
                                max = item;
                            } else {
                                if (item > max) {
                                    max = item;
                                }
                            }
                        }
                    }
                }
            }
            var axisRange = {
                min: min,
                max: max
            };
            if (this.config.axis[i].calc === 'add') {
                axisRange = this.addToRange(axisRange);
            }
            ranges.push(axisRange);
        }
        return ranges;
    }

    addToRange(axisRange) {
        var minlength = axisRange.min.toString().length;
        var minzeroes = Math.pow(10, minlength);
        var minadd = minzeroes / 10;
        var minnew = Math.round((axisRange.min - minadd) / (minzeroes / 10)) * (minzeroes / 10);
        if (axisRange.min >= 0) {
            if (minnew < 0 && minlength === 1) {
                minnew = 0;
            }
        }
        var maxlength = axisRange.max.toString().length;
        var maxzeroes = Math.pow(10, maxlength);
        var maxadd = maxzeroes / 10;
        var maxnew = Math.round((axisRange.max + maxadd) / (maxzeroes / 10)) * (maxzeroes / 10);
        if (axisRange.max >= 0) {
            if (maxnew < 0 && maxlength === 1) {
                maxnnew = 0;
            }
        }
        axisRange.min = minnew;
        axisRange.max = maxnew;
        return axisRange;
    }

    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
    }

    mergeDeep(target, source) {
        let output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, {
                            [key]: source[key]
                        });
                    else
                        output[key] = this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, {
                        [key]: source[key]
                    });
                }
            });
        }
        return output;
    }
}


module.exports = chartit;