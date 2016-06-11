(function() {
	console.log('app started');

	var map = d3.select('#map'),
		width = 1020,
		height = 800,
		years = [],
		defaultColor = '#ffffff',
		svg,
		axis,
		convert,
		chartAreaPath,
		chartLinePath,
		chartArea,
		chartLine,
		chart,
		activeChart = {
			'rect': true,
			'area': false
		},
		chartInner,
		countries,
		colors,
		hover,
		text,
		select,
		chartWidth = 700,
		chartHeight = 180,
		timeDomain = [],
		dataDomain = [],
		margin = {top: 30, right: 40, bottom: 40, left: 40};

	function init() {
		setMap();
	}	

	function setMap() {

		svg = d3.select('#map').append('svg')
			.attr({
                width: width,
                height: height
            });

		colors = [
			'#a50026',
			'#d73027',
			'#f46d43',
			'#fdae61',
			'#fee08b',
			'#d9ef8b',
			'#a6d96a',
			'#66bd63',
			'#1a9850',
			'#006837'];

		defColor = 'white';
		getColor = d3.scale.quantize()
			.domain([33, 84])
			.range(colors);

		loadData();
	}

	function loadData() {
		   queue()
		  .defer(d3.json, '/data/topoworld.json')
		  .defer(d3.csv, '/data/age.csv')
		  .await(processData);
	}

	function processData(error, worldMap, countryData) {
		var world = topojson.feature(worldMap, worldMap.objects.world),
			dataValues = [];

		countries = world.features;

		for (var i in countries) {
			for (var j in countryData) {
				if (countries[i].id == countryData[j].ISO3166) {

					for(var k in countryData[j]) {
						if (k != 'Country' && k != 'ISO3166' && k !== 'series' && k !== 'data') {
							if (years.indexOf(k) == -1) {
								years.push(k);
							}

							countries[i].properties[k] = Number(countryData[j][k]);
							dataValues.push(Number(countryData[j][k]));
						}
					}

					countries[i].country = countryData[j].Country;
					break;
				}
			}
		}

		timeDomain = [d3.min(years), d3.max(years)];
		dataDomain = [0, d3.max(dataValues)];

		renderMap(world);
	}

	function renderMap(world) {
		var projection,
			miller = d3.geo.miller()
			  .scale(130)
			  .translate([width / 2, height / 2])
			  .precision(.1);

		projection = d3.geo.path().projection(miller);

		var map = svg.append('g');

		map.attr('transform', 'translate(0, 80)');

		select = svg.append('g')
			.attr('class', 'selected');

		map.selectAll('.country')
			.data(world.features)
			.enter().append('path')
			.attr({
                class: 'country',
                d: projection
            });

		map.selectAll('.country')
			.on('mouseover', function(d) {
				this.style.opacity = '1';
			})
			.on('mouseout', function(d) {
				this.style.opacity = '';
			})
			.on('click', function(d) {
				setSelected(d, this);
			});

		fillMap();
		renderChart();
        renderHoverData();
		drawLegend();
		addSwitcherChartType()
	}

	function addSwitcherChartType() {
		var areaSwitcher = svg.append('g')
			.attr({
				class: 'area-switch'
			})
			.on('click', function() {
				this.classList.add('active');
				d3.selectAll(".rect-switch")
					.classed('active', false);

				activeChart.rect = false;
				activeChart.area = true;

				clearMap();
			});

		var rectSwitcher = svg.append('g')
			.attr({
				class: 'rect-switch active',
				transform: 'translate(0, 50)'
			})
			.on('click', function() {
				this.classList.add('active');
				d3.selectAll(".area-switch")
					.classed('active', false);

				activeChart.rect = true;
				activeChart.area = false;

				clearMap();
			});

		areaSwitcher.append('circle')
			.attr({
				cx: 10,
				cy: 90,
				r: 7
			});

		areaSwitcher.append('text')
			.attr({
				x: 30,
				y: 95
			})
			.text('Area chart');

		rectSwitcher.append('circle')
			.attr({
				cx: 10,
				cy: 90,
				r: 7
			});

		rectSwitcher.append('text')
			.attr({
				x: 30,
				y: 95
			})
			.text('Rect chart');
	}

	function setSelected(d, context) {

		if (!context.classList.contains('country_selected')) {

			if (activeChart.rect) {
				setRectChartData(d);
			}

			else {
				setChartData(d);
			}

			context.classList.add('country_selected');
		}

		else {
			context.classList.remove('country_selected');

			setTimeout(function() {
				d3.selectAll('.' + d.id).remove();
			}, 1500);

			d3.selectAll('.' + d.id + ' rect')
				.transition()
				.duration(1500)
				.attr({
					y: chartHeight,
					height: 0
				});

		}

	}

    function renderChart() {
		convert = {
			x: d3.scale.ordinal(),
			y: d3.scale.linear()
		};

		axis = {
			x: d3.svg.axis().orient('bottom'),
			y: d3.svg.axis().orient('right')
		};

		axis.x.scale(convert.x);
		axis.y.scale(convert.y);

		axis.y.tickSize(chartWidth);

		convert.x.rangeRoundBands([0, chartWidth]);
		convert.y.range([chartHeight, 0]);

		convert.x.domain(years);
		convert.y.domain(dataDomain);

        chart = svg.append('g');

        chart.attr({
			class: 'chart',
			transform: 'translate(120, 0)'
		});

		chartInner = chart.append('rect')
			.attr({
				width: chartWidth + 70,
				height: chartHeight + 70,
				rx: 3,
				ry: 3,
				class: 'chart-inner'
			});

        chartInner = chart.append('g')
        	.attr({
                transform: 'translate(' + margin.left + ',' + margin.top + ')'
            });

        chartInner.append('g')
            .attr({
                class: 'x axis',
                transform: 'translate(0,' + chartHeight + ')'
            })
            .call(axis.x);

        var gy = chartInner.append('g')
            .attr({
                class: 'y axis'
            })
            .call(axis.y);


		gy.selectAll("text")
			.attr({
				x: -12,
				dy: -4
			})
	}

	function renderHoverData() {
		hover = svg.append('g')
			.attr('transform', 'translate(' + (-1000) + ',' + (-1000) + ')');

		hover.append('text')
			.attr('class', 'country-name')
			.text('Belarus');

		hover.append('text')
			.attr({
                class: 'year',
                transform: 'translate(0, 15)'
            })
			.text('2000');

		hover.append('text')
			.attr({
                class: 'data',
                transform: 'translate(0, 30)'
            })
            .text('data')
	}

	function setChartData(country) {
		var dataset =  country.properties,
			data = dictToList(dataset);

		var chartItem = chartInner.append('g')
			.attr({
				class: 'country-area ' + country.id
			});

		chartLine = d3.svg.line()
			.defined(function(d) {
				return d[1];
			})
			.x(function(d) {
				return convert.x(d[0]);
			})
			.y(function(d) {
				return convert.y(d[1]);
			});

		chartArea = d3.svg.area()
			.defined(chartLine.defined())
			.x(chartLine.x())
			.y0(chartHeight)
			.y1(chartLine.y());

		chartAreaPath = chartItem.append('path').attr('class', 'area');
		chartLinePath = chartItem.append('path').attr('class', 'line');

		chartAreaPath
			.datum(data.filter(function(d) {
				if (d[1]) return d;
			}))
			.attr('d', chartArea);


		chartLinePath
			.datum(data.filter(function(d) {
				if (d[1]) return d;
			}))
			.attr('d', chartLine);

		var dots = chartItem.append('g')
			.attr('class', 'dots');

		dots.selectAll('.dot')
			.data(data.filter(function(d) {if (d[1]) return d; }))
			.enter().append('circle')
			.attr({
                class: 'dot',
                cx: chartLine.x(),
                cy: chartLine.y(),
                r: 3
            })
			.on('mouseover', function(d) {
				var xy = d3.mouse(this),
					x,
					y,
					deltaX = 790,
					deltaY = 15;

				x = xy[0] - chartWidth + deltaX;
				y = xy[1] - deltaY;

				hover.attr('transform', 'translate(' + x + ',' + y + ')');

				hover.select('.country-name').text('Country: ' + country.country);
				hover.select('.year').text('Year: ' + d[0]);
				hover.select('.data').text('Average years: ' + d[1].toFixed(2));

			})
			.on('mouseout', function() {
				hover.attr('transform', 'translate(' + (-1000) + ',' + (-1000) + ')');
			});
	}

	function clearMap() {

		d3.selectAll('.country_selected')
			.classed('country_selected', false);

		setTimeout(function() {
			d3.selectAll('.country-area').remove();
		}, 1500);

		d3.selectAll('.country-area rect')
			.transition()
			.duration(1500)
			.attr({
				y: chartHeight,
				height: 0
			});
	}

    function setRectChartData(country) {
        var dataset =  country.properties,
            data = dictToList(dataset);

        var chartItem = chartInner.append('g')
            .attr({
                class: 'country-area ' + country.id
            });

		var color = 'rgb('+ getRandom(0, 255) +', '+ getRandom(0, 255) +', '+ getRandom(0, 255) +')';
		var bars = chartItem
            .selectAll('g.bar-group')
            .data(data)
            .enter()
            .append('g')
            .attr({
                transform: function (d, i) {
                   if (d[1]) return 'translate(' + convert.x(d[0]) + ', 0)';
                },
                class: 'rect-group'
            });

        bars.append('rect')
            .attr({
                y: chartHeight,
                height: 0,
                width: function(d) {
                    return convert.x.rangeBand(d[0]) - 1;
                },
                class: 'rect'
            })
            .transition()
            .duration(1500)
            .attr({
                y: function (d, i) {
                    if (d[1]) return convert.y(d[1]);
                },
                height: function (d, i) {
                    if (d[1]) return chartHeight - convert.y(d[1]);
                }
            });
    }

	function getRandom(min, max) {
		return Math.ceil(Math.random() * (max - min) + min);
	}


	function dictToList(dict) {

		var list = [];
		for(var i in dict) {
			list.push([i, dict[i]]);
		}
		return list;
	}

	function drawLegend() {
		var legend = svg.append('g'),
			itemHeight = 15,
			itemWidth = 20,
			i = 0;

			legend.attr('transform', 'translate(10, 670)');

		while (i < colors.length) {
			legend.append('rect')
                .attr({
                    width: itemWidth,
                    height: itemHeight,
                    x: i * itemWidth,
                    fill: function(d) {
                        return colors[i];
                    }
                });

			i++;
		}
	}

	function fillMap() {
		var current = 2014;

		svg.selectAll('.country')
		.style('fill', function(d) {
			var color = getColor(d.properties[current]);
			return color || defaultColor;
		});
	}

	init();

})();