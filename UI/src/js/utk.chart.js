(function () {
    'use strict';
    var utk = angular.module('utk.directive.chart', []);
    
    var defaultColors = [
                            ['#FCDD4D', '#DCBF40'],
                            ['#06CAB1', '#00AE96'],
                            ['#8CC520', '#72AA15'],
                            ['#F9A006', '#D97E00'],
                            ['#767676', '#5A5A5A'],
                            ['#673882', '#552B6D'],
                            ['#AF141B', '#970D13'],
                            ['#165676', '#0E4664']
                        ];

    function initChart(attrs, name, initVal) {
        if(!attrs[name]) {
            if(arguments.length == 2) {
                attrs[name] = 'true';
            } else {
                attrs[name] = initVal;
            }
        }
    };
    
    function legendDefs(svg, colors) {
        var defs = svg.append("svg:defs");
        colors.forEach( function(pair, idx) {
            var grad = defs.append("svg:linearGradient")
                            .attr("id", "grad" + idx)
                            .attr("x1", "100%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%")
                            .attr("spreadMethod", "pad");
            grad.append("svg:stop").attr("offset", "0%").attr("stop-color", pair[0]);
            grad.append("svg:stop").attr("offset", "100%").attr("stop-color", pair[1]);
        });
    };

    utk.directive('utkBarchart', function () {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                data: '=chartData',
                groupText: '=chartGroupText',
                colors: '=chartColors',
                displayValue: '@chartDisplayValue',
                axisColor: '@chartAxisColor',
                axisTextColor: '@chartAxisTextColor',
                xSkip: '@chartXSkip',
                xText: '@chartXText',
                yText: '@chartYText',
                width: '@chartWidth',
                height: '@chartHeight',
                margin: '@chartMargin',
                legend: '@chartLegend',
                tipText: '&chartTipText',
                showTip: '@chartShowTip',
                click: '&chartClick'
            },
            template: '<div><div ng-transclude></div></div>',
            compile: function (element, attrs) {
                initChart(attrs, 'chartLegend');
                initChart(attrs, 'chartShowTip');
                return function (scope, element, attrs) {
                    function draw() {
                        d3.select(element[0]).select("svg").remove();//clean
                        
                        element.find(".chart_tip").css("display", "none");
                    
                        scope.width = parseInt(scope.width) || 1600;
                        scope.height = parseInt(scope.height) || 400;
                        scope.margin = parseInt(scope.margin) || 60;
                        var container = {
                            width: scope.width - scope.margin * 2,
                            height: scope.height - scope.margin * 2,
                            margin: scope.margin
                        };
                        
                        var group_count = 0;
                        var dataset = [];				
                        var x_keys = [];
                        
                        for (var k in scope.data) {                
                            x_keys.push(k);
                            group_count = scope.data[k].length;
                            for( var idx = 0; idx < group_count; idx++ ){
                                dataset.push(scope.data[k][idx]);
                            }
                        }
                        
                        var max = d3.max(dataset);				
                        var x_count = x_keys.length;
                        
                        var xScale = d3.scale.ordinal().domain(d3.range(x_count)).rangeRoundBands([container.margin, container.width], .05);
                        var yScale = d3.scale.linear().domain([0, max]).range([container.height, container.margin]);
                        
                        var svg = d3.select(element[0]).append("svg").attr("width", scope.width).attr("height", scope.height);
                        
                        var colors = scope.colors || defaultColors;
                        var axisColor = scope.axisColor || defaultColors[4][0];
                        var axisTextColor = scope.axisTextColor || defaultColors[4][0];
                        
                        legendDefs(svg, colors);
                        
                        svg.selectAll("rect")
                            .data(dataset)
                            .enter()
                            .append("rect")
                            .attr({
                                "x": function (d, i) { return xScale(Math.floor(i / group_count)) + (i % group_count) * xScale.rangeBand() / group_count; },
                                "y": function (d) { return yScale(d); },
                                "width": xScale.rangeBand() / group_count,
                                "height": function (d) { return container.height - yScale(d); },
                                "fill": function (d, i) { return "url(#grad" + i % group_count + ")" },
                                "opacity": 0.8,
                                "stroke": axisColor,
                                "stroke-width": '1px'
                            })
                            .on("mouseover", function (d, i) {
                                if(scope.showTip != "true")
                                    return;
                                var xPosition = parseFloat(d3.select(this).attr("x")) - xScale.rangeBand() * 2 / group_count;
                                var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + container.height / 2;
                                
                                var div = element.find(".chart_tip").eq(0);
                                div
                                  .css("display", "block")
                                  .css("left", xPosition + "px")
                                  .css("top", yPosition + "px");
                                
                                if(scope.tipText) {
                                    scope.tipText({"tip": {element: div, data: d, index: i}});
                                }
                            })
                            .on("mouseout", function () {
                                if(scope.showTip != "true")
                                    return;
                                element.find(".chart_tip").eq(0).css("display", "none");
                            })
                            .on("click", function(d, i) {
                                scope.click&&scope.$apply(scope.click({data: d, index: i}));
                            });
                            

                        if(scope.displayValue == 'true' || scope.displayValue == true) {
                            svg.selectAll("text")
                                .data(dataset)
                                .enter()
                                .append("text").text(function (d) { return d; })
                                .attr("text-anchor", "middle")
                                .attr("x", function (d, i) { return xScale(Math.floor(i / group_count)) + xScale.rangeBand() / group_count / 2 + (i % group_count) * xScale.rangeBand() / group_count; })
                                .attr("y", function (d) { return yScale(d) + 16; })
                                .attr("fill", "white");
                        }
                        
                        // ===============================
                        // add axes
                        // ===============================
                        var x_axis = d3.svg.axis().scale(xScale).ticks(x_count).orient("bottom").tickFormat(function (d, i) { return (i % scope.xSkip == 0) ? x_keys[i] : ''; });
                        var y_axis = d3.svg.axis().scale(yScale).orient("left");
                        
                        svg.append("g")
                            .attr({
                                "class": "x axis",
                                "transform": "translate(0, " + container.height + ")"
                            })
                            .attr("fill", axisColor)
                            .call(x_axis);
                        
                        svg.append("g")
                            .attr({
                                "class": "y axis",
                                "transform": "translate(" + container.margin + ", 0)"
                            })
                            .attr("fill", axisColor)
                            .call(y_axis);

                        // ===============================
                        // add titles
                        // ===============================
                        d3.select(".x.axis")
                            .append("text")
                            .text(scope.xText)
                            .attr("x", container.width / 2)
                            .attr("y", container.margin / 1.5)
                            .attr("fill", axisTextColor)
                            .style("font-size", "150%");

                        d3.select(".y.axis")
                            .append("text")
                            .text(scope.yText)
                            .attr("transform", "rotate(-90," + -container.margin / 2 + ",0) translate(-" + container.height / 1.5  + ")")
                            .attr("fill", axisTextColor)
                            .style("font-size", "150%");
                            
                        // ===============================
                        // add legend
                        // ===============================
                        if(scope.legend != "true")
                            return;
                        var legend = svg.append("g");
                        for(var idx = 0; idx < group_count; idx++) {
                            legend.append("rect")
                                .attr("x", container.width - container.margin - (group_count - idx) * 100)
                                .attr("y", 25)
                                .attr("width", 20)
                                .attr("height", 20)
                                .attr("fill", "url(#grad" + idx + ")");
                            
                            legend.append("text")
                                .text(scope.groupText[idx])
                                .attr("x", container.width - container.margin + 25 - (group_count - idx) * 100)
                                .attr("y", 40)
                                .attr("fill", axisTextColor);
                        };
                    }
                    
                    scope.$watch('data', draw, true);
                    scope.$watchGroup(['legend', 'displayValue'], draw);
                    scope.$watchGroup(['xText', 'yText'], draw);
                    scope.$watchGroup(['width', 'height', 'margin'], draw);
                }
            }
        }
    });
    
    utk.directive('utkLinechart', function () {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                data: '=chartData',
                groupText: '=chartGroupText',
                colors: '=chartColors',
                axisColor: '@chartAxisColor',
                axisTextColor: '@chartAxisTextColor',
                xSkip: '@chartXSkip',
                xText: '@chartXText',
                yText: '@chartYText',
                width: '@chartWidth',
                height: '@chartHeight',
                margin: '@chartMargin',
                legend: '@chartLegend',
                tipText: '&chartTipText',
                showTip: '@chartShowTip',
                click: '@chartClick'
            },
            template: '<div><div ng-transclude></div></div>',
            compile: function (element, attrs) {
                initChart(attrs, 'chartLegend');
                initChart(attrs, 'chartShowTip');
                return function (scope, element, attrs) {
                    function draw() {
                        d3.select(element[0]).select("svg").remove();//clean
                        element.find(".chart_tip").css("display", "none");
                    
                        scope.width = parseInt(scope.width) || 1600;
                        scope.height = parseInt(scope.height) || 400;
                        scope.margin = parseInt(scope.margin) || 60;
                        var container = { 
                            width: scope.width - scope.margin * 2, 
                            height: scope.height - scope.margin * 2, 
                            margin: scope.margin
                        };
                        
                        var group_count = 0;
                        var dataset = [];				
                        var x_keys = [];
                        
                        for (var k in scope.data) {                
                            x_keys.push(k);
                            group_count = scope.data[k].length;
                            for( var idx = 0; idx < group_count; idx++ ){
                                dataset.push(scope.data[k][idx]);
                            }
                        }
                        
                        var max = d3.max(dataset);				
                        var x_count = x_keys.length;
                        
                        var xScale = d3.scale.ordinal().domain(d3.range(x_count)).rangeRoundBands([container.margin, container.width], .05);
                        var yScale = d3.scale.linear().domain([0, max]).range([container.height, container.margin]);
                        
                        var svg = d3.select(element[0]).append("svg").attr("width", scope.width).attr("height", scope.height);
                        
                        var colors = scope.colors || defaultColors;
                                                     
                        legendDefs(svg, colors);
                        
                        var line = d3.svg.line()
                            .x(function(d,i) { return xScale(i) + xScale.rangeBand() / 2; })
                            .y(function(d) { return yScale(d); })
                        
                        for(var idx = 0; idx < group_count; idx++) {
                            var line_data = [];
                            for(var j = 0; j < x_keys.length; j++) {
                                line_data.push(scope.data[x_keys[j]][idx]);
                            }
                            svg.append("svg:path").attr("d", line(line_data)).attr("stroke", colors[idx % group_count][0]);
                        }
                        
                        svg.selectAll("circle")
                            .data(dataset)
                            .enter()
                            .append("circle")
                            .attr({
                                "cx": function(d, i){ return xScale(Math.floor(i / group_count)) + xScale.rangeBand() / 2; },
                                "cy": function(d){ return yScale(d); },
                                "r": 5,
                                "stroke": function(d, i){ return colors[i % group_count][0]; }
                            })
                            .on("mouseover", function (d, i) {
                                if(scope.showTip != "true")
                                    return;
                                var xPosition = parseFloat(d3.select(this).attr("cx")) - xScale.rangeBand() * 2 / group_count;
                                var yPosition = parseFloat(d3.select(this).attr("cy")) + container.margin / 4;
                                
                                var div = element.find(".chart_tip").eq(0);
                                div
                                  .css("display", "block")
                                  .css("left", xPosition + "px")
                                  .css("top", yPosition + "px");
                                
                                if(scope.tipText) {
                                    scope.tipText({"tip": {element: div, data: d, index: i}});
                                }
                            })
                            .on("mouseout", function () {
                                if(scope.showTip != "true")
                                    return;
                                element.find(".chart_tip").eq(0).css("display", "none"); 
                            })
                            .on("click", function(d, i) {
                                scope.click && scope.$apply(scope.click({data: d, index: i}));
                            });
                        
                        // ===============================
                        // add axes
                        // ===============================
                        var x_axis = d3.svg.axis().scale(xScale).ticks(x_count).orient("bottom").tickFormat(function (d, i) { return (i % scope.xSkip == 0) ? x_keys[i] : ''; });
                        var y_axis = d3.svg.axis().scale(yScale).orient("left");
                        
                        var axisColor = scope.axisColor || defaultColors[4][0];
                        var axisTextColor = scope.axisTextColor || defaultColors[4][0];
                        
                        svg.append("g")
                            .attr({
                                "class": "x axis",
                                "transform": "translate(0, " + container.height + ")"
                            })
                            .attr("fill", axisColor)
                            .call(x_axis);
                        
                        svg.append("g")
                            .attr({
                                "class": "y axis",
                                "transform": "translate(" + container.margin + ", 0)"
                            })
                            .attr("fill", axisColor)
                            .call(y_axis);

                        // ===============================
                        // add titles
                        // ===============================
                        d3.select(".x.axis")
                            .append("text")
                            .text(scope.xText)
                            .attr("x", container.width / 2)
                            .attr("y", container.margin / 1.5)
                            .attr("fill", axisTextColor)
                            .style("font-size", "150%");

                        d3.select(".y.axis")
                            .append("text")
                            .text(scope.yText)
                            .attr("transform", "rotate(-90," + -container.margin / 2 + ",0) translate(-" + container.height / 1.5  + ")")
                            .attr("fill", axisTextColor)
                            .style("font-size", "150%");
                            
                        // ===============================
                        // add legend
                        // ===============================
                        if(scope.legend != "true")
                            return;
                        var legend = svg.append("g");
                        for(var idx = 0; idx < group_count; idx++) {
                            legend.append("rect")
                                .attr("x", container.width - container.margin - (group_count - idx) * 100)
                                .attr("y", 25)
                                .attr("width", 20)
                                .attr("height", 20)
                                .attr("fill", "url(#grad" + idx + ")");
                            
                            legend.append("text")
                                .text(scope.groupText[idx])
                                .attr("x", container.width - container.margin + 25 - (group_count - idx) * 100)
                                .attr("y", 40)
                                .attr("fill", axisTextColor);
                        }
                    }
                    
                    scope.$watch('data', draw, true);
                    scope.$watch('legend', draw);
                    scope.$watchGroup(['xText', 'yText'], draw);
                    scope.$watchGroup(['width', 'height', 'margin'], draw);
                }
            }
        }
    });
    
    utk.directive('utkPiechart', function () {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                data: '=chartData',
                colors: '=chartColors',
                donuts: '@chartDonuts',
                width: '@chartWidth',
                height: '@chartHeight',
                margin: '@chartMargin',
                axisTextColor: '@chartAxisTextColor',
                legend: '@chartLegend',
                tipText: '&chartTipText',
                showTip: '@chartShowTip',
                click: '@chartClick'
            },
            template: '<div><div ng-transclude></div></div>',
            compile: function (element, attrs) {
                initChart(attrs, 'chartLegend');
                initChart(attrs, 'chartShowTip');
                return function (scope, element, attrs) {
                    function draw() {
                        d3.select(element[0]).select("svg").remove();//clean
                        element.find(".chart_tip").css("display", "none");
                        
                        scope.width = scope.width || 640;
                        scope.height = scope.height || 480;
                        scope.margin = scope.margin || 60;
                        var colors = scope.colors || defaultColors;
                                    
                        var svg = d3.select(element[0]).append("svg").attr("width", scope.width).attr("height", scope.height);                        
                        
                        var container = { 
                            width: scope.width - scope.margin * 2, 
                            height: scope.height - scope.margin * 2, 
                            margin: scope.margin
                        };
                        
                        legendDefs(svg, colors);
                    
                        var sum = 0;
                        var dataset = [];
                        var keys = [];
                        for(var k in scope.data) {
                            sum += scope.data[k];
                            dataset.push(scope.data[k]);
                            keys.push(k);
                        }
                        
                        var g = svg.append("g").attr("transform", "translate(" + scope.width / 2 + "," + scope.height / 2 + ")");
                        var outRadius = Math.min(container.width, container.height) / 2;
                        var arc = d3.svg.arc()                        
                            .outerRadius(outRadius);
                            
                        if(scope.donuts == true || scope.donuts == 'true') {
                            var inRadius = Math.max(50, outRadius * 0.618);
                            arc.innerRadius(inRadius);
                        }
                            
                        var pie = d3.layout.pie().value(function(d) {
                            return d;
                        }).sort(null);
                        
                        g.selectAll("path")
                            .data(pie(dataset))
                            .enter()
                            .append("path")
                            .attr({"class": "pie"})
                            .attr("d", arc)
                            .style("fill", function(d, i) { return colors[i][0]; })
                            .on("mouseover", function (d, i) {
                                if(scope.showTip != "true")
                                    return;
                                var xPosition = event.layerX;
                                var yPosition = event.layerY;
                                
                                var div = element.find(".chart_tip").eq(0);
                                div
                                  .css("display", "block")
                                  .css("left", xPosition + "px")
                                  .css("top", yPosition + "px");
                                
                                if(scope.tipText) {
                                    d.key = keys[i];
                                    d.percent = Math.ceil(d.value / sum * 10000 + 0.5) / 100 + "%";
                                    scope.tipText({"tip": {element: div, data: d, index: i}});
                                }
                            })
                            .on("mouseout", function () {
                                if(scope.showTip != "true")
                                    return;
                                element.find(".chart_tip").eq(0).css("display", "none"); 
                            })
                            .on("click", function(d, i) {
                                scope.click && scope.$apply(scope.click({data: d, index: i}));
                            });
                        
                        // ===============================
                        // add legend
                        // ===============================
                        var axisTextColor = scope.axisTextColor || defaultColors[4][0];
                        if(scope.legend != "true")
                            return;
                        var legend = svg.append("g");
                        for(var idx = 0; idx < keys.length; idx++) {
                            legend.append("rect")
                                .attr("x", container.width)
                                .attr("y", 25 * idx + 35)
                                .attr("width", 20)
                                .attr("height", 20)
                                .attr("fill", "url(#grad" + idx + ")");
                            
                            legend.append("text")
                                .text(keys[idx])
                                .attr("x", container.width + 25)
                                .attr("y", 25 * idx + 50)
                                .attr("fill", axisTextColor);
                        }
                    };
                    
                    scope.$watch('data', draw, true);
                    scope.$watchGroup(['width', 'height', 'margin'], draw);
                    scope.$watchGroup(['legend', 'donuts'], draw);
                }
            }
        }
    });
    
    utk.directive('utkRadarchart', function () {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                data: '=chartData',
                groupText: '=chartGroupText',
                levels: '@chartLevels',
                colors: '=chartColors',
                vertexRadius: '@chartVertexRadius',
                borderColor: '=chartBorderColor',
                width: '@chartWidth',
                height: '@chartHeight',
                margin: '@chartMargin',
                axisColor: '=chartAxisColor',
                axisTextColor: '@chartAxisTextColor',
                legend: '@chartLegend',
                tipText: '&chartTipText',
                showTip: '@chartShowTip',
                click: '&chartClick'
            },
            template: '<div><div ng-transclude></div></div>',
            compile: function (element, attrs) {
                initChart(attrs, 'chartLegend');
                initChart(attrs, 'chartShowTip');
                return function (scope, element, attrs) {
                    function draw(){
                        d3.select(element[0]).select("svg").remove();//clean
                        element.find(".chart_tip").css("display", "none");
                    
                        var colors = scope.colors || defaultColors;
                        var borderColor = scope.borderColor || defaultColors[7][0];
                        var axisColor = scope.axisColor || defaultColors[4][0];
                        var axisTextColor = scope.axisTextColor || defaultColors[4][0];
                        scope.width = scope.width || 400;
                        scope.height = scope.height || 400;
                        scope.margin = scope.margin || 80;
                        var container = { width: scope.width - scope.margin * 2, height: scope.height - scope.margin * 2, margin: scope.margin
                        };
                        var radius = scope.vertexRadius || 4;
                        var radians = 2 * Math.PI;
                        var levels = scope.levels || 5;
                        var factorLegend = .85;
                        var opacityArea = 0.5;
                        var maxValue = 0;
                        var dataset = [];
                        var keys = [];
                        for(var k in scope.data) {
                            var arr = [];
                            var dataArr = scope.data[k];
                            maxValue = Math.max(maxValue, d3.max(dataArr));
                            for(var i = 0; i < dataArr.length; i++ ){
                                arr.push({key: k, value: dataArr[i]});
                            }
                            dataset.push(arr);
                            keys.push(k);
                        }
                        
                        var allAxis = scope.groupText;
                        var total = allAxis.length;
                        
                        var svg = d3.select(element[0]).append("svg")
                                    .attr("width", scope.width)
                                    .attr("height", scope.height)
                                    
                        legendDefs(svg, colors);
                        
                        var g = svg.append("g")
                                    .attr("transform", "translate(" + scope.margin + "," + scope.margin + ")");
                        
                        // ===============================
                        // add Axis etc
                        // ===============================
                        for( var j = 0; j < levels - 1; j++ ) {
                            var levelFactor = Math.min(container.width / 2, container.height / 2) * ((j + 1) / levels);
                            g.selectAll(".levels")
                               .data(allAxis)
                               .enter()
                               .append("svg:line")
                               .attr("x1", function(d, i){ return levelFactor*(1 - Math.sin(i * radians / total));})
                               .attr("y1", function(d, i){ return levelFactor*(1 - Math.cos(i * radians / total));})
                               .attr("x2", function(d, i){ return levelFactor*(1 - Math.sin((i + 1) * radians / total));})
                               .attr("y2", function(d, i){ return levelFactor*(1 - Math.cos((i + 1) * radians / total));})
                               .attr("class", "line")
                               .style("stroke", axisColor)
                               .style("stroke-opacity", "1")
                               .style("stroke-width", "0.5px")
                               .attr("transform", "translate(" + (container.width / 2 - levelFactor) + ", " + (container.height / 2 - levelFactor) + ")");
                        }

                        var axis = g.selectAll(".axis")
                                .data(allAxis)
                                .enter()
                                .append("g")
                                .attr("class", "axis");
                        
                        axis.append("line")
                            .attr("x1", container.width / 2)
                            .attr("y1", container.height / 2)
                            .attr("x2", function(d, i){ return container.width / 2 * (1 - Math.sin(i * radians / total));})
                            .attr("y2", function(d, i){ return container.height / 2 * (1 - Math.cos(i * radians / total));})
                            .attr("class", "line")
                            .style("stroke", axisColor)
                            .style("stroke-width", "1px");
                        
                        axis.append("text")
                            .attr("color", axisTextColor)
                            .text(function(d){return d})
                            .attr("text-anchor", "middle")
                            .attr("dy", "1.5em")
                            .attr("transform", function(d, i){return "translate(0, -10)"})
                            .attr("x", function(d, i){ return container.width / 2 * (1 - factorLegend * Math.sin(i * radians / total)) - 60 * Math.sin(i * radians / total);})
                            .attr("y", function(d, i){ return container.height / 2 * (1 - Math.cos(i * radians / total)) - 20 * Math.cos(i * radians / total);});
                        
                        // ===============================
                        // add Polygon
                        // ===============================
                        var series = 0;
                        dataset.forEach(function(y, x){
                            var dataValues = [];
                            g.selectAll(".nodes")
                                .data(y, function(j, i){
                                    dataValues.push([
                                        container.width / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / maxValue) * Math.sin(i * radians / total)), 
                                        container.height / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / maxValue) * Math.cos(i * radians / total))
                                    ]);
                                });
                            dataValues.push(dataValues[0]);
                            g.selectAll(".area")
                                .data([dataValues])
                                .enter()
                                .append("polygon")
                                .attr("class", "radar-chart-serie" + series)
                                .style("stroke-width", "2px")
                                .style("stroke", borderColor)
                                .attr("points", function(d) {
                                    var str = "";
                                    for(var pti = 0; pti < d.length; pti++){
                                        str = str + d[pti][0] + "," + d[pti][1] + " ";
                                    }
                                    return str;
                                })
                                .style("fill", function(j, i){return colors[series][0];})
                                .style("fill-opacity", opacityArea)
                                .on('mouseover', function (d){
                                    var z = "polygon." + d3.select(this).attr("class");
                                    g.selectAll("polygon")
                                     .transition(200)
                                     .style("fill-opacity", 0.1); 
                                    g.selectAll(z)
                                     .transition(200)
                                     .style("fill-opacity", .8);
                                })
                                .on('mouseout', function(){
                                    g.selectAll("polygon")
                                     .transition(200)
                                     .style("fill-opacity", opacityArea);
                                })
                                .on('click', function(d) {
                                    scope.click&&scope.$apply(scope.click({data: y[0].key}));
                                });
                            series++;
                        });
                        
                        // ===============================
                        // add Vertex
                        // ===============================
                        series = 0;
                        dataset.forEach(function(y, x){
                            var dataValues = [];
                            g.selectAll(".nodes")
                                .data(y).enter()
                                .append("svg:circle")
                                .attr("class", "radar-chart-serie" + series)
                                .attr('r', radius)
                                .attr("alt", function(j){return Math.max(j.value, 0)})
                                .attr("cx", function(j, i){
                                    dataValues.push([
                                        container.width / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / maxValue) * Math.sin(i * radians / total)), 
                                        container.height / 2 * (1 - (parseFloat(Math.max(j.value, 0)) / maxValue) * Math.cos(i * radians / total))
                                    ]);
                                    return container.width / 2 * (1 - (Math.max(j.value, 0)/maxValue) * Math.sin(i * radians / total));
                                })
                                .attr("cy", function(j, i){
                                    return container.height / 2 * (1 - (Math.max(j.value, 0)/maxValue) * Math.cos(i * radians/total));
                                })
                                .style("fill", borderColor).style("fill-opacity", 1)                                
                                .on('mouseover', function (d, i) {
                                    var newX =  parseFloat(d3.select(this).attr('cx')) - 10;
                                    var newY =  parseFloat(d3.select(this).attr('cy')) - 5;
                                    var z = "polygon." + d3.select(this).attr("class");
                                    g.selectAll("polygon")
                                        .transition(200)
                                        .style("fill-opacity", 0.1);
                                    g.selectAll(z)
                                        .transition(200)
                                        .style("fill-opacity", .8);										
                                    
                                    if(scope.showTip != "true")
                                        return;
                                    var xPosition = event.layerX;
                                    var yPosition = event.layerY;
                                    
                                    var div = element.find(".chart_tip").eq(0);
                                    div
                                      .css("display", "block")
                                      .css("left", xPosition + "px")
                                      .css("top", yPosition + "px");
                                    
                                    if(scope.tipText) {
                                        scope.tipText({"tip": {element: div, data: d, index: i}});
                                    }
                                })
                                .on('mouseout', function() {
                                    g.selectAll("polygon")
                                        .transition(200)
                                        .style("fill-opacity", opacityArea);
                                    
                                    if(scope.showTip != "true")
                                        return;
                                    element.find(".chart_tip").eq(0).css("display", "none");
                                })
                                .on('click', function(d) {
                                    scope.click&&scope.$apply(scope.click({data: d.key}));
                                });
                                
                            series++;
                        });
                        
                        // ===============================
                        // add legend
                        // ===============================
                        if(scope.legend != "true")
                            return;
                        var axisTextColor = scope.axisTextColor || defaultColors[4][0];
                        var legend = svg.append("g");
                        for(var idx = 0; idx < keys.length; idx++) {
                            legend.append("rect")
                                .attr("x", scope.width - scope.margin - 40)
                                .attr("y", 25 * idx + 15)
                                .attr("width", 20)
                                .attr("height", 20)
                                .attr("fill", "url(#grad" + idx + ")");
                            
                            legend.append("text")
                                .text(keys[idx])
                                .attr("x", scope.width - scope.margin - 15)
                                .attr("y", 25 * idx + 30)
                                .attr("fill", axisTextColor);
                        }
                    }
                    
                    scope.$watch('data', draw, true);
                    scope.$watchGroup(['width', 'height', 'margin', 'levels'], draw);
                    scope.$watchGroup(['legend', 'showTip'], draw);
                }
            }
        }
    });
    
    utk.directive('utkPlotchart', function () {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                data: '=chartData',
                colors: '=chartColors',
                axisColor: '@chartAxisColor',
                axisTextColor: '@chartAxisTextColor',
                xText: '@chartXText',
                yText: '@chartYText',
                width: '@chartWidth',
                height: '@chartHeight',
                margin: '@chartMargin',
                legend: '@chartLegend',
                tipText: '&chartTipText',
                showTip: '@chartShowTip',
                click: '@chartClick'
            },
            template: '<div><div ng-transclude></div></div>',
            compile: function (element, attrs) {
                initChart(attrs, 'chartLegend');
                initChart(attrs, 'chartShowTip');
                return function (scope, element, attrs) {
                    function draw() {
                        d3.select(element[0]).select("svg").remove();//clean
                        element.find(".chart_tip").css("display", "none");
                    
                        scope.width = parseInt(scope.width) || 640;
                        scope.height = parseInt(scope.height) || 640;
                        scope.margin = parseInt(scope.margin) || 60;
                        var container = { 
                            width: scope.width - scope.margin * 2, 
                            height: scope.height - scope.margin * 2, 
                            margin: scope.margin
                        };
                        var colors = scope.colors || defaultColors;
                        
                        var group_count = 0;
                        var group_keys = [];
                        var x_set = [];
                        var y_set = [];
                        var dataset = [];
                        
                        for (var k in scope.data) {                
                            group_keys.push(k);
                            
                            for( var idx = 0; idx < scope.data[k].length; idx++ ){                                
                                x_set.push(scope.data[k][idx].x);
                                y_set.push(scope.data[k][idx].y);
                                dataset.push({x: scope.data[k][idx].x, y: scope.data[k][idx].y, c: colors[group_count][0]})
                            }
                            group_count++;
                        }
                        
                        var x_max = d3.max(x_set);
                        var y_max = d3.max(y_set);
                        
                        var xScale = d3.scale.linear().domain([0, x_max]).range([container.margin, container.width]);
                        var yScale = d3.scale.linear().domain([0, y_max]).range([container.height, container.margin]);
                        
                        var svg = d3.select(element[0]).append("svg").attr("width", scope.width).attr("height", scope.height);
                                                     
                        legendDefs(svg, colors);
                        
                        svg.selectAll("circle")
                            .data(dataset)
                            .enter()
                            .append("circle")
                            .attr({
                                "cx": function(d, i){ return xScale(d.x); },
                                "cy": function(d){ return yScale(d.y); },
                                "r": 5,
                                "stroke": function(d, i){ return d.c; }
                            })
                            .on("mouseover", function (d, i) {
                                if(scope.showTip != "true")
                                    return;
                                var xPosition = parseFloat(d3.select(this).attr("cx"));
                                var yPosition = parseFloat(d3.select(this).attr("cy")) + container.margin / 4;
                                
                                var div = element.find(".chart_tip").eq(0);
                                div
                                  .css("display", "block")
                                  .css("left", xPosition + "px")
                                  .css("top", yPosition + "px");
                                
                                if(scope.tipText) {
                                    scope.tipText({"tip": {element: div, data: d, index: i}});
                                }
                            })
                            .on("mouseout", function () {
                                if(scope.showTip != "true")
                                    return;
                                element.find(".chart_tip").eq(0).css("display", "none"); 
                            })
                            .on("click", function(d, i) {
                                scope.click && scope.$apply(scope.click({data: d, index: i}));
                            });
                        // ===============================
                        // add axes
                        // ===============================
                        
                        var x_axis = d3.svg.axis().scale(xScale).orient("bottom");
                        var y_axis = d3.svg.axis().scale(yScale).orient("left");
                        
                        var axisColor = scope.axisColor || defaultColors[4][0];
                        var axisTextColor = scope.axisTextColor || defaultColors[4][0];
                        
                        svg.append("g")
                            .attr({
                                "class": "x axis",
                                "transform": "translate(0, " + container.height + ")"
                            })
                            .attr("fill", axisColor)
                            .call(x_axis);
                        
                        svg.append("g")
                            .attr({
                                "class": "y axis",
                                "transform": "translate(" + container.margin + ", 0)"
                            })
                            .attr("fill", axisColor)
                            .call(y_axis);

                        // ===============================
                        // add titles
                        // ===============================						
                        d3.select(".x.axis")
                            .append("text")
                            .text(scope.xText)
                            .attr("x", container.width / 2)
                            .attr("y", container.margin / 1.5)
                            .attr("fill", axisTextColor)
                            .style("font-size", "150%");

                        d3.select(".y.axis")
                            .append("text")
                            .text(scope.yText)
                            .attr("transform", "rotate(-90," + -container.margin / 2 + ",0) translate(-" + container.height / 1.5  + ")")
                            .attr("fill", axisTextColor)
                            .style("font-size", "150%");
                            
                        // ===============================
                        // add legend
                        // ===============================
                        if(scope.legend != "true")
                            return;
                        var legend = svg.append("g");
                        for(var idx = 0; idx < group_count; idx++) {
                            legend.append("rect")
                                .attr("x", container.width - (group_count - idx) * 100)
                                .attr("y", 25)
                                .attr("width", 20)
                                .attr("height", 20)
                                .attr("fill", "url(#grad" + idx + ")");
                            
                            legend.append("text")
                                .text(group_keys[idx])
                                .attr("x", container.width + 25 - (group_count - idx) * 100)
                                .attr("y", 40)
                                .attr("fill", axisTextColor);
                        }						
                    }
                    
                    scope.$watch('data', draw, true);
                    scope.$watch('legend', draw);
                    scope.$watchGroup(['xText', 'yText'], draw);
                    scope.$watchGroup(['width', 'height', 'margin'], draw);
                }
            }
        }
    });
})();

