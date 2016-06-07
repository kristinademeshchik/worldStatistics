(function() {
	console.log('app started');

	var map = d3.select('#map'),
		width = 1220,
		height = 600,
		years = [],
		defaultColor = '#ccc',
		svg,
		chartAreaPath,
		chartLinePath,
		chartArea,
		chartLine,
		chart,
		countries,
		colors,
		hover,
		text,
		select,
		chartWidth = 300,
		chartHeight = 200,
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
		dataDomain = [d3.min(dataValues), d3.max(dataValues)];

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

		map.attr('transform', 'translate(-180, 10)');

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
		//renderChart();
        renderRectChart();
		renderHoverData();
		drawLegend();
	}

	function setSelected(d, context) {

		if (!context.classList.contains('country_selected')) {
			//setChartData(d);
			setRectChartData(d);
			context.classList.add('country_selected');
		}

		else {
			context.classList.remove('country_selected');
			d3.selectAll('.' + d.id).remove();
		}

	}

	function renderChart() {
		var top,
			chartX = d3.time.scale()
			.domain(timeDomain)
			.range([0, chartWidth]);

		var data = dictToList(countries[1].properties);
		var chartY = d3.scale.linear()
			.domain(dataDomain)
			.range([chartHeight, 0]);

		var chartXAxis = d3.svg.axis()
			.scale(chartX)
			.orient('bottom')
			.ticks(years.length /2)
			.tickFormat(d3.format('.0f'));

		var chartYAxis = d3.svg.axis()
			.scale(chartY)
			.orient('left')
			.tickValues(chartY.domain());

		chartLine = d3.svg.line()
			.defined(function(d) { return d[1]; })
			.x(function(d) { return chartX(d[0]); })
			.y(function(d) { return chartY(d[1]); });

		chartArea = d3.svg.area()
			.defined(chartLine.defined())
			.x(chartLine.x())
			.y0(chartHeight)
			.y1(chartLine.y());

		chart = svg.append('g');

		chart.attr('transform', 'translate(820, 10)');

		chart.append('rect')
			.attr({
                width: chartWidth + 100,
                height: chartHeight + 70,
                x: 0,
                fill: '#fff',
                stroke: 'black'
            });

		top = chartHeight + margin.top;

		chart.append('g')
			.attr({
                class: 'x axis',
                transform: 'translate(' + margin.left + ',' + top + ')'
            })
			.call(chartXAxis);

		chart.append('g')
			.attr({
                class: 'y axis',
                transform: 'translate(' + margin.left + ',' + margin.top + ')'
            })
			.call(chartYAxis);

	}

    function renderRectChart() {
        var top,
            chartX = d3.time.scale()
                .domain(timeDomain)
                .range([0, chartWidth]);

        var data = dictToList(countries[1].properties);
        var chartY = d3.scale.linear()
            .domain(dataDomain)
            .range([chartHeight, 0]);

        var chartXAxis = d3.svg.axis()
            .scale(chartX)
            .orient('bottom')
            .ticks(years.length /2)
            .tickFormat(d3.format('.0f'));

        var chartYAxis = d3.svg.axis()
            .scale(chartY)
            .orient('left')
            .tickValues(chartY.domain());

        chart = svg.append('g');

        chart.attr('transform', 'translate(820, 10)');

        chart.append('rect')
            .attr({
                width: chartWidth + 100,
                height: chartHeight + 70,
                x: 0,
                fill: '#fff',
                stroke: 'black'
            });

        top = chartHeight + margin.top;

        chart.append('g')
            .attr({
                class: 'x axis',
                transform: 'translate(' + margin.left + ',' + top + ')'
            })
            .call(chartXAxis);

        chart.append('g')
            .attr({
                class: 'y axis',
                transform: 'translate(' + margin.left + ',' + margin.top + ')'
            })
            .call(chartYAxis);
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
                transform: 'translate(0, 20)'
            })
			.text('2000');

		hover.append('text')
			.attr({
                class: 'data',
                transform: 'translate(0, 40)'
            })
            .text('data')
	}


	function setChartData(country) {
		var dataset =  country.properties,
			 data = dictToList(dataset);

		var xScale = d3.scale.linear()
			.domain(timeDomain)
			.range([0, chartWidth]);

		var yScale = d3.scale.linear()
			.domain(dataDomain)
        .range([0, chartHeight]);


		var chartItem = chart.append('g')
            .attr({
                transform: 'translate(' + margin.left + ',' + margin.top + ')',
                class: 'country-area ' + country.id
            });

		chartAreaPath = chartItem.append('path').attr('class', 'area');
		chartLinePath = chartItem.append('path').attr('class', 'line');

		chartAreaPath
			.datum(data.filter(function(d) {if (d[1]) return d; }))
			.attr('d', chartArea);

		chartLinePath
			.datum(data.filter(function(d) {if (d[1]) return d; }))
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
					deltaX = 780,
					deltaY = 25,
					x = (xy[0]) + deltaX,
					y = (xy[1] - chartHeight - deltaY);

				if (width - xy[0] < chartWidth) {
					x = xy[0] - chartWidth + deltaX;
				}
				if (xy[1] < chartHeight) {
					y = xy[1] - deltaY;
				}

				hover.attr('transform', 'translate(' + x + ',' + y + ')');

				hover.select('.country-name').text('Country: ' + country.country);
				hover.select('.year').text('Year: ' + d[0]);
				hover.select('.data').text('Average years: ' + d[1].toFixed(2));

			})
			.on('mouseout', function() {
				hover.attr('transform', 'translate(' + (-1000) + ',' + (-1000) + ')');
			});
	}

    function setRectChartData(country) {
        var dataset =  country.properties,
            data = dictToList(dataset);

        var xScale = d3.scale.linear()
            .domain(timeDomain)
            .range([0, chartWidth]);

        var yScale = d3.scale.linear()
            .domain(dataDomain)
            .range([0, chartHeight]);

        var chartItem = chart.append('g')
            .attr({
                transform: 'translate(' + margin.left + ',' + margin.top + ')',
                class: 'country-area ' + country.id
            });

        var bars = chartItem
            .selectAll('g.bar-group')
            .data(data)
            .enter()
            .append('g')
            .attr({
                transform: function (d, i) {
                   if (d[1]) return 'translate(' + xScale(d[0]) + ', 0)';
                },
                class: 'rect-group'
            });


        bars.append('rect')
            .attr({
                y: chartHeight,
                height: 0,
                width: 76,
                class: 'rect'
            })
            .transition()
            .duration(1500)
            .attr({
                y: function (d, i) {
                    if (d[1]) return yScale(data[1]);
                },
                height: function (d, i) {
                    if (d[1]) return chartHeight - yScale(d[1]);
                }
            });
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

			legend.attr('transform', 'translate(10, 570)');

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