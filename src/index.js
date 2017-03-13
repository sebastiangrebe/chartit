'use strict';

var DEFAULT_CONFIG = {
    root: null,
    grid: {
        show: true,
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
    resize: true,
    resizeTimeout: 1000,
    width: null,
    height: null,
    margin: {
        top: 20,
        right: 20,
        bottom: 25,
        left: 25
    },
    type: 'line',
    animation: {
        show: true,
        animate: true,
        time: 1000,
        type: 'easeLinear'
    },
    hooks: {
        animateStart: function (d) {},
        animateEnd: function () {

        }
    }
};

class chartit {

    constructor(config) {
        var ini_config = this.mergeDeep(DEFAULT_CONFIG, config);
        this.config = ini_config;
        this.data = [];
        this.drawn=false;
    }

    draw(data) {
        var self = this;
        if (self.config.animation.show) {
            self.config.anim = d3.transition()
                .duration(self.config.animation.time)
                .ease(d3[self.config.animation.type])
                .on("start", function (d) {
                    self.config.hooks.animateStart(d)
                })
                .on("end", function (d) {
                    self.config.hooks.animateEnd(d)
                });
        }
        self.svg = d3.select(self.config.root).append("svg");
        if (self.config.resize) {
            self.setResizeEvent();
        }
        self.lines = [];
        self.container = self.svg.append("svg:g").attr("transform", "translate(0,0)");

        self.update(data);
        
        self.drawn=true;
    }

    drawDataRow(j){
        var self=this;
        if(self.data[j].type==="line"){
            self.drawLine(j);
            self.drawDot(j);
        }
    }

    drawGrid(){
        var self = this;
        if(self.grid.show){

        }
    }

    getDimensions() {
        var self = this;
        var width;
        var height;
        if (self.config.resize === true) {

            width = document.querySelector(self.config.root).clientWidth;
            height = document.querySelector(self.config.root).clientHeight;

        } else {
            if (self.config.width === null) {
                width = document.querySelector(self.config.root).clientWidth;
            } else {
                width = self.config.width;
            }
        
            if (self.config.height === null) {
                height = document.querySelector(self.config.root).clientHeight;
            } else {
                height = self.config.height;
            }
        }
        self.width = width;
        self.height = height;
    }

    update(data) {
        var self = this;
        if (typeof data !== typeof undefined) {
            self.data = data;
            self.config.animation.animate = true;
        } else {
            self.config.animation.animate = false;
        }
        self.ranges = self.getRanges();
        this.getDimensions();
        self.svg
            .attr("width", self.width)
            .attr("height", self.height);
        self.drawAxis();
        for (var i = 0; i < self.data.length; i++) {
            self.drawDataRow(i);
        }
    }

    setResizeEvent() {
        var self = this;
        var resizeTimer;
        var interval = Math.floor(self.config.resizeTimeout / 60 * 10);

        window.addEventListener('resize', function (event) {
            if (resizeTimer !== false) {
                clearTimeout(resizeTimer);
            }
            resizeTimer = setTimeout(function () {
                self.update()
            }, interval);
        });
    }

    drawDot(j) {

        var self = this;
        var shapes = self.container.selectAll(".shape");
        var x = self.ranges[0].axisScale;
        var y = self.ranges[1].axisScale;
        var temp = self.container.selectAll("shape");
        if (typeof self.data[j].shape !== typeof undefined && self.data[j].shape.type === "image" && self.data[j].shape.image !== "") { 
            if (!self.drawn) {
                temp = temp.data(self.data[j].data)
                    .enter().append("svg:image").attr('class', 'shape')
                    .attr("xlink:href", self.data[j].shape.image)
            }else{
                temp = self.container.selectAll(".shape"); 
            }
            temp.attr("width", self.data[j].shape.width)
                .attr("height", self.data[j].shape.height)
                .attr("x", function (d) {
                    return x(d[0]) - self.data[j].shape.width / 2;
                })
                .attr("y", function (d) {
                    return y(d[1]) - self.data[j].shape.height / 2;
                });
        } else {
            if (!self.drawn) {
                temp=temp.data(self.data[j].data)
                    .enter().append(self.data[j].shape.type).attr('class', 'shape')
            }else{
                temp = self.container.selectAll(".shape"); 
            }
            temp.attr("r", self.data[j].shape.width)
                .attr("cx", function (d) {
                    return x(d[0]);
                })
                .attr("cy", function (d) {
                    return y(d[1]);
                });
        }
    }

    drawLine(j) {
        var self = this;
        var lines = self.container.selectAll(".line");
        var x = self.ranges[0].axisScale;
        var y = self.ranges[1].axisScale;
        var line = d3.line()
            .x(function (d, i) {
                return x(d[0]) + self.config.margin.left;
            })
            .y(function (d) {
                return y(d[1]) + self.config.margin.bottom;
            });
        var item = self.data[j].data;
        var linet;
        if (!self.drawn) {
            linet = self.container.append("svg:path");
            self.lines[j] = linet;
        } else {
            linet = self.lines[j];
        }
        var color;
        if (typeof self.data[j].color !== typeof undefined) {
            color = self.data[j].color;
        } else {
            color = "#000";
        }
        linet.attr("fill", "none")
            .attr("stroke", color)
            .attr("d", line(item)).classed("line", true).attr("stroke-dasharray", function (d) {
                return this.getTotalLength()
            })
            .attr("stroke-dashoffset", function (d) {
                return this.getTotalLength()
            });
        
        if (self.config.animation.show && self.config.animation.animate) {
            self.container.selectAll(".line").transition(self.config.anim)
                .attr("stroke-dashoffset", 0);
        } else {
            self.container.selectAll(".line")
                .attr("stroke-dashoffset", 0);
        }
    }

    drawAxis() {
        var svgContainer = this.container;
        var i=0;
        
        for (; i < this.ranges.length; i++) {
            var axisScale = d3.scaleLinear();
            var AxisGroup;
            if (!this.drawn) {
                AxisGroup = svgContainer
                    .append("g");
                this.config.axis[i].axisGroup = AxisGroup;
            } else {
                AxisGroup = this.config.axis[i].axisGroup;
            }
            var axis;
            switch (i) {
                case 0:
                    axisScale = axisScale
                        .domain([this.ranges[i].min, this.ranges[i].max])
                        .range([0, this.width]);
                    axis = d3.axisBottom()
                        .scale(axisScale);
                        
                    AxisGroup.attr("class", "x axis")
                        .call(axis);
                    break;
                case 1:
                    axisScale = axisScale
                        .domain([this.ranges[i].max, this.ranges[i].min])
                        .range([0, this.height]);
                    axis = d3.axisLeft()
                        .scale(axisScale);
                    AxisGroup
                        .attr("class", "y axis")
                        .call(axis);
                    break;
            }
            var bounding = AxisGroup._groups[0][0].getBBox();
            this.config.axis[i].bounding = bounding;
            this.ranges[i].axisScale = axisScale;
            this.ranges[i].axis = axis;
        }
        this.innerHeight = this.height;
        this.innerWidth = this.width;
        this.axisLeft = 0;
        this.axisBottom = 0;
        var axisLeft;
        var axisBottom;
        for (i = 0; i < this.ranges.length; i++) {
            switch (i) {
                case 0:
                    axisLeft = this.config.axis[i + 1].bounding.width;
                    axisBottom = this.config.axis[i].bounding.height;
                    this.axisBottom += axisBottom;
                    this.innerHeight -= axisBottom;
                    break;
                case 1:
                    axisLeft = this.config.axis[i].bounding.width;
                    axisBottom = this.config.axis[i - 1].bounding.height;
                    this.axisLeft += axisLeft;
                    this.innerWidth -= axisLeft;
                    break;
            }
        }
        for (i = 0; i < this.ranges.length; i++) {
            AxisGroup = this.config.axis[i].axisGroup;
            switch (i) {
                case 0:
                    this.ranges[i].axisScale = this.ranges[i].axisScale.range([this.axisLeft, this.width - (this.config.margin.left + this.axisLeft)]);
                    this.ranges[i].axis = d3.axisBottom()
                        .scale(this.ranges[i].axisScale);
                    AxisGroup.attr("transform", "translate(" + (this.config.margin.left) + "," + (this.config.margin.top - this.axisBottom + this.height) + ")").call(this.ranges[i].axis);
                    break;
                case 1:
                    this.ranges[i].axisScale = this.ranges[i].axisScale.range([this.axisBottom / 2, this.height - (this.config.margin.top + this.axisBottom)]);
                    this.ranges[i].axis = d3.axisLeft()
                        .scale(this.ranges[i].axisScale);
                    AxisGroup.attr("transform", "translate(" + (this.config.margin.left + this.axisLeft) + "," + (this.config.margin.top) + ")").call(this.ranges[i].axis);
                    break;
            }
        }
    }

    getRanges() {
        var ranges = [];
        for (var i = 0; i < this.config.axis.length; i++) {
            var min = this.config.axis[i].min;
            var max = this.config.axis[i].max;
            if (min === 'auto' || max === 'auto') {
                for (var j = 0; j < this.data.length; j++) {
                    for (var k = 0; k < this.data[j].data.length; k++) {
                        var item = this.data[j].data[k][i];
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