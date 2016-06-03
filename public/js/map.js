(function() {
	console.log('app started');

	var map = d3.select('#map'),
		width = 1020,
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
        selectedCountries = 0,
        dur = 500,
        chartWidth = 400,
        chartHeight = 300,
        timeDomain = [],
        dataDomain = [],
        margin = {top: 30, right: 40, bottom: 40, left: 40};

	function init() {
		setMap();
	}	

	function setMap() {

        svg = d3.select('#map').append('svg')
            .attr('width', width)
            .attr('height', height);

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
            
        defColor = "white";
        getColor = d3.scale.quantize()
            .domain([33, 84])
            .range(colors);

        loadData();
	}

	function loadData() {
		   queue()
	      .defer(d3.json, "/data/topoworld.json")
          .defer(d3.csv, "/data/age.csv")
          // .defer(d3.csv, "/data/freedom.csv")
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

		var map = svg.append("g");

        select = svg.append('g')
            .attr('class', 'selected');

	    map.selectAll('.country')
	    	.data(world.features)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", projection);

        map.selectAll('.country')
        	.on('mouseover', function(d) {
            	this.style.opacity = '0.5';
            })
            .on('mouseout', function(d) {
            	this.style.opacity = '1';
            })
            .on('click', function(d) {
                setSelected(d, this);
            });

        fillMap();
        setChart();
        renderHoverData();
        drawLegend();
	}

    function setSelected(d, context) {

        if (select.selectAll('.' + d.id)[0].length === 0) {
            var xy = d3.mouse(context);

            select.append('circle')
                .attr("cx", xy[0])
                .attr("cy", xy[1])
                .attr("r", 12)
                .attr('class', 'selected-countries ' + d.id)
                .attr('fill', 'orange');

            selectedCountries++;
            setChartData(d);
        }

        else {
            select.select('.' + d.id).remove();
            selectedCountries--;
        }

    }

	function setChart() {
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
            .orient("bottom")
            .ticks(years.length /2)
            .tickFormat(d3.format(".0f"));

        var chartYAxis = d3.svg.axis()
            .scale(chartY)
            .orient("left")
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

        chart.attr("transform", "translate(0, 10)");

        chart.append("rect")
            .attr('width', chartWidth + 100)
            .attr('height', chartHeight + 100)
            .attr('x', 0)
            .attr('fill', '#fff')
            .attr('stroke', 'black');

        top = chartHeight + margin.top;

        chart.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + top + ")")
            .call(chartXAxis);

        chart.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(chartYAxis);

        text = chart.append("text")
            .attr('class', 'text')
            .attr("transform", "translate(" + margin.left + ",19)");

	}

    function renderHoverData() {
        hover = svg.append('g')
            .attr("transform", "translate(" + (-1000) + "," + (-1000) + ")");

        hover.append('text')
            .attr('class', 'year')
            .text('2000');

        hover.append('text')
            .attr('class', 'data')
            .text('data')
            .attr("transform", "translate(0, 20)");
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

        chartAreaPath = chart.append("path").attr("class", "area");
        chartLinePath = chart.append("path").attr("class", "line");

        chartAreaPath
            .datum(data.filter(function(d) {if (d[1]) return d; }))
                //.transition().duration(dur)
            .attr("d", chartArea)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        chartLinePath
            .datum(data.filter(function(d) {if (d[1]) return d; }))
                //.transition().duration(dur)
            .attr("d", chartLine)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //chart.selectAll(".dots").remove();

        var dots = chart.append("g")
            .attr('class', 'dots')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        dots.selectAll(".dot")
            .data(data.filter(function(d) {if (d[1]) return d; }))
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", chartLine.x())
            .attr("cy", chartLine.y())
            .attr("r", 3)
            .on('mouseover', function(d) {
                var xy = d3.mouse(this),
                    x = (xy[0]),
                    y = (xy[1] - chartHeight);

                if (width - xy[0] < chartWidth) {
                    x = xy[0] - chartWidth;
                }
                if (xy[1] < chartHeight) {
                    y = xy[1];
                }

                hover.attr("transform", "translate(" + x + "," + y + ")");

                hover.select('.year').text('Year: ' + d[0]);
                hover.select('.data').text('Average years: ' + d[1].toFixed(2));

            })
            .on('mouseout', function() {
                hover.attr("transform", "translate(" + (-1000) + "," + (-1000) + ")");
            });

        text.text(country.country);
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
					.attr('width', itemWidth)
					.attr('height', itemHeight)
					.attr('x', i * itemWidth)
					.attr('fill', function(d) {
						return colors[i];
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