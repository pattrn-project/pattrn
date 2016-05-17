var initialize_ui = require('./pattrn_ui.js');
var process_settings = require('./settings.js');
var is_defined = require('./is_defined.js');
var marker_chart = require('./dc_markerchart.js');
var geojson_to_pattrn_legacy_data_structure = require('./geojson_to_pattrn_legacy.js');
var range = require('lodash.range');

/**
 * Pattrn chart types
 * These are based on chart modules, abstracted from the duplicated code (5x) in Pattrn v1
 */
var pattrn_line_chart = require('./lib/charts/line_chart.js');

module.exports = function ($, d3, q, dc, crossfilter, Tabletop){

    var _map = {};
    var markerChart = null;
    var bounds;

    var platform_settings = {
      "default" : {
        "release_status" : "beta",
        "title" : "Pattrn",
        "subtitle" : "A data-driven, participatory fact mapping platform",
        "about" : "Pattrn is a tool to map complex events - such as conflicts, protests, or crises - as they unfold.",
        "colour" : "#f45656",
        "map" : {
          "root_selector": "chart-map",
          "markers" : {
             "color" : "black",
             "fillColor" : "black",
             "opacity" : "0.8"
           }
        }
      }
    };


    $(document).ready(function(){

      // Bug fix for dropdown sub-menu (CHECK - hack from legacy code)
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
    /* global d3 */
    d3.json("config.json", function(config) {
      /**
       * Add link to edit interface, if defined
       */
      if(config.script_url) {
          $('#edit_dropdown').append(
              "<li><a target='_blank' href=" + config.script_url + "new" + " class='noMargin'>Add a new event</a></li>"
          );
      }

      // load data; legacy code wrapped this in jQuery's document.ready - is that really needed?
      load_data(config.data_sources);

      /**
       * Load data
       * Eventually, multiple sources will be supported. Until the
       * core visualization code is updated to handle multiple sources,
       * we actually only load a single data source:
       * by default, if any JSON files are defined, we load the first one;
       * as fallback, if any Google Sheet document is defined, we load the
       * first one.
       */
      function load_data(data_sources) {
        if(data_sources.geojson_data && data_sources.geojson_data.data_url && data_sources.geojson_data.data_url.length) {
          q.defer(d3.json, data_sources.geojson_data.data_url)
            .defer(d3.json, data_sources.geojson_data.metadata_url)
            .defer(d3.json, data_sources.geojson_data.settings_url)
            .await(function(error, dataset, variables, settings) {
              if (error) throw error;
              var dataset_in_legacy_format = geojson_to_pattrn_legacy_data_structure(dataset, variables, config, settings);
              consume_table(dataset_in_legacy_format, variables, settings, 'geojson_file');
            });
        } else if(data_sources.json_file && data_sources.json_file.length) {
          d3.json(data_sources.json_file[0], function(error, data) {
            var dataset = data.Data.elements,
                settings = data.Settings.elements;

            consume_table(dataset, null, settings, 'json_file');
          });
        } else if(data_sources.google_docs && data_sources.google_docs.length) {
            init_table(data_sources.google_docs[0]);
        }
      }

      /* global Tabletop */
      function init_table(src) {
          Tabletop.init({
              key: src,
              callback: consume_table_google_docs,
              simpleSheet: false
          });
      }

      /**
       * Wrap actual function, should be done with .bind()
       * @tags TECHNICAL_DEBT
       */
      function consume_table_google_docs(data) {
          var dataset = data.Data.elements,
              settings = data.Settings.elements[0];  // settings are in the first data row - just get this

          consume_table(dataset, null, settings, "google_docs");
      }

      /**
       * Legacy monolithic function - process and prepare data and UI
       * This needs to be broken down into manageable functions and
       * refactored: lots of repeated code can be moved into forEach/map/etc.
       * as appropriate, dead code must be removed, code must be adapted to
       * deal with flexible number and type of variables, etc.
       * Until then, we are slowly adapting the existing monolithic function
       * to work with the Pattrn API and refactoring the low-hanging fruits.
       *
       * @param {Object} dataset The dataset itself
       * @param {Object} variables Data structure describing the dataset's
       *  variables, grouped by type (e.g. integer, tags, bool)
       *  Pattrn v1 was using hardcoded variable positions (e.g. 9th to 13th
       *  variables of the dataset were of type integer, etc.), with the
       *  added caveat that the colun names were extracted by looking up
       *  the keys of the first object of the dataset, relying on the brittle
       *  assumption that JavaScript objects are ordered sets.
       *  In the transition to v2, we are using a thin dataset description
       *  using Open Knowledge's Tabular Data Packages.
       * @param {Object} settings Settings for this Pattrn instance
       * @param {string} data_source_type Whether the data source is
       *  a legacy (v1) one from Google Sheets, a plain JSON file or the
       *  new Pattrn API.
       */
      function consume_table(dataset, variables, settings, data_source_type) {
        var highlightColour,
            pattrn_data_sets = {},
            instance_settings = {};

        /**
         * Merge settings from config file with default settings
         */
        instance_settings = process_settings(platform_settings, settings);

        /**
         * Disable 'edit/add event' link for read-only data source types
         */
        if('geojson_file' === data_source_type) {
          document.getElementById('edit_event').style.display = 'none';
        }

        /**
         * If the pattrn_data_set variable is set for any of the observations,
         * associate colours to each source data set, to be used when displaying
         * markers.
         */
        if('geojson_file' === data_source_type) {
          var data_source_column = dataset.map(function(value) {
            return value.pattrn_data_set;
          })
          .reduce(function(p, c) {
            if(p.indexOf(c) < 0) p.push(c);
            return p;
          }, []);

          var fill = d3.scale.category10();

          data_source_column.forEach(function(value, index, array) {
            pattrn_data_sets[value] = fill(index);
          });
        }

        /**
         * Initialize UI elements (title, subtitle, title area colours, about text)
         */
        initialize_ui(instance_settings);

        // Make new column with eventID for the charts / markers
        for (i = 0; i < dataset.length; i++) {
            dataset[i].eventID = i;
        }

        // Get the headers in an array of strings
        var headers = Object.keys(dataset[0]);

        // Extract columns for integers (hardcoded to mirror spreadsheet)
        // refactor: from number_field_name_X to number_field_names[X]
        var number_field_names = [headers[8], headers[9], headers[10], headers[11], headers[12]];

        // Extract columns for tags (hardcoded to mirror spreadsheet)
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

        var count_of_rows_with_data_by_integer_variable = number_field_names.map(function(item) {
          return dataset.reduce(function(pv, cv, ci, a) {
            return (is_defined(cv[item]) && cv[item] !== "") ? pv + 1 : pv;
          }, 0);
        });

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
        for (var i = 0; i < dataset.length; i++) {
          if (!is_defined(dataset[i][tags_field_name_1]) || dataset[i][tags_field_name_1].length === 0) {
            dataset[i][tags_field_name_1] = 'Unknown';
          }
          if (!is_defined(dataset[i][tags_field_name_2]) || dataset[i][tags_field_name_2].length === 0) {
            dataset[i][tags_field_name_2] = 'Unknown';
          }
          if (!is_defined(dataset[i][tags_field_name_3]) || dataset[i][tags_field_name_3].length === 0) {
            dataset[i][tags_field_name_3] = 'Unknown';
          }
          if (!is_defined(dataset[i][tags_field_name_4]) || dataset[i][tags_field_name_4].length === 0) {
            dataset[i][tags_field_name_4] = 'Unknown';
          }
          if (!is_defined(dataset[i][tags_field_name_5]) || dataset[i][tags_field_name_5].length === 0) {
            dataset[i][tags_field_name_5] = 'Unknown';
          }
        }

        // Add 'Unknown' to empty boolean fields
        for (i=0; i<dataset.length; i++) {
          if (!is_defined(dataset[i][boolean_field_name_1]) || dataset[i][boolean_field_name_1].length === 0) {
            dataset[i][boolean_field_name_1] = 'Unknown';
          }
          if (!is_defined(dataset[i][boolean_field_name_2]) || dataset[i][boolean_field_name_2].length === 0) {
            dataset[i][boolean_field_name_2] = 'Unknown';
          }
          if (!is_defined(dataset[i][boolean_field_name_3]) || dataset[i][boolean_field_name_3].length === 0) {
            dataset[i][boolean_field_name_3] = 'Unknown';
          }
          if (!is_defined(dataset[i][boolean_field_name_4]) || dataset[i][boolean_field_name_4].length === 0) {
            dataset[i][boolean_field_name_4] = 'Unknown';
          }
          if (!is_defined(dataset[i][boolean_field_name_5]) || dataset[i][boolean_field_name_5].length === 0) {
            dataset[i][boolean_field_name_5] = 'Unknown';
          }
        }

        // Fill nan - Replace null value with zeros
        for (i=0; i<dataset.length; i++) {
          if (!is_defined(dataset[i][number_field_names[0]]) || dataset[i][number_field_names[0]] === "") {
            dataset[i][number_field_names[0]] = 0;
          }
          if (!is_defined(dataset[i][number_field_names[1]]) || dataset[i][number_field_names[1]] === "") {
            dataset[i][number_field_names[1]] = 0;
          }
          if (!is_defined(dataset[i][number_field_names[2]]) || dataset[i][number_field_names[2]] === "") {
            dataset[i][number_field_names[2]] = 0;
          }
          if (!is_defined(dataset[i][number_field_names[3]]) || dataset[i][number_field_names[3]] === "") {
            dataset[i][number_field_names[3]] = 0;
          }
          if (!is_defined(dataset[i][number_field_names[4]]) || dataset[i][number_field_names[4]] === "") {
            dataset[i][number_field_names[4]] = 0;
          }
        }

        // Parse time
        var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');

        // Remove rows with invalid dates
        dataset = dataset.filter(function(d) {
          try {
            dateFormat.parse(d.date_time);
          }
          catch(e) {
            return false;
          }
          return true;
        });

        dataset.forEach(function (d) {
          d.dd = dateFormat.parse(d.date_time);
        });

        // Set up charts
        // scatterWidth: refactor (v2): pass as configuration item to chart functions
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
        var tooltip = "Tooltip Text";
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
        // @x-wtf: what for?
        var line_charts_string_values = [];
        for (i = 0; i< number_field_names.length; i++) {
          line_charts_string_values.push({
            "string_values_chart" : map(dataset, function(item) { return item[number_field_names[i]]; }).join("")
          });
        }

        /**
         * @x-technical-debt: this forEach thingy is saner than the legacy
         * copy+paste of identical code minus random differences, but to
         * complete the v1->v2 refactor we need to limit the range to the actual
         * number of integer type variables in the dataset (or to extend it to
         * their count, as applicable)
         * So, range(1, 5) below is just an hardcoded artifact retrofitting the new
         * modular code to the arbitrary repetitions of the legacy code.
         * Likewise, the HTML elements now hardcoded in the index.html file
         * need to be computationally generated to match the number of variables
         * of integer type actually in use.
         */
        range(1, 5).forEach(function(index) {
          // @x-technical-debt: get rid of this way of labelling elements by
          // appending a left-0-padding to the index of each chart
          var index_padded = '0' + index;

          pattrn_line_chart(index,
            { elements: {
                title: `line_chart_${index_padded}_title`,
                chart_title: `line_chart_${index_padded}_chartTitle`,
                d3_line_chart: `#d3_line_chart_${index_padded}`,
                aggregate_count_title: `agreggateCountTitle_${index_padded}`,
                d3_aggregate_count: `#d3_aggregate_count_${index_padded}`,
                slider_chart: `#SliderChart_${index_padded}`
              },
              fields: {
                field_name: number_field_names[index - 1]
              },
              scatterWidth: scatterWidth
            },
            dataset,
            dc,
            xf);
        });

        // BAR CHART 01 - TAGS
        if (value_tags_field_name_1.length > 0) {

          var bar_chart_01_title = document.getElementById('bar_chart_01_title');
          bar_chart_01_title.innerHTML = "Events by " + tags_field_name_1;
          var bar_chart_01_chartTitle = document.getElementById('bar_chart_01_chartTitle').innerHTML = "Events by " + tags_field_name_1;

          var bar_chart_01 = dc.barChart("#d3_bar_chart_01");
          var bar_chart_01_dimension = xf.dimension(function(d) {
            return d[tags_field_name_1];
          });

          // REDUCE FUNCTION
          function reduceAddTarget_01(p, v) {
            if (typeof v[tags_field_name_1] !== 'string') return p;
            v[tags_field_name_1].split(',').forEach(function(val, idx) {
              p[val] = (p[val] || 0) + 1; //increment counts
            });
            return p;
          }

          function reduceRemoveTarget_01(p, v) {
            if (typeof v[tags_field_name_1] !== 'string') return p;
            v[tags_field_name_1].split(',').forEach(function(val, idx) {
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
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .margins({
              top: 0,
              right: 50,
              bottom: 200,
              left: 50
            })
            .renderHorizontalGridLines(true)
            .yAxisLabel("no. of events")
            .elasticY(true)
            .renderlet(function(chart) {
              chart.selectAll("g.x text")
                .style("text-anchor", "end")
                .style("font-size", "10px")
                .attr('dx', '0')
                .attr('dy', '10')
                .attr('transform', "rotate(-45)");
              chart.selectAll('.x-axis-label')
                .attr('transform', "translate(400, 250)");
            })
            .filterHandler(function(dimension, filters) {
              dimension.filter(null);
              dimension.filterFunction(function(d) {
                for (var i = 0; i < filters.length; i++) {
                  if (d.indexOf(filters[i]) < 0) return false;
                }
                return true;
              });
              return filters;
            })
            .on("filtered", function(d) {
              return filterOn.className = "glyphicon glyphicon-filter activeFilter";
            })
            .barPadding(0.1)
            .outerPadding(0.05);

          bar_chart_01.yAxis().ticks(3);

        }


        // BAR CHART 02 - TAGS
        if (value_tags_field_name_2.length > 0) {

          // REDUCE FUNCTION
          function reduceAddTarget_02(p, v) {
            if (typeof v[tags_field_name_2] !== 'string') return p;
            v[tags_field_name_2].split(',').forEach(function(val, idx) {
              p[val] = (p[val] || 0) + 1; //increment counts
            });
            return p;
          }

          function reduceRemoveTarget_02(p, v) {
            if (typeof v[tags_field_name_2] !== 'string') return p;
            v[tags_field_name_2].split(',').forEach(function(val, idx) {
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
          var bar_chart_02_dimension = xf.dimension(function(d) {
            return d[tags_field_name_2];
          });
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
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
            .x(d3.scale.ordinal())
            .margins({
              top: 0,
              right: 50,
              bottom: 200,
              left: 50
            })
            .xUnits(dc.units.ordinal)
            .renderHorizontalGridLines(true)
            .yAxisLabel("no. of events")
            .renderlet(function(chart) {
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
            .filterHandler(function(dimension, filters) {
              dimension.filter(null);
              dimension.filterFunction(function(d) {
                for (var i = 0; i < filters.length; i++) {
                  if (d.indexOf(filters[i]) < 0) return false;
                }
                return true;
              });
              return filters;
            })
            .on("filtered", function(d) {
              return filterOn.className = "glyphicon glyphicon-filter activeFilter";
            })
            .barPadding(0.1)
            .outerPadding(0.05);

          bar_chart_02.yAxis().ticks(3);

        }


        // BAR CHART 03 - TAGS
        if (value_tags_field_name_3.length > 0) {

          // REDUCE FUNCTION
          function reduceAddTarget_03(p, v) {
            if (typeof v[tags_field_name_3] !== 'string') return p;
            v[tags_field_name_3].split(',').forEach(function(val, idx) {
              p[val] = (p[val] || 0) + 1; //increment counts
            });
            return p;
          }

          function reduceRemoveTarget_03(p, v) {
            if (typeof v[tags_field_name_3] !== 'string') return p;
            v[tags_field_name_3].split(',').forEach(function(val, idx) {
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
          var bar_chart_03_dimension = xf.dimension(function(d) {
            return d[tags_field_name_3];
          });
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
            .margins({
              top: 0,
              right: 50,
              bottom: 200,
              left: 50
            })
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true)
            .yAxisLabel("no. of events")
            .elasticY(true)
            .renderlet(function(chart) {
              chart.selectAll("g.x text")
                .style("text-anchor", "end")
                .style("font-size", "10px")
                .attr('dx', '0')
                .attr('dy', '10')
                .attr('transform', "rotate(-45)");

              chart.selectAll('.x-axis-label')
                .attr('transform', "translate(400, 250)");
            })
            .on("filtered", function(d) {
              return filterOn.className = "glyphicon glyphicon-filter activeFilter";
            })
            .barPadding(0.1)
            .outerPadding(0.05);

          bar_chart_03.yAxis().ticks(3);
        }

        // BAR CHART 04 - TAGS
        if (value_tags_field_name_4.length > 0) {


          // REDUCE FUNCTION
          function reduceAddTarget_04(p, v) {
            if (typeof v[tags_field_name_4] !== 'string') return p;
            v[tags_field_name_4].split(',').forEach(function(val, idx) {
              p[val] = (p[val] || 0) + 1; //increment counts
            });
            return p;
          }

          function reduceRemoveTarget_04(p, v) {
            if (typeof v[tags_field_name_4] !== 'string') return p;
            v[tags_field_name_4].split(',').forEach(function(val, idx) {
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
          var bar_chart_04_dimension = xf.dimension(function(d) {
            return d[tags_field_name_4];
          });
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
            .margins({
              top: 0,
              right: 50,
              bottom: 200,
              left: 50
            })
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true)
            .yAxisLabel("no. of events")
            .elasticY(true)
            .renderlet(function(chart) {
              chart.selectAll("g.x text")
                .style("text-anchor", "end")
                .style("font-size", "10px")
                .attr('dx', '0')
                .attr('dy', '10')
                .attr('transform', "rotate(-45)");

              chart.selectAll('.x-axis-label')
                .attr('transform', "translate(400, 358)");
            })
            .on("filtered", function(d) {
              return filterOn.className = "glyphicon glyphicon-filter activeFilter";
            })
            .barPadding(0.1)
            .outerPadding(0.05);

          bar_chart_04.yAxis().ticks(3);
        }

        // BAR CHART 05 - TAGS

        if (value_tags_field_name_5.length > 0) {

          // CUSTOM REDUCE FUNCTION
          function reduceAddTarget_05(p, v) {
            if (typeof v[tags_field_name_5] !== 'string') return p;
            v[tags_field_name_5].split(',').forEach(function(val, idx) {
              p[val] = (p[val] || 0) + 1; //increment counts
            });
            return p;
          }

          function reduceRemoveTarget_05(p, v) {
            if (typeof v[tags_field_name_5] !== 'string') return p;
            v[tags_field_name_5].split(',').forEach(function(val, idx) {
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
          var bar_chart_05_dimension = xf.dimension(function(d) {
            return d[tags_field_name_5];
          });
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
            .margins({
              top: 0,
              right: 50,
              bottom: 200,
              left: 50
            })
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true)
            .yAxisLabel("no. of events")
            .elasticY(true)
            .renderlet(function(chart) {
              chart.selectAll("g.x text")
                .style("text-anchor", "end")
                .style("font-size", "10px")
                .attr('dx', '0')
                .attr('dy', '10')
                .attr('transform', "rotate(-45)");

              chart.selectAll('.x-axis-label')
                .attr('transform', "translate(400, 358)");
            })
            .on("filtered", function(d) {
              return filterOn.className = "glyphicon glyphicon-filter activeFilter";
            })
            .barPadding(0.1)
            .outerPadding(0.05);

          bar_chart_05.yAxis().ticks(3);
        }

        // BOOLEAN CHART 01 - BOOLEAN
        if (value_boolean_field_name_1.length > 0) {

          var boolean_chart_01_title = document.getElementById('boolean_chart_01_title').innerHTML = boolean_field_name_1;
          var boolean_chart_01_chartTitle = document.getElementById('boolean_chart_01_chartTitle').innerHTML = "Events by " + boolean_field_name_1;

          var boolean_chart_01 = dc.barChart("#d3_boolean_chart_01");
          var boolean_chart_01_dimension = xf.dimension(function(d) {
            return d[boolean_field_name_1];
          });
          var boolean_chart_01_group = boolean_chart_01_dimension.group().reduceCount();

          boolean_chart_01.width(scatterWidth)
            .height(chartHeight)
            .margins({
              top: 0,
              right: 50,
              bottom: 50,
              left: 50
            })
            .dimension(boolean_chart_01_dimension)
            .group(boolean_chart_01_group)
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
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
          var boolean_chart_02_dimension = xf.dimension(function(d) {
            return d[boolean_field_name_2];
          });
          var boolean_chart_02_group = boolean_chart_02_dimension.group().reduceCount();

          boolean_chart_02.width(scatterWidth)
            .height(chartHeight)
            .margins({
              top: 0,
              right: 50,
              bottom: 50,
              left: 50
            })
            .dimension(boolean_chart_02_dimension)
            .group(boolean_chart_02_group)
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .renderHorizontalGridLines(true)
            .yAxisLabel("no. of events")
            .elasticY(true)
            .on("filtered", function(d) {
              return filterOn.className = "glyphicon glyphicon-filter activeFilter";
            })
            .barPadding(0.1)
            .outerPadding(0.05);

          boolean_chart_02.yAxis().ticks(3);
        }

        // BOOLEAN CHART 03 - BOOLEAN
        if (value_boolean_field_name_3.length > 0) {

          var boolean_chart_03_title = document.getElementById('boolean_chart_03_title').innerHTML = boolean_field_name_3;
          var boolean_chart_03_chartTitle = document.getElementById('boolean_chart_03_chartTitle').innerHTML = "Events by " + boolean_field_name_3;

          var boolean_chart_03 = dc.barChart("#d3_boolean_chart_03");
          var boolean_chart_03_dimension = xf.dimension(function(d) {
            return d[boolean_field_name_3];
          });
          var boolean_chart_03_group = boolean_chart_03_dimension.group().reduceCount();

          boolean_chart_03.width(scatterWidth)
            .height(chartHeight)
            .margins({
              top: 0,
              right: 50,
              bottom: 50,
              left: 50
            })
            .dimension(boolean_chart_03_dimension)
            .group(boolean_chart_03_group)
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .renderHorizontalGridLines(true)
            // .xAxisLabel(boolean_chart_03_title)
            .yAxisLabel("no. of events")
            .elasticY(true)
            .on("filtered", function(d) {
              return filterOn.className = "glyphicon glyphicon-filter activeFilter";
            })
            .barPadding(0.1)
            .outerPadding(0.05);

          boolean_chart_03.yAxis().ticks(3);
        }

        // BOOLEAN CHART 04 - BOOLEAN
        if (value_boolean_field_name_4.length > 0) {

          var boolean_chart_04_title = document.getElementById('boolean_chart_04_title').innerHTML = boolean_field_name_4;
          var boolean_chart_04_chartTitle = document.getElementById('boolean_chart_04_chartTitle').innerHTML = "Events by " + boolean_field_name_4;

          var boolean_chart_04 = dc.barChart("#d3_boolean_chart_04");
          var boolean_chart_04_dimension = xf.dimension(function(d) {
            return d[boolean_field_name_4];
          });
          var boolean_chart_04_group = boolean_chart_04_dimension.group().reduceCount();

          boolean_chart_04.width(scatterWidth)
            .height(chartHeight)
            .margins({
              top: 0,
              right: 50,
              bottom: 50,
              left: 50
            })
            .dimension(boolean_chart_04_dimension)
            .group(boolean_chart_04_group)
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .renderHorizontalGridLines(true)
            .yAxisLabel("no. of events")
            .elasticY(true)
            .on("filtered", function(d) {
              return filterOn.className = "glyphicon glyphicon-filter activeFilter";
            })
            .barPadding(0.1)
            .outerPadding(0.05);

          boolean_chart_04.yAxis().ticks(3);

        }
        // BOOLEAN CHART 05 - BOOLEAN
        if (value_boolean_field_name_5.length > 0) {

          var boolean_chart_05_title = document.getElementById('boolean_chart_05_title').innerHTML = boolean_field_name_5;
          var boolean_chart_05_chartTitle = document.getElementById('boolean_chart_05_chartTitle').innerHTML = "Events by " + boolean_field_name_5;

          var boolean_chart_05 = dc.barChart("#d3_boolean_chart_05");
          var boolean_chart_05_dimension = xf.dimension(function(d) {
            return d[boolean_field_name_5];
          });
          var boolean_chart_05_group = boolean_chart_05_dimension.group().reduceCount();

          boolean_chart_05.width(scatterWidth)
            .height(chartHeight)
            .margins({
              top: 0,
              right: 50,
              bottom: 50,
              left: 50
            })
            .dimension(boolean_chart_05_dimension)
            .group(boolean_chart_05_group)
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .renderHorizontalGridLines(true)
            .yAxisLabel("no. of events")
            .elasticY(true)
            .on("filtered", function(d) {
              return filterOn.className = "glyphicon glyphicon-filter activeFilter";
            })
            .barPadding(0.1)
            .outerPadding(0.05);
          boolean_chart_05.yAxis().ticks(3);
        }

        // timeline by EVENTS
        var event_chart_01_chartTitle = document.getElementById('event_chart_01_chartTitle').innerHTML = "Number of Events over Time";

        var event_chart_01 = dc.lineChart("#d3_event_chart_01");
        var event_chart_01_dimension = xf.dimension(function(d) {
          return +d3.time.day(d.dd);
        });
        var event_chart_01_group = event_chart_01_dimension.group().reduceCount(function(d) {
          return +d3.time.day(d.dd);
        });

        event_chart_01.width(scatterWidth)
          .height(chartHeight)
          .margins({
            top: 0,
            right: 50,
            bottom: 50,
            left: 50
          })
          .dimension(event_chart_01_dimension)
          .group(event_chart_01_group)
          .title(function(d) {
            return ('Total number of events: ' + d.value);
          })
          .x(d3.time.scale().domain(d3.extent(dataset, function(d) {
            return d.dd;
          })))
          .renderHorizontalGridLines(true)
          .renderVerticalGridLines(true)
          .yAxisLabel("no. of events")
          .elasticY(true)
          .on("filtered", function(d) {
            return filterOn.className = "glyphicon glyphicon-filter activeFilter";
          })
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
          if (typeof v[source_field_name] !== 'string') return p;
          v[source_field_name].split(',').forEach(function(val, idx) {
            p[val] = (p[val] || 0) + 1; //increment counts
          });
          return p;
        }

        function reduceRemoveTarget_source(p, v) {
          if (typeof v[source_field_name] !== 'string') return p;
          v[source_field_name].split(',').forEach(function(val, idx) {
            p[val] = (p[val] || 0) - 1; //decrement counts
          });
          return p;
        }

        function reduceInitialTarget_source() {
          return {};
        }


        var source_chart = dc.barChart("#d3_source_chart");
        var source_chart_dimension = xf.dimension(function(d) {
          return d[source_field_name];
        });
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
          .margins({
            top: 0,
            right: 50,
            bottom: 200,
            left: 50
          })
          .title(function(d) {
            return ('Total number of events: ' + d.value);
          })
          .x(d3.scale.ordinal())
          .xUnits(dc.units.ordinal)
          // .xAxisPadding(500)
          .renderHorizontalGridLines(true)
          .yAxisLabel("no. of events")
          .renderlet(function(chart) {
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
          .on("filtered", function(d) {
            return filterOn.className = "glyphicon glyphicon-filter activeFilter";
          })
          .barPadding(0.1)
          .outerPadding(0.05);

        source_chart.yAxis().ticks(3);

        // MEDIA CHART - TAGS ('empty')
        if (media_field_name.length > 0) {


          // CUSTOM REDUCE FUNCTION
          function reduceAddTarget_media(p, v) {
            if (typeof v[media_field_name] !== 'string') return p;
            v[media_field_name].split(',').forEach(function(val, idx) {
              p[val] = (p[val] || 0) + 1; //increment counts
            });
            return p;
          }

          function reduceRemoveTarget_media(p, v) {
            if (typeof v[media_field_name] !== 'string') return p;
            v[media_field_name].split(',').forEach(function(val, idx) {
              p[val] = (p[val] || 0) - 1; //decrement counts
            });
            return p;
          }

          function reduceInitialTarget_media() {
            return {};
          }


          var media_chart = dc.barChart("#d3_media_chart");
          var media_chart_dimension = xf.dimension(function(d) {
            return d[media_field_name];
          });
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
            .title(function(d) {
              return ('Total number of events: ' + d.value);
            })
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .xAxisPadding(500)
            .renderHorizontalGridLines(true)
            .yAxisLabel("no. of events")
            .elasticY(true)
            .filterHandler(function(dimension, filters) {
              dimension.filter(null);
              dimension.filterFunction(function(d) {
                for (var i = 0; i < filters.length; i++) {
                  if (d.indexOf(filters[i]) < 0) return false;
                }
                return true;
              });
              return filters;
            })
            .on("filtered", function(d) {
              return filterOn.className = "glyphicon glyphicon-filter activeFilter";
            })
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
          // If data on source data set is available, set colour of markers accordingly, otherwise use defaults
          var marker_color = is_defined(d.pattrn_data_set) && is_defined(pattrn_data_sets[d.pattrn_data_set]) ? pattrn_data_sets[d.pattrn_data_set] : instance_settings.map.markers.color;

          d.i = i;
          var dayMonthFormat = d3.time.format("%d/%m/%y");
          var fullDateFormat = d3.time.format("%A, %d %B %Y");

          // Marker settings
          d.marker = new L.circleMarker(new L.LatLng(d.latitude, d.longitude), {
            title: "",
            radius: 7,
            color: marker_color,
            opacity: 0.9,
            fillOpacity: 0.8,
            clickable: true,
          });

          d.marker.data = d;

          // Tooltip content
          var eventDetailsContent = "<div class='col-sm-12' style='padding-top:15px' id='background'>";
          if (is_defined(d.event_ID)) eventDetailsContent += "<p class='caption-grey'>EVENT ID:</p> <p class='noMargin'>" + d.event_ID + "</p>";
          if (is_defined(d.dd)) eventDetailsContent += "<p class='caption-grey'>DATE:</p> <p class='noMargin'> " + fullDateFormat(d.dd) + "</p>";
          if (is_defined(d.location_name)) eventDetailsContent += "<p class='caption-grey'>LOCATION: </p> <p class='noMargin'> " + d.location_name + "</p><br/>";
          eventDetailsContent += "</div>";

          // Summary content
          var summaryContent = "<div class='col-sm-12' style='padding-top:15px' id='infowindow'>";
          if (is_defined(d.event_summary)) summaryContent += "<p class='summary'>" + d.event_summary + "</p>";
          if (is_defined(d.source_name)) summaryContent += "<p class='caption-grey'>SOURCE:</p> <p class='summary'>" + d.source_name + "</p><br/>";
          summaryContent += (
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

            if (is_defined(markerChart) && markerChart.filter() == e.target.data.i) {
              markerChart.filter(true);
            } else {

              $('#edit_dropdown').append(
                "<li><a target='_blank' href=" + config.script_url + d.event_ID + " class='edit_dropdown noMargin'>Edit this event</a><li>"
              );

              if(is_defined(e.target.data.photos)) {
                // Photos
                d3.json(e.target.data.photos, function(D) {

                  var json_photos = $.parseJSON('[' + dataset[i].photos + ']');

                  for (j = 0; j < json_photos.length; j++) {
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
              }

              if(is_defined(e.target.data.videos)) {
                // Videos
                d3.json(e.target.data.videos, function(D) {

                  var json_videos = $.parseJSON('[' + dataset[i].videos + ']');

                  for (j = 0; j < json_videos.length; j++) {
                    $('#video_gallery').append(
                      '<li style= "list-style-type: none;" data-src="' + json_videos[j].src +
                      '"data-sub-html="' + json_videos[j].subhtml + '" id="image_link">' +
                      '<a href="#"><p>Video: <strong>' + json_videos[j].caption + '</strong></p></a>' +
                      '<p>Source: ' + json_videos[j].source + '</p>' +
                      '</li>'
                    );
                  }

                  $(document).ready(function() {
                    $("#video_gallery").lightGallery();
                  });

                });
              }

              if(is_defined(e.target.data.links)) {
                // Urls
                d3.json(e.target.data.links, function(D) {

                  var array_urls = $.parseJSON('[' + dataset[i].links + ']');

                  for (j = 0; j < array_urls.length; j++) {
                    $('#urls').append(
                      '<li><a target="_blank" href="' + array_urls[j].url + '"> Title: ' + array_urls[j].title + '</a></li><p style="line-height: 100%"><br/>Subtitle: ' + array_urls[j].subtitle + '</p>'
                    );
                  }

                });
              }

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
                if (!is_defined(d[field_name])) return;
                $('#summaryTable').append(
                  "<tr class='col-sm-12'><th class='col-sm-6'><p>" + field_name +
                  "</p></th> <th class='col-sm-6' ><p class='white'> " + d[field_name] +
                  "</p> </th> </tr>"
                );
              }

              function appendTagValueToTable(field_name) {
                if (!is_defined(d[field_name])) return;
                $('#summaryTable').append(
                  "<tr class='col-sm-12'><th class='col-sm-6'><p>" + field_name +
                  "</p></th><th class='col-sm-6' ><p class='white'> " + d[field_name].split(',').join(', ') +
                  "</p> </th> </tr>"
                );
              }

              function appendGeoJSONPropertyToTable(key, value) {
                $('#summaryTable').append(
                  "<tr class='col-sm-12'><th class='col-sm-6'><p>" + key +
                  "</p></th><th class='col-sm-6' ><p class='white'> " + value +
                  "</p> </th> </tr>"
                );
              }

              if ('geojson_file' === data_source_type) {
                Object.keys(d.source_variables)
                  .filter(function(value) {
                    return !value.match(/^pattrn_[^_]{2,}/);
                  })
                  .forEach(function(value, index, array) {
                    if (is_defined(d.source_variables[value])) appendGeoJSONPropertyToTable(value, d.source_variables[value]);
                  });
              }


              // Table content - Integers - hard coded to mirror spreadsheet structure
              if (count_of_rows_with_data_by_integer_variable[0] > 0) {
                appendIntegerValueToTable(number_field_names[0]);
              }

              if (count_of_rows_with_data_by_integer_variable[1] > 0) {
                appendIntegerValueToTable(number_field_names[1]);
              }

              if (count_of_rows_with_data_by_integer_variable[2] > 0) {
                appendIntegerValueToTable(number_field_names[2]);
              }

              if (count_of_rows_with_data_by_integer_variable[3] > 0) {
                appendIntegerValueToTable(number_field_names[3]);
              }

              if (count_of_rows_with_data_by_integer_variable[4] > 0) {
                appendIntegerValueToTable(number_field_names[4]);
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
              // If data on source data set is available, set colour of markers accordingly, otherwise use defaults
              var marker_color = is_defined(d.pattrn_data_set) && is_defined(pattrn_data_sets[d.pattrn_data_set]) ? pattrn_data_sets[d.pattrn_data_set] : instance_settings.map.markers.color;

              d.marker.setRadius(7);
              d.marker.setStyle({
                fillColor: marker_color,
                color: marker_color,
                fillOpacity: instance_settings.map.markers.opacity
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
        var markerDimension = xf.dimension(function(d) {
          return d.eventID;
        });

        // map reduce
        var markerGroup = markerDimension.group().reduce(

          function(p, v) {
            if (!p.indices[v.eventID] || p.indices[v.eventID] === 0) {
              p.markers[p.markers.length] = dataset[v.eventID].marker;
              p.indices[v.eventID] = 1;
            } else
              p.indices[v.eventID]++;
            return p;
          },

          function(p, v) {
            if (p.indices[v.eventID] && p.indices[v.eventID] > 0) {
              p.indices[v.eventID]--;
              if (p.indices[v.eventID] === 0) {
                var i = p.markers.indexOf(dataset[v.eventID].marker);

                if (i != -1)
                  p.markers.splice(i, 1);
              }
            }
            return p;
          },

          function() {
            return {
              markers: [],
              indices: []
            };
          }

        );

        // MAP SETTINGS
        _map = L.map(instance_settings.map.root_selector, {
          touchZoom: false,
          scrollWheelZoom: false,
          maxZoom: 14,
          minZoom: 2
        });
      /**
       * Make dc.markerChart function, passing in L, dc and settings/configs
       *
       * @x-technical-debt Clean up closure and passing of variables from
       * current scope
       */
      dc.markerChart = function(parent, chartGroup) {
        return marker_chart(parent, chartGroup, _map, L, dc, instance_settings, config);
      };

      // Execute markerChart function - assign marker dimension and group to the chart
      markerChart = dc.markerChart(instance_settings.map.root_selector)
                      .dimension(markerDimension)
                      .group(markerGroup)
                      .filterByBounds(true);

      dc.renderAll();
    } // draw function close
  });
};
