(function pattrn(){

    var _map;
    var markerChart = null;
    var bounds;
    var filterByBounds = false;
    var innerFilter=false;
    var brushOn = true;
    var zooming=false;
    var blockpopup = false;

    // Bug fix for dropdown sub-menu
    $(document).ready(function(){
        $(".dropdown-submenu").each(function(){
            var submenu = $(this).find(".dropdown-menu");
            submenu.find("li").each(function(){
                var item = $(this);
                item.click(function(){
                    submenu.find("li").removeClass("active");
                });
            });
        });
    });

    // Load the json file with the local settings
    d3.json("js/config.json", function(config) {

        $('#edit_dropdown').append(
            "<li><a target='_blank' href=" + config.script_url + "new" + " class='noMargin'>Add a new event</a></li>"
        );

        // Get data from
        $(document).ready(function() { init_table(); });

        function init_table() {
            Tabletop.init({
                key: config.public_spreadsheet,
                callback: consume_table,
                simpleSheet: false
            });
        }

        function consume_table(data) {

            // SETTINGS
            var settings = data.Settings.elements;

            // Title
            var platformTitle = document.getElementById('platformTitle')
            .innerHTML = settings[0].title;

            // Subtitle
            var platformSubtitle = document.getElementById('platformSubtitle')
            .innerHTML = settings[0].subtitle;

            // About modal
            var aboutModalContent = document.getElementById('aboutModalContent')
            .innerHTML = settings[0].about;

            // Highlight colour
            var highlightColour = settings[0].colour;
            elements = document.getElementById("highlight");
            elements.style.backgroundColor = highlightColour;
            $('.filter').css('color', highlightColour);

            // DATA
            var dataset = data.Data.elements;

            // Make new column with eventID for the charts / markers
            for (i = 0; i < dataset.length; i++) {
                dataset[i].eventID = i;
            }

            // Get the headers in an array of strings
            var headers = Object.keys(dataset[0]);

            // Extract columns for integers (hardcoded to mirror spreadsheet)
            var integer_fields_names = [headers[11], headers[12], headers[13], headers[14], headers[15]];

            var number_field_name_1 = headers[8];
            var number_field_name_2 = headers[9];
            var number_field_name_3 = headers[10];
            var number_field_name_4 = headers[11];
            var number_field_name_5 = headers[12];

            // Extract columns for tags (hardcoded to mirror spreadsheet)
            var tag_fields_names = [headers[16], headers[17], headers[18], headers[19], headers[20]];
            var tags_field_name_1 = headers[13];
            var tags_field_name_2 = headers[14];
            var tags_field_name_3 = headers[15];
            var tags_field_name_4 = headers[16];
            var tags_field_name_5 = headers[17];

            // Extract columns for booleans (hardcoded to mirror spreadsheet)
            var boolean_field_name_1 = headers[18];
            var boolean_field_name_2 = headers[19];
            var boolean_field_name_3 = headers[20];
            var boolean_field_name_4 = headers[21];
            var boolean_field_name_5 = headers[22];

            // Extract columns for source
            var source_field_name = headers[7];

            // Extract columns for media available
            var media_field_name = headers[26];

            var value_tags_field_name_1 = map(dataset, function(item) { return item[tags_field_name_1]; }).join("");
            var value_tags_field_name_2 = map(dataset, function(item) { return item[tags_field_name_2]; }).join("");
            var value_tags_field_name_3 = map(dataset, function(item) { return item[tags_field_name_3]; }).join("");
            var value_tags_field_name_4 = map(dataset, function(item) { return item[tags_field_name_4]; }).join("");
            var value_tags_field_name_5 = map(dataset, function(item) { return item[tags_field_name_5]; }).join("");

            var value_boolean_field_name_1 = map(dataset, function(item) { return item[boolean_field_name_1]; }).join("");
            var value_boolean_field_name_2 = map(dataset, function(item) { return item[boolean_field_name_2]; }).join("");
            var value_boolean_field_name_3 = map(dataset, function(item) { return item[boolean_field_name_3]; }).join("");
            var value_boolean_field_name_4 = map(dataset, function(item) { return item[boolean_field_name_4]; }).join("");
            var value_boolean_field_name_5 = map(dataset, function(item) { return item[boolean_field_name_5]; }).join("");

            // Add 'Unknown' to empty tag fields
            for (i = 0; i < dataset.length; i++) {
                if (dataset[i][tags_field_name_1].length === 0) {
                    dataset[i][tags_field_name_1] = 'Unknown';
                }
                if (dataset[i][tags_field_name_2].length === 0) {
                    dataset[i][tags_field_name_2] = 'Unknown';
                }
                if (dataset[i][tags_field_name_3].length === 0) {
                    dataset[i][tags_field_name_3] = 'Unknown';
                }
                if (dataset[i][tags_field_name_4].length === 0) {
                    dataset[i][tags_field_name_4] = 'Unknown';
                }
                if (dataset[i][tags_field_name_5].length === 0) {
                    dataset[i][tags_field_name_5] = 'Unknown';
                }
            }

            // Add 'Unknown' to empty boolean fields
            for (i=0; i<dataset.length; i++) {
                if (dataset[i][boolean_field_name_1].length === 0) {
                    dataset[i][boolean_field_name_1] = 'Unknown';
                }
                if (dataset[i][boolean_field_name_2].length === 0) {
                    dataset[i][boolean_field_name_2] = 'Unknown';
                }
                if (dataset[i][boolean_field_name_3].length === 0) {
                    dataset[i][boolean_field_name_3] = 'Unknown';
                }
                if (dataset[i][boolean_field_name_4].length === 0) {
                    dataset[i][boolean_field_name_4] = 'Unknown';
                }
                if (dataset[i][boolean_field_name_5].length === 0) {
                    dataset[i][boolean_field_name_5] = 'Unknown';
                }
            }

            // Fill nan - Replace null value with zeros
            for (i=0; i<dataset.length; i++) {

                if (dataset[i][number_field_name_1] === "") {
                    dataset[i][number_field_name_1] = 0;
                }
                if (dataset[i][number_field_name_2] === "") {
                    dataset[i][number_field_name_2] = 0;
                }
                if (dataset[i][number_field_name_3] === "") {
                    dataset[i][number_field_name_3] = 0;
                }
                if (dataset[i][number_field_name_4] === "") {
                    dataset[i][number_field_name_4] = 0;
                }
                if (dataset[i][number_field_name_5] === "") {
                    dataset[i][number_field_name_5] = 0;
                }
            }

            // Parse time
            var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');

            dataset.forEach(function (d) {
                d.dd = dateFormat.parse(d.date_time);
            });

            // Set up charts
            var scatterWidth = document.getElementById('charts').offsetWidth;
            var chartHeight = 200;
            var tagChartHeight = 350;

            // Crossfilter
            var xf = crossfilter(dataset);

            // Search
            var searchDimension = xf.dimension(function(d) {
                return [d.event_ID, d.event_summary, d.source_name, d.location_name,
                d[tags_field_name_1], d[tags_field_name_2], d[tags_field_name_3],
                d[tags_field_name_4], d[tags_field_name_5]];
            });

            $("#tableSearch").on('input', function () {
                text_filter(searchDimension, this.value);
            });

            function text_filter(dim, queriedText) {

                var regex = new RegExp(queriedText, "i");

                if (queriedText) {
                    // Filter when the query matches any sequence of chars in the data
                    dim.filter(function(d) {
                        return regex.test(d);
                    });
                }

                // Else clear the filters
                else {
                    dim.filterAll();
                }

                dc.redrawAll();
            }

            var filterOn = document.getElementById("filterList");
            tooltip = "Tooltip Text";
            $('.activeFilter').attr('title', tooltip);

            function map(array, callback) {
                var result = [];
                var i;

                for (i = 0; i < array.length; ++i) {
                    result.push(callback(array[i]));
                }

                return result;
            }

            // Make array of string values of the whole columns for line charts
            var line_charts_string_values = [];
            for (i = 0; i<integer_fields_names.length; i++) {
                line_charts_string_values.push({
                    "string_values_chart" : map(dataset, function(item) { return item[integer_fields_names[i]]; }).join("")
                });
            }

            var values_number_field_name_4 = map(dataset, function(item) { return item[number_field_name_4]; }).join("");

            // LINE CHART 1 - Integer
            var values_number_field_name_1 = map(dataset, function(item) { return item[number_field_name_1]; }).join("");

            if (values_number_field_name_1 > 0) {

                // Menu item
                var line_chart_01_title = document.getElementById('line_chart_01_title')
                .innerHTML = number_field_name_1 + " over time";

                var line_chart_01_chartTitle = document.getElementById('line_chart_01_chartTitle').innerHTML = number_field_name_1 + " over time";

                var line_chart_01 = dc.lineChart("#d3_line_chart_01");
                var line_chart_01_dimension = xf.dimension(function(d) { return +d3.time.day(d.dd);});
                var line_chart_01_group = line_chart_01_dimension.group().reduceSum(function(d) { return d[number_field_name_1]; });

                line_chart_01.width(scatterWidth)
                  .height(chartHeight)
                  .margins({top: 0, right: 50, bottom: 50, left: 50})
                  .dimension(line_chart_01_dimension)
                  .group(line_chart_01_group)
                  .title(function(d) {return ('Total number of events: ' + d.value ); })
                  .x(d3.time.scale().domain(d3.extent(dataset, function(d) {return d.dd; })))
                  .renderHorizontalGridLines(true)
                  .renderVerticalGridLines(true)
                  .yAxisLabel("no. of" + line_chart_01_title)
                  .elasticY(true)
                  .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                  .brushOn(true)
                  .xAxis();

                line_chart_01.yAxis().ticks(3);
                line_chart_01.turnOnControls(true);
                line_chart_01.xAxis().tickFormat(d3.time.format("%d-%m-%y"));

                // AGGREGATE COUNT CHART
                var agreggateCountTitle_01 = document.getElementById('agreggateCountTitle_01')
                  .innerHTML = "Aggregate count in:" + "<br>" + "'" + number_field_name_1 + "'";

                var aggregate_count_01 = dc.numberDisplay("#d3_aggregate_count_01");
                aggregate_count_01_dimension = xf.dimension(function(d) {return +d[number_field_name_1];});
                aggregate_count_01_group = aggregate_count_01_dimension.groupAll().reduce(
                    function (p, v) {
                        ++p.n;
                        p.tot += parseInt(v[number_field_name_1]);
                        return p;
                    },
                    function (p, v) {
                        --p.n;
                        p.tot -= parseInt(v[number_field_name_1]);
                        return p;
                    },
                    function () { return {n:0,tot:0}; }
                );

                var average_value = function(d) {
                    return d.n ? d.tot : 0;
                };

                aggregate_count_01
                    .valueAccessor(average_value)
                    .formatNumber(d3.format("d"))
                    .group(aggregate_count_01_group);

                var SliderChart_01 = dc.lineChart("#SliderChart_01");
                var SliderChart_01_Dim = xf.dimension(function(d) { return +d[number_field_name_1];});
                var SliderChart_01_Group = SliderChart_01_Dim.group();
                var SliderChart_01_Max_Value = d3.max(dataset, function(d) { return +d[number_field_name_1];} );

                SliderChart_01.width(125)
                    .height(chartHeight / 3)
                    .transitionDuration(500)
                    .margins({top: 0, right: 10, bottom: 30, left: 4})
                    .dimension(SliderChart_01_Dim)
                    .group(SliderChart_01_Group)
                    .colors(["red"])
                    .renderlet(function(chart) {
                        // set svg background colour
                        chart.svg().select('.chart-body').append('rect').attr('fill', '#3e4651').attr('height', chartHeight).attr('width', 300);
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .x(d3.scale.linear().domain([0, (SliderChart_01_Max_Value + 1)]));
                    SliderChart_01.xAxis().ticks(3);
            }

            // LINE CHART 2 - Integer
            var values_number_field_name_2 = map(dataset, function(item) { return item[number_field_name_2]; }).join("");

            if (values_number_field_name_2 > 0) {

                var line_chart_02_title = document.getElementById('line_chart_02_title')
                .innerHTML = number_field_name_2 + " over time";
                var line_chart_02_chartTitle = document.getElementById('line_chart_02_chartTitle').innerHTML = number_field_name_2 + " over time";

                var line_chart_02 = dc.lineChart("#d3_line_chart_02");
                var line_chart_02_dimension = xf.dimension(function(d) { return +d3.time.day(d.dd);});
                var line_chart_02_group = line_chart_02_dimension.group().reduceSum(function(d) { return d[number_field_name_2]; });

                line_chart_02.width(scatterWidth)
                    .height(chartHeight)
                    .margins({top: 0, right: 50, bottom: 50, left: 50})
                    .dimension(line_chart_02_dimension)
                    .group(line_chart_02_group)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.time.scale().domain(d3.extent(dataset, function(d) { return d.dd; })))
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .yAxisLabel("no. of" + line_chart_02_title)
                    .elasticY(true)
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .brushOn(true)
                    .xAxis();

                line_chart_02.yAxis().ticks(3);
                line_chart_02.xAxis().tickFormat(d3.time.format("%d-%m-%y"));

                // AGGREGATE COUNT CHART
                var agreggateCountTitle_02 = document.getElementById('agreggateCountTitle_02').innerHTML = "Aggregate count in:" + "<br>" + "'" + number_field_name_2 + "'";

                var aggregate_count_02 = dc.numberDisplay("#d3_aggregate_count_02");
                aggregate_count_02_dimension = xf.dimension(function(d) {return +d[number_field_name_2];});
                aggregate_count_02_group = aggregate_count_02_dimension.groupAll().reduce(
                    function (p, v) {
                        ++p.n;
                        p.tot += parseInt(v[number_field_name_2]);
                        return p;
                    },
                    function (p, v) {
                        --p.n;
                        p.tot -= parseInt(v[number_field_name_2]);
                        return p;
                    },
                    function () { return {n:0,tot:0}; }
                );

                var average_02 = function(d) {
                    return d.n ? d.tot : 0;
                };

                aggregate_count_02
                    .valueAccessor(average_02)
                    .formatNumber(d3.format("d"))
                    .group(aggregate_count_02_group);

                var SliderChart_02 = dc.lineChart("#SliderChart_02");
                var SliderChart_02_Dim = xf.dimension(function(d) { return d[number_field_name_2];});
                var SliderChart_02_Group = SliderChart_02_Dim.group();
                var SliderChart_02_Max_Value = d3.max(dataset, function(d) { return +d[number_field_name_2];} );

                SliderChart_02.width(125)
                    .height(chartHeight / 3)
                    .transitionDuration(500)
                    .margins({top: 0, right: 10, bottom: 30, left: 4})
                    .dimension(SliderChart_02_Dim)
                    .group(SliderChart_02_Group)
                    .renderlet(function(chart) {
                        chart.svg().select('.chart-body').append('rect').attr('fill', '#3e4651').attr('height', chartHeight).attr('width', 300);
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .x(d3.scale.linear().domain([0, (SliderChart_02_Max_Value + 1)]));
                SliderChart_02.xAxis().ticks(3);
            }

            // LINE CHART 3 - Integer
            var values_number_field_name_3 = map(dataset, function(item) { return item[number_field_name_3]; }).join("");

            if (values_number_field_name_3 > 0) {

                var line_chart_03_title = document.getElementById('line_chart_03_title').innerHTML = number_field_name_3 + " over time";
                var line_chart_03_chartTitle = document.getElementById('line_chart_03_chartTitle').innerHTML = number_field_name_3 + " over time";

                var line_chart_03 = dc.lineChart("#d3_line_chart_03");
                var line_chart_03_dimension = xf.dimension(function(d) { return +d3.time.day(d.dd);});
                var line_chart_03_group = line_chart_03_dimension.group().reduceSum(function(d) { return d[number_field_name_3]; });

                line_chart_03.width(scatterWidth)
                    .height(chartHeight)
                    .margins({top: 0, right: 50, bottom: 50, left: 50})
                    .dimension(line_chart_03_dimension)
                    .group(line_chart_03_group)
                    .transitionDuration(500)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.time.scale().domain(d3.extent(dataset, function(d) { return d.dd; })))
                    .yAxisLabel("no. of" + line_chart_03_title)
                    .elasticY(true)
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .brushOn(true)
                    .xAxis();

                line_chart_03.yAxis().ticks(3);
                line_chart_03.xAxis().tickFormat(d3.time.format("%d-%m-%y"));

                // AGGREGATE COUNT CHART
                var agreggateCountTitle_03 = document.getElementById('agreggateCountTitle_03').innerHTML = "Aggregate count in:" + "<br>" + "'" + number_field_name_3 + "'";

                var aggregate_count_03 = dc.numberDisplay("#d3_aggregate_count_03");
                aggregate_count_03_dimension = xf.dimension(function(d) {return +d[number_field_name_3];});
                aggregate_count_03_group = aggregate_count_03_dimension.groupAll().reduce(
                    function (p, v) {
                        ++p.n;
                        p.tot += parseInt(v[number_field_name_3]);
                        return p;
                    },
                    function (p, v) {
                        --p.n;
                        p.tot -= parseInt(v[number_field_name_3]);
                        return p;
                    },
                    function () { return {n:0,tot:0}; }
                );

                var average_03 = function(d) {
                    return d.n ? d.tot : 0;
                };

                aggregate_count_03
                    .valueAccessor(average_03)
                    .formatNumber(d3.format("d"))
                    .group(aggregate_count_03_group);

                var SliderChart_03 = dc.lineChart("#SliderChart_03");
                var SliderChart_03_Dim = xf.dimension(function(d) { return +d[number_field_name_3];});
                var SliderChart_03_Group = SliderChart_03_Dim.group();
                var SliderChart_03_Max_Value = d3.max(dataset, function(d) { return +d[number_field_name_3];} );


                SliderChart_03.width(125)
                    .height(chartHeight / 3)
                    .transitionDuration(500)
                    .margins({top: 0, right: 10, bottom: 30, left: 4})
                    .dimension(SliderChart_03_Dim)
                    .group(SliderChart_03_Group)
                    .colors(["red"])
                    .renderlet(function(chart) {
                        chart.svg().select('.chart-body').append('rect').attr('fill', '#3e4651').attr('height', chartHeight).attr('width', 150);
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .x(d3.scale.linear().domain([0, (SliderChart_03_Max_Value + 1)]))
                    .xAxis();
                SliderChart_03.xAxis().ticks(3);

            }


            // LINE CHART 4 - Integer
            var values_number_field_name_4 = map(dataset, function(item) { return item[number_field_name_4]; }).join("");

            if (values_number_field_name_4 > 0) {
                var line_chart_04_contents = document.getElementById('line_chart_04_title').innerHTML = number_field_name_4 + " over time";

                var line_chart_04_chartTitle = document.getElementById('line_chart_04_chartTitle').innerHTML = number_field_name_4 + " over time";

                var line_chart_04 = dc.lineChart("#d3_line_chart_04");
                var line_chart_04_dimension = xf.dimension(function(d) { return +d3.time.day(d.dd);});
                var line_chart_04_group = line_chart_04_dimension.group().reduceSum(function(d) { return d[number_field_name_3]; });

                line_chart_04.width(scatterWidth)
                    .height(chartHeight)
                    .margins({top: 0, right: 50, bottom: 50, left: 50})
                    .dimension(line_chart_04_dimension)
                    .group(line_chart_04_group)
                    .transitionDuration(500)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.time.scale().domain(d3.extent(dataset, function(d) { return d.dd; })))
                    .yAxisLabel("no. of" + line_chart_04_title)
                    .elasticY(true)
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .brushOn(true)
                    .xAxis();

                line_chart_04.yAxis().ticks(3);
                line_chart_04.xAxis().tickFormat(d3.time.format("%d-%m-%y"));

                // AGGREGATE COUNT CHART
                var agreggateCountTitle_04 = document.getElementById('agreggateCountTitle_04').innerHTML = "Aggregate count in:" + "<br>" + "'" + number_field_name_4 + "'";

                var aggregate_count_04 = dc.numberDisplay("#d3_aggregate_count_04");
                aggregate_count_04_dimension = xf.dimension(function(d) {return +d[number_field_name_4];});
                aggregate_count_04_group = aggregate_count_04_dimension.groupAll().reduce(
                    function (p, v) {
                        ++p.n;
                        p.tot += parseInt(v[number_field_name_4]);
                        return p;
                    },
                    function (p, v) {
                        --p.n;
                        p.tot -= parseInt(v[number_field_name_4]);
                        return p;
                    },
                    function () { return {n:0,tot:0}; }
                );

                var average_04 = function(d) {
                    return d.n ? d.tot : 0;
                };

                aggregate_count_04
                    .valueAccessor(average_04)
                    .formatNumber(d3.format("d"))
                    .group(aggregate_count_04_group);

                var SliderChart_04 = dc.lineChart("#SliderChart_04");
                var SliderChart_04_Dim = xf.dimension(function(d) { return +d[number_field_name_4];});
                var SliderChart_04_Group = SliderChart_04_Dim.group();
                var SliderChart_04_Max_Value = d3.max(dataset, function(d) { return +d[number_field_name_4];} );


                SliderChart_04.width(125)
                    .height(chartHeight / 3)
                    .transitionDuration(500)
                    .margins({top: 0, right: 10, bottom: 30, left: 4})
                    .dimension(SliderChart_04_Dim)
                    .group(SliderChart_04_Group)
                    .colors(["red"])
                    .renderlet(function(chart) {
                        chart.svg().select('.chart-body').append('rect').attr('fill', '#3e4651').attr('height', chartHeight).attr('width', 300);
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .x(d3.scale.linear().domain([0, (SliderChart_04_Max_Value + 1)]));

                 SliderChart_04.xAxis().ticks(3);

            }


            // LINE CHART 5 - Integer
            var values_number_field_name_5 = map(dataset, function(item) { return item[number_field_name_5]; }).join("");

            if (values_number_field_name_5 > 0) {

                var line_chart_05_title = document.getElementById('line_chart_05_title')
                .innerHTML = number_field_name_5 + " over time";

                var line_chart_05_chartTitle = document.getElementById('line_chart_05_chartTitle').innerHTML = number_field_name_5 + " over time";

                var line_chart_05 = dc.lineChart("#d3_line_chart_05");
                var line_chart_05_dimension = xf.dimension(function(d) { return +d3.time.day(d.dd);});
                var line_chart_05_group = line_chart_05_dimension.group().reduceSum(function(d) { return d[number_field_name_3]; });

                line_chart_05.width(scatterWidth)
                    .height(chartHeight)
                    .margins({top: 0, right: 50, bottom: 50, left: 50})
                    .dimension(line_chart_05_dimension)
                    .group(line_chart_05_group)
                    .transitionDuration(500)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.time.scale().domain(d3.extent(dataset, function(d) { return d.dd; })))
                    .yAxisLabel("no. of" + line_chart_05_title)
                    .elasticY(true)
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .brushOn(true)
                    .xAxis();

                line_chart_05.yAxis().ticks(3);
                line_chart_05.xAxis().tickFormat(d3.time.format("%d-%m-%y"));


                // AGGREGATE COUNT CHART
                var agreggateCountTitle_05 = document.getElementById('agreggateCountTitle_05')
                .innerHTML = "Aggregate count in:" + "<br>" + "'" + number_field_name_5 + "'";

                var aggregate_count_05 = dc.numberDisplay("#d3_aggregate_count_05");
                aggregate_count_05_dimension = xf.dimension(function(d) {return +d[number_field_name_5];});
                aggregate_count_05_group = aggregate_count_05_dimension.groupAll().reduce(
                    function (p, v) {
                        ++p.n;
                        p.tot += parseInt(v[number_field_name_5]);
                        return p;
                    },
                    function (p, v) {
                        --p.n;
                        p.tot -= parseInt(v[number_field_name_5]);
                        return p;
                    },
                    function () { return {n:0,tot:0}; }
                );

                var average_05 = function(d) {
                    return d.n ? d.tot : 0;
                };

                aggregate_count_05
                    .valueAccessor(average_05)
                    .formatNumber(d3.format("d"))
                    .group(aggregate_count_05_group);

                var SliderChart_05 = dc.lineChart("#SliderChart_05");
                var SliderChart_05_Dim = xf.dimension(function(d) { return +d[number_field_name_5];});
                var SliderChart_05_Group = SliderChart_05_Dim.group();
                var SliderChart_05_Max_Value = d3.max(dataset, function(d) { return +d[number_field_name_5];} );

                SliderChart_05.width(125)
                    .height(chartHeight / 3)
                    .transitionDuration(500)
                    .margins({top: 0, right: 10, bottom: 30, left: 4})
                    .dimension(SliderChart_05_Dim)
                    .group(SliderChart_05_Group)
                    .colors(["red"])
                    .renderlet(function(chart) {
                        chart.svg().select('.chart-body').append('rect').attr('fill', '#3e4651').attr('height', chartHeight).attr('width', 300);
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    // .x(d3.scale.linear().domain(d3.extent(dataset, function(d) { return +d[number_field_name_1]; })))
                    .x(d3.scale.linear().domain([0, (SliderChart_05_Max_Value + 1)]))
                    .xAxis();

                SliderChart_05.xAxis().ticks(3);

            }

            // BAR CHART 01 - TAGS
            if (value_tags_field_name_1.length > 0) {

                var bar_chart_01_title = document.getElementById('bar_chart_01_title');
                bar_chart_01_title.innerHTML = "Events by " + tags_field_name_1;
                var bar_chart_01_chartTitle = document.getElementById('bar_chart_01_chartTitle').innerHTML = "Events by " + tags_field_name_1;

                var bar_chart_01 = dc.barChart("#d3_bar_chart_01");
                var bar_chart_01_dimension = xf.dimension(function(d) { return d[tags_field_name_1]; });

                // REDUCE FUNCTION
                function reduceAddTarget_01(p, v) {
                    v[tags_field_name_1].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) + 1; //increment counts
                    });
                    return p;
                }

                function reduceRemoveTarget_01(p, v) {
                    v[tags_field_name_1].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) - 1; //decrement counts
                    });
                    return p;
                }

                function reduceInitialTarget_01() {
                    return {};
                }

                var bar_chart_01_group = bar_chart_01_dimension.groupAll().reduce(reduceAddTarget_01, reduceRemoveTarget_01, reduceInitialTarget_01).value();

                bar_chart_01_group.all = function() {
                    var newObject = [];
                    for (var key in this) {
                        if (this.hasOwnProperty(key) && key != "all") {
                            newObject.push({
                                key: key,
                                value: this[key]
                            });
                        }
                    }
                    return newObject;
                };

                bar_chart_01
                    .width(scatterWidth)
                    .height(tagChartHeight)
                    .dimension(bar_chart_01_dimension)
                    .group(bar_chart_01_group)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .margins({top: 0, right: 50, bottom: 200, left: 50})
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .renderlet(function (chart) {
                        chart.selectAll("g.x text")
                        .style("text-anchor", "end")
                        .style("font-size", "10px")
                        .attr('dx', '0')
                        .attr('dy', '10')
                        .attr('transform', "rotate(-45)");
                        chart.selectAll('.x-axis-label')
                        .attr('transform', "translate(400, 250)");
                    })
                    .filterHandler (function (dimension, filters) {
                        dimension.filter(null);
                        dimension.filterFunction(function (d) {
                            for (var i=0; i < filters.length; i++) {
                                if (d.indexOf(filters[i]) <0) return false;
                            }
                            return true;
                        });
                        return filters;
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);

                bar_chart_01.yAxis().ticks(3);

            }


            // BAR CHART 02 - TAGS
            if (value_tags_field_name_2.length > 0) {

                // REDUCE FUNCTION
                function reduceAddTarget_02(p, v) {
                    v[tags_field_name_2].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) + 1; //increment counts
                    });
                    return p;
                }

                function reduceRemoveTarget_02(p, v) {
                    v[tags_field_name_2].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) - 1; //decrement counts
                    });
                    return p;
                }

                function reduceInitialTarget_02() {
                    return {};
                }

                var bar_chart_02_title = document.getElementById('bar_chart_02_title')
                bar_chart_02_title.innerHTML = "Events by " + tags_field_name_2;

                var bar_chart_02_chartTitle = document.getElementById('bar_chart_02_chartTitle').innerHTML = "Events by " + tags_field_name_2;

                var bar_chart_02 = dc.barChart("#d3_bar_chart_02");
                var bar_chart_02_dimension = xf.dimension(function(d) { return d[tags_field_name_2]; });
                var bar_chart_02_group = bar_chart_02_dimension.groupAll().reduce(reduceAddTarget_02, reduceRemoveTarget_02, reduceInitialTarget_02).value();

                bar_chart_02_group.all = function() {
                    var newObject = [];
                    for (var key in this) {
                        if (this.hasOwnProperty(key) && key != "all") {
                            newObject.push({
                                key: key,
                                value: this[key]
                            });
                        }
                    }
                    return newObject;
                };

                bar_chart_02.width(scatterWidth)
                    .height(tagChartHeight)
                    .dimension(bar_chart_02_dimension)
                    .group(bar_chart_02_group)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .margins({top: 0, right: 50, bottom: 200, left: 50})
                    .xUnits(dc.units.ordinal)
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .renderlet(function (chart) {
                        chart.selectAll("g.x text")
                        .style("text-anchor", "end")
                        .style("font-size", "10px")
                        .attr('dx', '0')
                        .attr('dy', '10')
                        .attr('transform', "rotate(-45)");
                        chart.selectAll('.x-axis-label')
                        .attr('transform', "translate(400, 250)");
                    })
                    .elasticY(true)
                    .filterHandler (function (dimension, filters) {
                        dimension.filter(null);
                        dimension.filterFunction(function (d) {
                            for (var i=0; i < filters.length; i++) {
                                if (d.indexOf(filters[i]) <0) return false;
                            }
                            return true;
                        });
                        return filters;
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);

                bar_chart_02.yAxis().ticks(3);

            }


            // BAR CHART 03 - TAGS
            if (value_tags_field_name_3.length > 0) {

                // REDUCE FUNCTION
                function reduceAddTarget_03(p, v) {
                    v[tags_field_name_3].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) + 1; //increment counts
                    });
                    return p;
                }

                function reduceRemoveTarget_03(p, v) {
                    v[tags_field_name_3].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) - 1; //decrement counts
                    });
                    return p;
                }

                function reduceInitialTarget_03() {
                    return {};
                }

                var bar_chart_03_title = document.getElementById('bar_chart_03_title');
                bar_chart_03_title.innerHTML = "Events by " + tags_field_name_3;
                var bar_chart_03_chartTitle = document.getElementById('bar_chart_03_chartTitle').innerHTML = "Events by " + tags_field_name_3;

                var bar_chart_03 = dc.barChart("#d3_bar_chart_03");
                var bar_chart_03_dimension = xf.dimension(function(d) { return d[tags_field_name_3]; });
                var bar_chart_03_group = bar_chart_03_dimension.groupAll().reduce(reduceAddTarget_03, reduceRemoveTarget_03, reduceInitialTarget_03).value();

                bar_chart_03_group.all = function() {
                    var newObject = [];
                    for (var key in this) {
                        if (this.hasOwnProperty(key) && key != "all") {
                            newObject.push({
                                key: key,
                                value: this[key]
                            });
                        }
                    }
                    return newObject;
                };

                bar_chart_03
                    .width(scatterWidth)
                    .height(tagChartHeight)
                    .dimension(bar_chart_03_dimension)
                    .group(bar_chart_03_group)
                    .margins({top: 0, right: 50, bottom: 200, left: 50})
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .xAxisPadding(500)
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .renderlet(function (chart) {
                        chart.selectAll("g.x text")
                        .style("text-anchor", "end")
                        .style("font-size", "10px")
                        .attr('dx', '0')
                        .attr('dy', '10')
                        .attr('transform', "rotate(-45)");

                        chart.selectAll('.x-axis-label')
                        .attr('transform', "translate(400, 250)");
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);

                bar_chart_03.yAxis().ticks(3);
            }

            // BAR CHART 04 - TAGS
            if (value_tags_field_name_4.length > 0) {


                // REDUCE FUNCTION
                function reduceAddTarget_04(p, v) {
                    v[tags_field_name_4].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) + 1; //increment counts
                    });
                    return p;
                }

                function reduceRemoveTarget_04(p, v) {
                    v[tags_field_name_4].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) - 1; //decrement counts
                    });
                    return p;
                }

                function reduceInitialTarget_04() {
                    return {};
                }

                var bar_chart_04_title = document.getElementById('bar_chart_04_title').innerHTML = "Events by " + tags_field_name_4;
                var bar_chart_04_chartTitle = document.getElementById('bar_chart_04_chartTitle').innerHTML = "Events by " + tags_field_name_4;

                var bar_chart_04 = dc.barChart("#d3_bar_chart_04");
                var bar_chart_04_dimension = xf.dimension(function(d) { return d[tags_field_name_4]; });
                var bar_chart_04_group = bar_chart_04_dimension.groupAll().reduce(reduceAddTarget_04, reduceRemoveTarget_04, reduceInitialTarget_04).value();

                bar_chart_04_group.all = function() {
                    var newObject = [];
                    for (var key in this) {
                        if (this.hasOwnProperty(key) && key != "all") {
                            newObject.push({
                                key: key,
                                value: this[key]
                            });
                        }
                    }
                    return newObject;
                };

                bar_chart_04
                    .width(scatterWidth)
                    .height(tagChartHeight)
                    .dimension(bar_chart_04_dimension)
                    .group(bar_chart_04_group)
                    .margins({top: 0, right: 50, bottom: 200, left: 50})
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .xAxisPadding(500)
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .renderlet(function (chart) {
                        chart.selectAll("g.x text")
                        .style("text-anchor", "end")
                        .style("font-size", "10px")
                        .attr('dx', '0')
                        .attr('dy', '10')
                        .attr('transform', "rotate(-45)");

                        chart.selectAll('.x-axis-label')
                        .attr('transform', "translate(400, 358)");
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);

                bar_chart_04.yAxis().ticks(3);
            }

            // BAR CHART 05 - TAGS

            if (value_tags_field_name_5.length > 0) {

                // CUSTOM REDUCE FUNCTION
                function reduceAddTarget_05(p, v) {
                    v[tags_field_name_5].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) + 1; //increment counts
                    });
                    return p;
                }

                function reduceRemoveTarget_05(p, v) {
                    v[tags_field_name_5].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) - 1; //decrement counts
                    });
                    return p;
                }

                function reduceInitialTarget_05() {
                    return {};
                }

                var bar_chart_05_title = document.getElementById('bar_chart_05_title').innerHTML = "Events by " + tags_field_name_5;
                var bar_chart_05_chartTitle = document.getElementById('bar_chart_05_chartTitle').innerHTML = "Events by " + tags_field_name_5;

                var bar_chart_05 = dc.barChart("#d3_bar_chart_05");
                var bar_chart_05_dimension = xf.dimension(function(d) { return d[tags_field_name_5]; });
                var bar_chart_05_group = bar_chart_05_dimension.groupAll().reduce(reduceAddTarget_05, reduceRemoveTarget_05, reduceInitialTarget_05).value();

                bar_chart_05_group.all = function() {
                    var newObject = [];
                    for (var key in this) {
                        if (this.hasOwnProperty(key) && key != "all") {
                            newObject.push({
                                key: key,
                                value: this[key]
                            });
                        }
                    }
                    return newObject;
                };

                bar_chart_05
                    .width(scatterWidth)
                    .height(tagChartHeight)
                    .dimension(bar_chart_05_dimension)
                    .group(bar_chart_05_group)
                    .margins({top: 0, right: 50, bottom: 200, left: 50})
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .xAxisPadding(500)
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .renderlet(function (chart) {
                        chart.selectAll("g.x text")
                        .style("text-anchor", "end")
                        .style("font-size", "10px")
                        .attr('dx', '0')
                        .attr('dy', '10')
                        .attr('transform', "rotate(-45)");

                        chart.selectAll('.x-axis-label')
                        .attr('transform', "translate(400, 358)");
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);

                bar_chart_05.yAxis().ticks(3);
            }

            // BOOLEAN CHART 01 - BOOLEAN
            if (value_boolean_field_name_1.length > 0) {

                var boolean_chart_01_title = document.getElementById('boolean_chart_01_title').innerHTML = boolean_field_name_1;
                var boolean_chart_01_chartTitle = document.getElementById('boolean_chart_01_chartTitle').innerHTML = "Events by " + boolean_field_name_1;

                var boolean_chart_01 = dc.barChart("#d3_boolean_chart_01");
                var boolean_chart_01_dimension = xf.dimension(function(d) { return d[boolean_field_name_1]; });
                var boolean_chart_01_group = boolean_chart_01_dimension.group().reduceCount();

                boolean_chart_01.width(scatterWidth)
                    .height(chartHeight)
                    .margins({top: 0, right: 50, bottom: 50, left: 50})
                    .dimension(boolean_chart_01_dimension)
                    .group(boolean_chart_01_group)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .barPadding(0.1)
                    .outerPadding(0.05);

                boolean_chart_01.yAxis().ticks(3);

            }

            // BOOLEAN CHART 02 - BOOLEAN
            if (value_boolean_field_name_2.length > 0) {

                var boolean_chart_02_title = document.getElementById('boolean_chart_02_title').innerHTML = boolean_field_name_2;
                var boolean_chart_02_chartTitle = document.getElementById('boolean_chart_02_chartTitle').innerHTML = "Events by " + boolean_field_name_2;

                var boolean_chart_02 = dc.barChart("#d3_boolean_chart_02");
                var boolean_chart_02_dimension = xf.dimension(function(d) { return d[boolean_field_name_2]; });
                var boolean_chart_02_group = boolean_chart_02_dimension.group().reduceCount();

                boolean_chart_02.width(scatterWidth)
                    .height(chartHeight)
                    .margins({top: 0, right: 50, bottom: 50, left: 50})
                    .dimension(boolean_chart_02_dimension)
                    .group(boolean_chart_02_group)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);

                boolean_chart_02.yAxis().ticks(3);
            }

            // BOOLEAN CHART 03 - BOOLEAN
            if (value_boolean_field_name_3.length > 0) {

                var boolean_chart_03_title = document.getElementById('boolean_chart_03_title').innerHTML = boolean_field_name_3;
                var boolean_chart_03_chartTitle = document.getElementById('boolean_chart_03_chartTitle').innerHTML = "Events by " + boolean_field_name_3;

                var boolean_chart_03 = dc.barChart("#d3_boolean_chart_03");
                var boolean_chart_03_dimension = xf.dimension(function(d) { return d[boolean_field_name_3]; });
                var boolean_chart_03_group = boolean_chart_03_dimension.group().reduceCount();

                boolean_chart_03.width(scatterWidth)
                    .height(chartHeight)
                    .margins({top: 0, right: 50, bottom: 50, left: 50})
                    .dimension(boolean_chart_03_dimension)
                    .group(boolean_chart_03_group)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .renderHorizontalGridLines(true)
                    // .xAxisLabel(boolean_chart_03_title)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);

                boolean_chart_03.yAxis().ticks(3);
            }

            // BOOLEAN CHART 04 - BOOLEAN
            if (value_boolean_field_name_4.length > 0) {

                var boolean_chart_04_title = document.getElementById('boolean_chart_04_title').innerHTML = boolean_field_name_4;
                var boolean_chart_04_chartTitle = document.getElementById('boolean_chart_04_chartTitle').innerHTML = "Events by " + boolean_field_name_4;

                var boolean_chart_04 = dc.barChart("#d3_boolean_chart_04");
                var boolean_chart_04_dimension = xf.dimension(function(d) { return d[boolean_field_name_4]; });
                var boolean_chart_04_group = boolean_chart_04_dimension.group().reduceCount();

                boolean_chart_04.width(scatterWidth)
                    .height(chartHeight)
                    .margins({top: 0, right: 50, bottom: 50, left: 50})
                    .dimension(boolean_chart_04_dimension)
                    .group(boolean_chart_04_group)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);

                boolean_chart_04.yAxis().ticks(3);

            }
            // BOOLEAN CHART 05 - BOOLEAN
            if (value_boolean_field_name_5.length > 0) {

                var boolean_chart_05_title = document.getElementById('boolean_chart_05_title').innerHTML = boolean_field_name_5;
                var boolean_chart_05_chartTitle = document.getElementById('boolean_chart_05_chartTitle').innerHTML = "Events by " + boolean_field_name_5;

                var boolean_chart_05 = dc.barChart("#d3_boolean_chart_05");
                var boolean_chart_05_dimension = xf.dimension(function(d) { return d[boolean_field_name_5]; });
                var boolean_chart_05_group = boolean_chart_05_dimension.group().reduceCount();

                boolean_chart_05.width(scatterWidth)
                    .height(chartHeight)
                    .margins({top: 0, right: 50, bottom: 50, left: 50})
                    .dimension(boolean_chart_05_dimension)
                    .group(boolean_chart_05_group)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);
                boolean_chart_05.yAxis().ticks(3);
            }

            // timeline by EVENTS
                var event_chart_01_chartTitle = document.getElementById('event_chart_01_chartTitle').innerHTML = "Number of Events over Time";

                var event_chart_01 = dc.lineChart("#d3_event_chart_01");
                var event_chart_01_dimension = xf.dimension(function(d) { return +d3.time.day(d.dd);});
                var event_chart_01_group = event_chart_01_dimension.group().reduceCount(function(d) { return +d3.time.day(d.dd);});

                event_chart_01.width(scatterWidth)
                    .height(chartHeight)
                    .margins({top: 0, right: 50, bottom: 50, left: 50})
                    .dimension(event_chart_01_dimension)
                    .group(event_chart_01_group)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.time.scale().domain(d3.extent(dataset, function(d) { return d.dd; })))
                    .renderHorizontalGridLines(true)
                    .renderVerticalGridLines(true)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .brushOn(true)
                    .xAxis();

                event_chart_01.yAxis().ticks(3);
                event_chart_01.turnOnControls(true);
                event_chart_01.xAxis().tickFormat(d3.time.format("%d-%m-%y"));

            // TOTAL EVENTS
            var number_of_events = dc.dataCount("#number_total_events").dimension(xf).group(xf.groupAll());


            // SOURCE CHART - TAGS
            // REDUCE FUNCTION
                function reduceAddTarget_source(p, v) {
                    v[source_field_name].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) + 1; //increment counts
                    });
                    return p;
                }

                function reduceRemoveTarget_source(p, v) {
                    v[source_field_name].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) - 1; //decrement counts
                    });
                    return p;
                }

                function reduceInitialTarget_source() {
                    return {};
                }


                var source_chart = dc.barChart("#d3_source_chart");
                var source_chart_dimension = xf.dimension(function(d) { return d[source_field_name]; });
                var source_chart_group = source_chart_dimension.groupAll().reduce(reduceAddTarget_source, reduceRemoveTarget_source, reduceInitialTarget_source).value();

                source_chart_group.all = function() {
                    var newObject = [];
                    for (var key in this) {
                        if (this.hasOwnProperty(key) && key != "all") {
                            newObject.push({
                                key: key,
                                value: this[key]
                            });
                        }
                    }
                    return newObject;
                };

                source_chart
                    .width(scatterWidth)
                    .height(tagChartHeight)
                    .dimension(source_chart_dimension)
                    .group(source_chart_group)
                    .margins({top: 0, right: 50, bottom: 200, left: 50})
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    // .xAxisPadding(500)
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .renderlet(function (chart) {
                        chart.selectAll("g.x text")
                        .style("text-anchor", "end")
                        .style("font-size", "10px")
                        .attr('dx', '0')
                        .attr('dy', '10')
                        .attr('transform', "rotate(-45)");
                        chart.selectAll('.x-axis-label')
                        .attr('transform', "translate(400, 250)");
                    })
                    .elasticY(true)
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);

                source_chart.yAxis().ticks(3);

            // MEDIA CHART - TAGS ('empty')
            if (media_field_name.length > 0) {


                // CUSTOM REDUCE FUNCTION
                function reduceAddTarget_media(p, v) {
                    v[media_field_name].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) + 1; //increment counts
                    });
                    return p;
                }

                function reduceRemoveTarget_media(p, v) {
                    v[media_field_name].split(',').forEach (function(val, idx) {
                        p[val] = (p[val] || 0) - 1; //decrement counts
                    });
                    return p;
                }

                function reduceInitialTarget_media() {
                    return {};
                }


                var media_chart = dc.barChart("#d3_media_chart");
                var media_chart_dimension = xf.dimension(function(d) { return d[media_field_name]; });
                var media_chart_group = media_chart_dimension.groupAll().reduce(reduceAddTarget_media, reduceRemoveTarget_media, reduceInitialTarget_media).value();

                media_chart_group.all = function() {
                    var newObject = [];
                    for (var key in this) {
                        if (this.hasOwnProperty(key) && key != "all") {
                            newObject.push({
                                key: key,
                                value: this[key]
                            });
                        }
                    }
                    return newObject;
                };

                media_chart
                    .width(scatterWidth)
                    .height(chartHeight)
                    .dimension(media_chart_dimension)
                    .group(media_chart_group)
                    .title(function(d) { return ('Total number of events: ' + d.value ); })
                    .x(d3.scale.ordinal())
                    .xUnits(dc.units.ordinal)
                    .xAxisPadding(500)
                    .renderHorizontalGridLines(true)
                    .yAxisLabel("no. of events")
                    .elasticY(true)
                    .filterHandler (function (dimension, filters) {
                        dimension.filter(null);
                        dimension.filterFunction(function (d) {
                            for (var i=0; i < filters.length; i++) {
                                if (d.indexOf(filters[i]) <0) return false;
                            }
                            return true;
                        });
                        return filters;
                    })
                    .on("filtered", function (d) { return filterOn.className = "glyphicon glyphicon-filter activeFilter";})
                    .barPadding(0.1)
                    .outerPadding(0.05);

                media_chart.yAxis().ticks(3);
            }


            // Resize charts
            window.onresize = function(event) {
                var newscatterWidth = document.getElementById('charts').offsetWidth;
                event_chart_01.width(newscatterWidth);
                line_chart_01.width(newscatterWidth);
                line_chart_02.width(newscatterWidth);
                line_chart_03.width(newscatterWidth);
                line_chart_04.width(newscatterWidth);
                line_chart_05.width(newscatterWidth);
                line_chart_01.width(newscatterWidth);
                line_chart_02.width(newscatterWidth);
                line_chart_03.width(newscatterWidth);
                line_chart_04.width(newscatterWidth);
                line_chart_05.width(newscatterWidth);
                bar_chart_01.width(newscatterWidth);
                bar_chart_02.width(newscatterWidth);
                bar_chart_03.width(newscatterWidth);
                bar_chart_04.width(newscatterWidth);
                bar_chart_05.width(newscatterWidth);
                boolean_chart_01.width(newscatterWidth);
                boolean_chart_02.width(newscatterWidth);
                boolean_chart_03.width(newscatterWidth);
                boolean_chart_04.width(newscatterWidth);
                boolean_chart_05.width(newscatterWidth);
                dc.renderAll();
            };

            // MARKERS
            dataset.forEach(function(d, i) {
                d.i = i;
                var dayMonthFormat = d3.time.format("%d/%m/%y");
                var fullDateFormat = d3.time.format("%A, %d %B %Y");

                // Marker settings
                d.marker = new L.circleMarker(new L.LatLng(d.latitude, d.longitude),{
                    title: "",
                    radius: 7,
                    color: "black",
                    opacity:0.9,
                    fillOpacity:0.8,
                    clickable: true,
                });

                d.marker.data = d;

                // Tooltip content
                var eventDetailsContent = (
                    "<div class='col-sm-12' style='padding-top:15px' id='background'>" +
                    "<p class='caption-grey'>EVENT ID:  </p><p class='noMargin'>" + d.event_ID + "</p>" +
                    "<p class='caption-grey'>DATE:</p>" +
                    "<p class='noMargin'> " + fullDateFormat(d.dd) + "</p>" +
                    "<p class='caption-grey'>LOCATION: </p>" +
                    "<p class='noMargin'> " + d.location_name + "</p><br/>" +
                    "</div>"
                );

                // Summary content
                var summaryContent = (
                    "<div class='col-sm-12' style='padding-top:15px' id='infowindow'>" +
                    "<p class='summary'>" + d.event_summary + "</p>" +
                    "<p class='caption-grey'>SOURCE:</p>" +
                    "<p class='summary'>" + d.source_name + "</p><br/>" +
                    "<div class='summaryTable'></div><br/>" +
                    "</div>"
                );

                // set empty popup to leverage leaflet functions
                var hoverContent = "";
                var popup = d.marker.popup = new L.popup()
                    .setLatLng(d.marker.getLatLng())
                    .setContent(hoverContent);

                var content = document.getElementById('dateTime');
                var Summary = document.getElementById('summary');
                var Media = document.getElementById('media');

                d.marker.on("click", function(e) {

                    var image_html = document.getElementById("image_gallery").innerHTML = '';
                    var video_html = document.getElementById("video_gallery").innerHTML = '';
                    var summary_table = document.getElementById("summaryTable").innerHTML = '';
                    var urls = document.getElementById("urls").innerHTML = '';
                    $('.edit_dropdown').remove();

                    if (markerChart.filter() == e.target.data.i) {
                        markerChart.filter(true);
                    } else {

                        $('#edit_dropdown').append(
                            "<li><a target='_blank' href=" + config.script_url + d.event_ID + " class='edit_dropdown noMargin'>Edit this event</a><li>"
                        );

                        // Photos
                        d3.json(e.target.data.photos, function(D) {

                            var json_photos = $.parseJSON('[' + dataset[i].photos + ']');

                            for (j=0; j<json_photos.length; j++) {
                                $('#image_gallery').append(
                                    '<li data-src="' + json_photos[j].src +
                                    '"data-sub-html="' + json_photos[j].subhtml + '" >' +
                                    '<img src="' + json_photos[j].thumb + '"/>' +
                                    '<br/>' +
                                    json_photos[j].caption +
                                    '<p>Source: ' + json_photos[j].source + '</p>' +
                                    '</li>'
                                );
                            }


                            $(document).ready(function() {
                                $("#image_gallery").lightGallery();
                            });

                        });


                        // Videos
                        d3.json(e.target.data.videos, function(D) {

                            var json_videos = $.parseJSON('[' + dataset[i].videos + ']');

                            for (j=0; j<json_videos.length; j++) {
                                $('#video_gallery').append(
                                    '<li style= "list-style-type: none;" data-src="' + json_videos[j].src +
                                    '"data-sub-html="'+ json_videos[j].subhtml +'" id="image_link">' +
                                    '<a href="#"><p>Video: <strong>' + json_videos[j].caption + '</strong></p></a>' +
                                    '<p>Source: ' + json_videos[j].source + '</p>' +
                                    '</li>'
                                );
                            }

                            $(document).ready(function() {
                                $("#video_gallery").lightGallery();
                            });

                        });

                        // Urls
                        d3.json(e.target.data.links, function(D) {

                            var array_urls = $.parseJSON('[' + dataset[i].links + ']');

                            for (j=0; j<array_urls.length; j++) {
                                $('#urls').append(
                                    '<li><a target="_blank" href="' + array_urls[j].url + '"> Title: ' + array_urls[j].title + '</a></li><p style="line-height: 100%"><br/>Subtitle: ' + array_urls[j].subtitle + '</p>'
                                );
                            }

                        });

                        // Open popup
                        e.target.popup.openOn(markerChart.getMap());

                        // Change style of popup
                        $('.leaflet-popup-content-wrapper').addClass('transparent');
                        $('.leaflet-popup-tip').addClass('transparent');
                        $('.leaflet-popup-close-button').addClass('transparent');

                        // Style marker on click
                        d.marker.setRadius(10);
                        d.marker.setStyle({
                            color: highlightColour,
                            fillColor: highlightColour,
                            fillOpacity: 0.8,
                        });

                        // Add infowindow content
                        content.innerHTML = eventDetailsContent;
                        Summary.innerHTML = summaryContent;

                        // Table content - generic functions
                        function appendIntegerValueToTable(field_name) {
                            $('#summaryTable').append(
                                "<tr class='col-sm-12'><th class='col-sm-6'><p>" + field_name +
                                "</p></th> <th class='col-sm-6' ><p class='white'> " + d[field_name] +
                                "</p> </th> </tr>"
                            );
                        }

                        function appendTagValueToTable(field_name) {
                            $('#summaryTable').append(
                                "<tr class='col-sm-12'><th class='col-sm-6'><p>" + field_name +
                                "</p></th><th class='col-sm-6' ><p class='white'> " + d[field_name].split(',').join(', ') +
                                "</p> </th> </tr>"
                            );
                        }

                        // Table content - Integers - hard coded to mirror spreadsheet structure
                        if (values_number_field_name_1 > 0) {
                            appendIntegerValueToTable(number_field_name_1);
                        }

                        if (values_number_field_name_2 > 0) {
                            appendIntegerValueToTable(number_field_name_2);
                        }

                        if (values_number_field_name_3 > 0) {
                            appendIntegerValueToTable(number_field_name_3);
                        }

                        if (values_number_field_name_4 > 0) {
                            appendIntegerValueToTable(number_field_name_4);
                        }

                        if (values_number_field_name_5 > 0) {
                            appendIntegerValueToTable(number_field_name_5);
                        }

                        // Table content - Tags - hard coded to mirror spreadsheet structure
                        if (value_tags_field_name_1.length > 0) {
                            appendTagValueToTable(tags_field_name_1);
                        }

                        if (value_tags_field_name_2.length > 0) {
                            appendTagValueToTable(tags_field_name_2);
                        }

                        if (value_tags_field_name_3.length > 0) {
                            appendTagValueToTable(tags_field_name_3);
                        }

                        if (value_tags_field_name_4.length > 0) {
                            appendTagValueToTable(tags_field_name_4);
                        }

                        if (value_tags_field_name_5.length > 0) {
                            appendTagValueToTable(tags_field_name_5);
                        }

                        // Table content - booleans - hard coded to mirror spreadsheet structure
                        if (value_boolean_field_name_1.length > 0) {
                            appendTagValueToTable(boolean_field_name_1);
                        }

                        if (value_boolean_field_name_2.length > 0) {
                            appendTagValueToTable(boolean_field_name_2);
                        }

                        if (value_boolean_field_name_3.length > 0) {
                            appendTagValueToTable(boolean_field_name_3);
                        }

                        if (value_boolean_field_name_4.length > 0) {
                            appendTagValueToTable(boolean_field_name_4);
                        }

                    }

                    _map.on("popupclose", function(e) {
                        d.marker.setRadius(7);
                        d.marker.setStyle({
                            fillColor: 'black',
                            color: 'black',
                            fillOpacity: 0.8,
                        });
                        content.innerHTML = "<p style='padding-top:15px'>Please click a marker<br><br></p>";
                        Summary.innerHTML = "<p>This panel will update when a marker is clicked</p>";
                        var summary_table = document.getElementById("summaryTable").innerHTML = '';
                        var image_html = document.getElementById("image_gallery").innerHTML = '';
                        var video_html = document.getElementById("video_gallery").innerHTML = '';
                        var urls = document.getElementById("urls").innerHTML = '';
                        $('.edit_dropdown').remove();
                    });
                });
            });

            // Define dimension of marker
            var markerDimension = xf.dimension(function(d) { return d.eventID; });

            // map reduce
            var markerGroup = markerDimension.group().reduce(

                function (p, v) {
                    if (!p.indices[v.eventID] || p.indices[v.eventID] === 0) {
                        p.markers[p.markers.length] = dataset[v.eventID].marker;
                        p.indices[v.eventID] = 1;
                    } else
                        p.indices[v.eventID]++;
                        return p;
                    },

                    function (p, v) {
                        if (p.indices[v.eventID] && p.indices[v.eventID] > 0 ) {
                            p.indices[v.eventID]--;
                            if (p.indices[v.eventID] === 0) {
                                var i = p.markers.indexOf(dataset[v.eventID].marker);

                                if (i != -1)
                                    p.markers.splice(i, 1);
                                }
                            }
                            return p;
                        },

                        function () {
                            return {markers:[], indices:[]};
                        }

                    );

                    // Execute markerChart function - assign marker dimension and group to the chart
                    markerChart = dc.markerChart()
                        .dimension(markerDimension)
                        .group(markerGroup)
                        .filterByBounds(true);

                    dc.renderAll();

                } // draw function close

        // Many thanks to Boyan Yurukov for his emails and help,
        // check out his project - dc-leaflet: https://github.com/yurukov/dc.leaflet.js
        dc.markerChart = function(parent, chartGroup) {

            // Create an empty chart
            var _chart = dc.baseChart({});
            var markercluster;
            var markerList = [];
            var blockpopup = false;

            // Render function
            _chart._doRender = function() {

                // MAP SETTINGS
                _map = L.map('chart-map', {
                    touchZoom: false,
                    scrollWheelZoom: false,
                    maxZoom:14,
                    minZoom:2}
                );

                // Baselayers
                var base_layer_01 = L.tileLayer(config.base_layers[0].url, {
                        // attribution: ''
                }).addTo(_map);

                var basemaps = {};
                for (i=0; i<config.base_layers.length; i++){
                    layerName = config.base_layers[i].name;
                    basemaps[layerName] = L.tileLayer(config.base_layers[i].url);
                }

                var overlaymaps = {};

                L.control.layers(basemaps, overlaymaps, {position: 'topleft'}).addTo(_map);

                // Create markercluster
                markercluster = new L.MarkerClusterGroup({
                    showCoverageOnHover: false,
                    chunkedLoading: true,
                    spiderfyDistanceMultiplier:2,
                    maxClusterRadius:25
                });

                // Add markercluster to the map
                _map.addLayer(markercluster);

                // Remove layers from marker cluster
                markercluster.clearLayers();

                _chart.group().all().forEach(function(v, i) {
                    markerList = markerList.concat(v.value.markers);
                });

                markercluster.addLayers(markerList);

                _map.fitBounds(markercluster.getBounds());

                _chart._postRender();

                return _chart._doRedraw();
            };

            // Redraw function
            _chart._doRedraw = function(){
                var markerList = [];
                // Remove layers from marker cluster
                markercluster.clearLayers();
                _chart.group().all().forEach(function(v, i) {
                    markerList = markerList.concat(v.value.markers);
                });
                markercluster.addLayers(markerList);
                return _chart;
            };

            _chart.blockpopup = function(_) {
                blockpopup=  _=== null;
            };

            _chart.brushOn = function(_) {
                if (!arguments.length) return brushOn;
                brushOn = _;
                return _chart;
            };

            _chart.filterByBounds = function(_) {
                if (!arguments.length) return filterByBounds;
                filterByBounds = _;
                return _chart;
            };

            _chart.getMap = function() {
                return _map;
            };

            // UPDATE MARKERS
            _chart._postRender = function() {

                if (filterByBounds)
                    _chart.filterHandler(doFilterByBounds);
                    _map.on('zoomend moveend', zoomFilter, this );

                if (!filterByBounds)
                    _map.on('click', zoomFilter, this );
                    _map.on('zoomstart', zoomStart, this);

            };

            var zoomStart = function(e) {
                zooming=true;
            };

            var zoomFilter = function(e) {

                if (e.type=="moveend" && (zooming || e.hard))
                    return; zooming=false;

                if (filterByBounds) {
                    var filter;
                    // reset filter based on pan and zoom
                    if (_map.getCenter().equals([31.4, 34.3]) && _map.getZoom()==11)
                        filter = null;
                        else
                            filter = _map.getBounds();
                            dc.events.trigger(function () {
                                _chart.filter(null);
                                if (filter) {
                                    innerFilter=true;
                                    _chart.filter(filter);
                                    innerFilter=false;
                                }
                                dc.redrawAll(_chart.chartGroup());
                            });
                }

                else if (_chart.filter() && (e.type=="click" ||
                    (_chart.filter() in markerList &&
                    !_map.getBounds().contains(markerList[_chart.filter()].getLatLng())))) {
                        dc.events.trigger(function () {
                            _chart.filter(null);
                            dc.redrawAll(_chart.chartGroup());
                        });
                    }

            };

            var doFilterByBounds = function(dimension, filters) {
                _chart.dimension().filter(null);
                if (filters && filters.length>0) {
                    _chart.dimension().filterFunction(function(d) {
                        if (!(d in markerList))
                            return false;
                            var location0 = markerList[d].getLatLng();
                            return location0 && filters[0].contains(location0);
                        });
                        if (!innerFilter && _map.getBounds().toString!=filters[0].toString())
                            _map.fitBounds(filters[0]);
                        }
                    };

            return _chart.anchor(parent, chartGroup);

        };
    });

})();
