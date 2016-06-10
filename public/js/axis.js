(function() {
    console.log('app started');

    var width = 1220,
        height = 600,
        svg,
        employees = [
            {dept: 'A', age : 22},
            {dept: 'B', age : 26},
            {dept: 'C', age : 35},
            {dept: 'D', age : 30},
            {dept: 'E', age : 27}
        ];

    function init() {
        svg = d3.select('#map').append('svg')
            .attr({
                width: width,
                height: height
            });


        var chartX = d3.time.scale()
            .domain(
                employees.map(function(d) {
                    return d.dept;
                })
            )
            .range([0, chartWidth]);

        var chartY = d3.scale.linear()
            .range([chartHeight, 0]);

        var chartXAxis = d3.svg.axis()
            .scale(chartX)
            .orient('bottom')
            .tickFormat(d3.format('.0f'));

        var chartYAxis = d3.svg.axis()
            .scale(chartY)
            .orient('left')
            .tickSize(width)
            .tickValues(chartY.domain());


    }

    init();
})();