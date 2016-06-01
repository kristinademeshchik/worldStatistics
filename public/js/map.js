(function() {
	console.log('app started');

	var map = d3.select('#map'),
		width = 820,
		height = 600,
		years = [],
		defaultColor = 'black',
		svg,
        colors

	function init() {
		setMap();
	}	

	function setMap() {
		width = 818, height = 600;

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
        getColor = d3.scale.quantize().domain([100,0]).range(colors);

        loadData();
	}

	function loadData() {
		   queue()
	      .defer(d3.json, "/data/topoworld.json")
	      .defer(d3.csv, "/data/freedom.csv")
	      .await(processData); 
	}

	function processData(error, worldMap, countryData) {
		if (error) {
			console.log('error');
		}
		else  {
			processData(worldMap, countryData);
		}
	} 


    function processData(error, worldMap, countryData) {
        var world = topojson.feature(worldMap, worldMap.objects.world),
            countries = world.features;

        for (var i in countries) {
            for (var j in countryData) {
                if (countries[i].id == countryData[j].ISO3166) {

                    for(var k in countryData[j]) {
                        if (k != 'Country' && k != 'ISO3166') {
                            if (years.indexOf(k) == -1) { 
                                years.push(k);
                            }
                            countries[i].properties[k] = Number(countryData[j][k])
                        }
                    }

                    countries[i].country = countryData[j].Country;
                    break;
                }
            }
        }

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

		console.log(world);

	    map.selectAll('.country')
	    	.data(world.features)
            .enter().append("path")
            .attr("class", "country")
            .attr("d", projection);


        fillMap();
        setAxis();
	}

	function setAxis() {
		var chartWidth = 200,
			chartHeight = 50;

	    var chartX = d3.time.scale()
            .domain([1993, 2014])
            .range([0, chartWidth]);

        var chartY = d3.scale.linear()
            .domain([0, 100])
            .range([chartHeight, 0]);

        var chartXAxis = d3.svg.axis()
            .scale(chartX)
            .orient("bottom")
            .tickValues(chartX.domain())
            .tickFormat(d3.format(".0f"));

        var chartYAxis = d3.svg.axis()
            .scale(chartY)
            .orient("left")
            .tickValues(chartY.domain())
            .tickFormat(function(d) { return d + "%"; });


        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(40,70)")
            .call(chartXAxis);

        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(40, 20)")
            .call(chartYAxis);
	}

	function fillMap() {
		var current = 2014;

		svg.selectAll('.country')
		.style('fill', function(elem) {
			var color = getColor(elem.properties[current]);
			return color || defaultColor;
		});
	}

	init();

})();