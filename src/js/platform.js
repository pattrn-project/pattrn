/*
Copyright (C) 2016 andrea rota <a@xelera.eu>
Copyright (C) 2015 Forensic Architecture

This file is part of Pattrn - http://pattrn.co/.

It includes very minor leftover portions of code originally developed as part of
version 1.0 of Pattrn and distributed under the PATTRN-V1-LICENSE. Almost all
the version 1.0 code has been substantively refactored during the Pattrn v2.0
development cycle, and moved into self-contained AGPL-3.0 modules within this
source tree.

Pattrn is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Pattrn is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Pattrn.  If not, see <http://www.gnu.org/licenses/>.
*/

let $ = require('jquery'),
    d3 = require('d3'),
    q = require('d3-queue'),
    dc = require('dc'),
    crossfilter = require('crossfilter'),
    range = require('lodash.range'),
    jade = require('pug');

import { process_settings } from './lib/settings.js';
import { is_defined } from './lib/utils/is_defined.js';
import { hello_devs_hello } from './lib/utils/hello_devs.js';
import { marker_chart } from './lib/data/dc_markerchart.js';
import { parse_pattrn_layer_groups } from './lib/data/layers.js';
import { geojson_to_pattrn_legacy_data_structure } from './lib/geojson_to_pattrn_legacy.js';

import { initialize_ui } from './lib/pattrn_ui.js';
import {
  is_column_not_empty,
  replace_undefined_values,
  list_all_pattrn_variables,
  pattrn_mock_data_plugins,
  random_node_in_tree,
  array_equals,
  rename_pattrn_core_variables
 } from "./lib/pattrn_data";

import { load_google_sheets_data, consume_table_google_docs }  from "./lib/load_data.js";

/**
 * Pattrn data mapping
 * Basically all the code that renders data rows on the map: initially point
 * data, later shapes, arcs, etc.
 */
import { point_data } from './lib/data/point_data.js';

/**
 * Pattrn chart types
 * These are based on chart modules, abstracted from the duplicated code (5x) in Pattrn v1
 */
import { pattrn_line_chart } from './lib/charts/line_chart.js';
import { pattrn_tag_bar_chart } from './lib/charts/tag_bar_chart.js';
import { pattrn_boolean_bar_chart } from './lib/charts/boolean_bar_chart.js';
import { pattrn_tree_chart } from './lib/charts/tree_chart.js';

/**
 * @x-technical-debt: this should be handled properly through the ES6 import
 */
array_equals();

export function pattrn() {
  var platform_settings = {
    "default": {
      "release_status": "beta",
      "title": "Pattrn",
      "subtitle": "A data-driven, participatory fact mapping platform",
      "about": "Pattrn is a tool to map complex events - such as conflicts, protests, or crises - as they unfold.",
      "colour": "#f45656",
      "map": {
        "root_selector": "chart-map",
        "markers": {
          "color": "black",
          "fillColor": "black",
          "opacity": "0.8"
        },
        "zoom": {
          "max": 14,
          "min": 2
        },
        "disableClusteringAtZoom": 12
      }
    }
  };

  $(document).ready(function() {

    // Bug fix for dropdown sub-menu (CHECK - hack from legacy code)
    $(".dropdown-submenu").each(function() {
      var submenu = $(this).find(".dropdown-menu");
      submenu.find("li").each(function() {
        var item = $(this);
        item.click(function() {
          submenu.find("li").removeClass("active");
        });
      });
    });
  });

  hello_devs_hello();

  // Load the json file with the local settings
  /* global d3 */
  d3.json("config.json", function(config) {
    /**
     * Add link to edit interface, if defined
     */
    if (config.script_url) {
      $('#edit_dropdown').append(
        "<li><a target='_blank' href=" + config.script_url + "new" + " class='noMargin'>Add a new event</a></li>"
      );
    }

    // load data; legacy code wrapped this in jQuery's document.ready - is that really needed?
    load_data(config, platform_settings);
  });
};

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
 * @x-technical-debt: as we refactored, we ended up passing in way too many
 * arguments - further refactor them into an Object, and review the call chain
 * (getting way too deep, as we have preserved so far the legacy messy call
 * hierarchy that relied on a single scope)
 */
function consume_table(data_source_type, config, platform_settings, settings, dataset, dataset_metadata) {
  var highlightColour,
    pattrn_data_sets = {},
    instance_settings = {},
    _map = {},
    markerChart = null,
    variables = {},
    variables_from_mock_data;

  /**
   * @x-legacy-comment: Set up charts
   * scatterWidth: refactor (v2): pass as configuration item to chart functions
   * @x-technical-debt: store all this in default configuration, with option
   * to override per-instance.
   */
  var scatterWidth = document.getElementById('charts').offsetWidth;
  var chartHeight = 200;
  var tagChartHeight = 350;

  /**
   * Set default for variables if not defined
   * @x-technical-debt: may be worth setting this to the Pattrn v1 defaults for
   * google_docs data source type; this should allow to manage legacy hardcoded
   * variables in the same way current code manages GeoJSON sources
   */
  if(is_defined(dataset_metadata) && is_defined(dataset_metadata.variables)) {
    variables = dataset_metadata.variables;
  }

  /**
   * Merge settings from config file with default settings
   */
  instance_settings = process_settings(platform_settings, settings);

  /**
   * Disable 'edit/add event' link for read-only data source types
   */
  if (data_source_type === 'geojson_file') {
    document.getElementById('edit_event').style.display = 'none';
  }

  /**
   * If the pattrn_data_set variable is set for any of the observations,
   * associate colours to each source data set, to be used when displaying
   * markers.
   */
  if (data_source_type === 'geojson_file') {
    var data_source_column = dataset.map(function(value) {
        return value.pattrn_data_set;
      })
      .reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
      }, []);

    var fill = d3.scale.category10();

    data_source_column.forEach(function(value, index, array) {
      pattrn_data_sets[value] = fill(index);
    });
  }

  // sync tree charts and dc.js charts via d3 dispatch
  var dispatch = d3.dispatch('filter');

  /**
   * container for all DC charts created later
   * @x-technical-debt: this should be generated programmatically from the available
   * variable metadata above
   */
  var dc_charts = {
    number: [],
    boolean: [],
    tag: []
  };

  /**
   * Initialize UI elements (title, subtitle, title area colours, about text)
   */
  initialize_ui(instance_settings);


  // Initialize map
  _map = L.map(instance_settings.map.root_selector, {
    touchZoom: false,
    scrollWheelZoom: false,
    maxZoom: instance_settings.map.zoom.max,
    minZoom: instance_settings.map.zoom.min
  });

  // Dispatch to trees' filter callback when map is updated/moved/filtered
  // @x-technical-debt: switch to D3 4 & its API (dispatch.call('filter'))
  _map.on('zoomend', function() {
    dispatch.filter();
  });

  _map.on('moveend', function() {
    dispatch.filter();
  });

  /**
   * from the list of variables defined in the instance's metadata, extract
   * those configured to have their data populated programmatically
   */
  variables_from_mock_data = [].concat.apply([], Object.keys(variables).map((group) => {
      return variables[group].filter((variable) => {
        return variable.data_from_plugin;
      })
    }));

  dataset = dataset.map(function(item, index) {
    // @x-legacy-comment Make new column with eventID for the charts / markers
    item['eventID'] = index;

    // actually populate variables configured to have their data populated
    // programmatically
    variables_from_mock_data.forEach((variable) => {
      var plugin = pattrn_mock_data_plugins()[variable.data_from_plugin.plugin];
      if(plugin) item[variable.id] = plugin(variable.data_from_plugin.args)
    });

    return item;
  }).map(rename_pattrn_core_variables.bind(undefined, dataset_metadata));

  // Parse time
  var dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');

  // Remove rows with invalid dates
  dataset = dataset.filter(function(d) {
    try {
      dateFormat.parse(d.date_time);
    } catch (e) {
      return false;
    }
    return true;
  });

  // Add dd member to each case, holding a date object
  dataset.forEach(function(d) {
    d.dd = dateFormat.parse(d.date_time);
  });

  /**
   * get flat list of Pattrn (b/i/t/r) variables
   */
  var variable_list = list_all_pattrn_variables(variables);

  /**
   * layer groups
   */
  var layer_groups = parse_pattrn_layer_groups(dataset, dataset_metadata);

  console.log("Let's have a look at layer groups:");

  console.log(layer_groups);

  /**
   * @since 2.0.0-alpha22
   * What was once the Oomph Omnibus Master Loop in Pattrn v1, subsequently
   * refactored to remove the most egregious bits of technical debt,
   * shall from now on be wrapped in an map() in order to support layer groups.
   */
  var pattrn_layer_groups = layer_groups.map((layer_group, layer_group_index, layer_groups_array) => {
    return layer_group.crossfilters.map((layer, layer_index, layer_group_crossfilters_array) => {
      let layer_data = {};
      layer_data['dataset'] = layer.data;
      layer_data['crossfilter'] = layer.crossfilter;

      /**
       * get list of variables from metadata
       * @since: 2.0.0-alpha22
       * Since 2.0.0-alpha22 we remove the insanity of inferring variable names
       * from their position as keys of the object for the first item in the
       * dataset, as was done in Pattrn v1. This actually seemed to work, mainly
       * because JS engine developers don't seem to enforce the non-ordered
       * nature of object keys as returned by Object.keys() (as of ES2015).
       * This also means that in order for *any* kind of variables to be used
       * in Pattrn, from now on they *need* to be defined in a metadata JSON
       * file. This is therefore needed for the Google Sheets data source too,
       * as none of the variables previously inferred from hardcoded positions
       * (and with an hardcoded limit of up to five variables for each of the three
       * legacy variable types: integer, tag, boolean) will be now inferred without
       * the support of a metadata file.
       * @x-technical-debt: use a map over variable types
       */
      layer_data['variable_names'] = {
        integer: (is_defined(variables) && is_defined(variables.integer)) ? variables.integer.map((item) => { return item.id; }) : [],
        tag: (is_defined(variables) && is_defined(variables.tag)) ? variables.tag.map((item) => { return item.id; }) : [],
        boolean: (is_defined(variables) && is_defined(variables.boolean)) ? variables.boolean.map((item) => { return item.id; }) : [],
        tree: (is_defined(variables) && is_defined(variables.tree)) ? variables.tree.map((item) => { return item.id; }) : []
      };

      /**
       * Drop all variables defined in metadata files if the dataset does not
       * actually contain any data for these.
       * @x-technical-debt: use a map over variable types
       */
      layer_data['non_empty_variables'] = {
        integer: layer_data.variable_names.integer.filter(is_column_not_empty.bind(undefined, layer_data.dataset)),
        tag: layer_data.variable_names.tag.filter(is_column_not_empty.bind(undefined, layer_data.dataset)),
        boolean: layer_data.variable_names.boolean.filter(is_column_not_empty.bind(undefined, layer_data.dataset)),
        tree: layer_data.variable_names.tree.filter(is_column_not_empty.bind(undefined, layer_data.dataset))
      }

      /**
       * Replace blanks and undefined values with zeros. This
       * step helps to ensure that Crossfilter filter functions can work
       * properly without NaNs breaking sorting.
       *
       * @x-legacy-comment: Fill nan - Replace null value with zeros
       * @x-technical-debt: The legacy for + hardcoded series of ifs has been
       * replaced with the two combined forEach below, but once the tag and
       * bool variable handling has been refactored, we should probably
       * use maps here. If this hack cannot be removed altogether (see issue
       * #14 for different values of uncertainty of data).
       */
      layer_data.dataset.forEach(function(row, index) {
        layer_data.non_empty_variables.integer.forEach(replace_undefined_values.bind(undefined, {
          dataset: layer_data.dataset,
          row: row,
          index: index,
          empty_value: 0
        }));
        layer_data.non_empty_variables.tag.forEach(replace_undefined_values.bind(undefined, {
          dataset: layer_data.dataset,
          row: row,
          index: index,
          empty_value: 'Unknown'
        }));
        layer_data.non_empty_variables.boolean.forEach(replace_undefined_values.bind(undefined, {
          dataset: layer_data.dataset,
          row: row,
          index: index,
          empty_value: 'Unknown'
        }));
        layer_data.non_empty_variables.tree.forEach(replace_undefined_values.bind(undefined, {
          dataset: layer_data.dataset,
          row: row,
          index: index,
          empty_value: 'Unknown'
        }));
      });



      /**
       * @x-technical-debt: the HTML elements now hardcoded in the index.html
       * file need to be computationally generated to match the number of
       * variables of integer type actually in use.
       * @x-technical-debt: in legacy code, a variable for each chart was
       * created in this scope, with its only effective use being in
       * window.onresize() to trigger a repaint of each chart affected. This
       * breaks with the refactored code and needs to be restored, while
       * also investigating whether a different way to handle this could be
       * more perfomant (e.g. do we need to repaint both visible and invisible
       * charts?).
       */
      layer_data.non_empty_variables.integer.forEach(function(item, index) {
        // @x-technical-debt: get rid of this way of labelling elements by
        // appending a left-0-padding to the index of each chart
        var index_padded = '0' + (index + 1);

        dc_charts['number'].push(pattrn_line_chart(index + 1,
          layer_data.dataset,
          {
            elements: {
              title: `line_chart_${index_padded}_title`,
              chart_title: `line_chart_${index_padded}_chartTitle`,
              d3_line_chart: `#d3_line_chart_${index_padded}`,
              aggregate_count_title: `agreggateCountTitle_${index_padded}`,
              d3_aggregate_count: `#d3_aggregate_count_${index_padded}`,
              slider_chart: `#SliderChart_${index_padded}`
            },
            fields: {
              field_name: layer_data.non_empty_variables.integer[index],
              field_title: is_defined(variable_list.find(item => item.id === layer_data.non_empty_variables.integer[index])) ?
                variable_list.find(item => item.id === layer_data.non_empty_variables.integer[index]).name :
                layer_data.non_empty_variables.integer[index]
            },
            scatterWidth: scatterWidth
          },
          {
            xf: layer_data.crossfilter,
            dispatch: dispatch
          }));
      });

      /**
       * @x-technical-debt: the HTML elements now hardcoded in the index.html
       * file need to be computationally generated to match the number of
       * variables of tag type actually in use.
       * @x-technical-debt: in legacy code, a variable for each chart was
       * created in this scope, with its only effective use being in
       * window.onresize() to trigger a repaint of each chart affected. This
       * breaks with the refactored code and needs to be restored, while
       * also investigating whether a different way to handle this could be
       * more perfomant (e.g. do we need to repaint both visible and invisible
       * charts?).
       */
      layer_data.non_empty_variables.tag.forEach(function(item, index) {
        // @x-technical-debt: get rid of this way of labelling elements by
        // appending a left-0-padding to the index of each chart
        var index_padded = '0' + (index + 1);

        dc_charts['tag'].push(pattrn_tag_bar_chart(index + 1,
          layer_data.dataset,
          {
            elements: {
              title: `bar_chart_${index_padded}_title`,
              chart_title: `bar_chart_${index_padded}_chartTitle`,
              d3_bar_chart: `#d3_bar_chart_${index_padded}`,
              aggregate_count_title: `agreggateCountTitle_${index_padded}`
            },
            fields: {
              field_name: layer_data.non_empty_variables.tag[index],
              field_title: is_defined(variable_list.find(item => item.id === layer_data.non_empty_variables.tag[index])) ?
                variable_list.find(item => item.id === layer_data.non_empty_variables.tag[index]).name :
                layer_data.non_empty_variables.tag[index]
            },
            scatterWidth: scatterWidth
          },
          {
            xf: layer_data.crossfilter,
            dispatch: dispatch
          }));
      });

      /**
       * @x-technical-debt: the HTML elements now hardcoded in the index.html
       * file need to be computationally generated to match the number of
       * variables of boolean type actually in use.
       * @x-technical-debt: in legacy code, a variable for each chart was
       * created in this scope, with its only effective use being in
       * window.onresize() to trigger a repaint of each chart affected. This
       * breaks with the refactored code and needs to be restored, while
       * also investigating whether a different way to handle this could be
       * more perfomant (e.g. do we need to repaint both visible and invisible
       * charts?).
       */
      layer_data.non_empty_variables.boolean.forEach(function(item, index) {
        // @x-technical-debt: get rid of this way of labelling elements by
        // appending a left-0-padding to the index of each chart
        var index_padded = '0' + (index + 1);

        dc_charts['boolean'].push(pattrn_boolean_bar_chart(index + 1,
          layer_data.dataset,
          {
            elements: {
              title: `boolean_chart_${index_padded}_title`,
              chart_title: `boolean_chart_${index_padded}_chartTitle`,
              d3_bar_chart: `#d3_boolean_chart_${index_padded}`,
              aggregate_count_title: `agreggateCountTitle_${index_padded}`
            },
            fields: {
              field_name: layer_data.non_empty_variables.boolean[index],
              field_title: is_defined(variable_list.find(item => item.id === non_empty_boolean_variables[index])) ?
                variable_list.find(item => item.id === layer_data.non_empty_variables.boolean[index]).name :
                layer_data.non_empty_variables.boolean[index]
            },
            scatterWidth: scatterWidth
          },
          {
            xf: layer_data.crossfilter,
            dispatch: dispatch
          }));
      });

      /**
       * Tree charts
       * @x-technical-debt: this is currently just calling a stub function, which
       * needs to be written.
       * These charts currently work 'outside-in', as opposed to the other charts
       * above, which are generated starting from dataset variables; tree charts
       * are initially generated starting from the actual tree structures, which
       * are then matched to the related dataset variables. This is mainly because
       * all this chart code is mostly stub. Once fully implemented, these charts
       * need to be working exactly like the others.
       */
      layer_data.non_empty_variables.tree.forEach(function(item, index) {
        // @x-technical-debt: get rid of this way of labelling elements by
        // appending a left-0-padding to the index of each chart
        var index_padded = '0' + (index + 1);

        // @x-technical-debt: need to check that item.tree_data is actually defined
        q.queue()
          .defer(d3.json, variables.tree[index].tree_data)
          .await(function(error, data) {
            let tree_mids = d3.layout.tree().nodes(data).map((item) => { return item.mid; });
            if(variables.tree.find(item => item.id === layer_data.non_empty_variables.tree[index])['data_from_tree']) {
              layer_data.dataset = layer_data.dataset.map((item) => {
                // @x-hack add random position in binary tree
                item[layer_data.non_empty_variables.tree[index]] = tree_mids[Math.floor(Math.random() * tree_mids.length)];
                return item;
              });
            }

            pattrn_tree_chart(index + 1,
              layer_data.dataset,
              {
                elements: {
                  title: `tree_chart_${index_padded}_title`,
                  chart_title: `tree_chart_${index_padded}_chartTitle`,
                  d3_chart: `#d3_tree_chart_${index_padded}`,
                  aggregate_count_title: `agreggateCountTitle_${index_padded}`
                },
                fields: {
                  field_name: layer_data.non_empty_variables.tree[index],
                  field_title: is_defined(variable_list.find(item => item.id === layer_data.non_empty_variables.tree[index])) ?
                    variable_list.find(item => item.id === layer_data.non_empty_variables.tree[index]).name :
                    layer_data.non_empty_variables.tree[index]
                },
                scatterWidth: scatterWidth,
                height: 600
              },
              {
                xf: layer_data.crossfilter,
                dispatch: dispatch
              },
              {
                tree_data: data,
                field_name: variables['tree'][index]
              });
          });
      });

      // timeline by EVENTS
      var event_chart_01_chartTitle = document.getElementById('event_chart_01_chartTitle').innerHTML = "Number of Events over Time";

      var event_chart_01 = dc.lineChart("#d3_event_chart_01");
      var event_chart_01_dimension = layer_data.crossfilter.dimension(function(d) {
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
        .x(d3.time.scale().domain(d3.extent(layer_data.dataset, function(d) {
          return d.dd;
        })))
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .yAxisLabel("no. of events")
        .elasticY(true)
        .on("filtered", function(d) {
          return document.getElementById("filterList").className = "glyphicon glyphicon-filter activeFilter";
        })
        .brushOn(true)
        .xAxis();

      event_chart_01.yAxis().ticks(3);
      event_chart_01.turnOnControls(true);
      event_chart_01.xAxis().tickFormat(d3.time.format("%d-%m-%y"));

      // TOTAL EVENTS
      var number_of_events = dc.dataCount("#number_total_events").dimension(layer_data.crossfilter).group(layer_data.crossfilter.groupAll());

      // Resize charts
      window.onresize = function(event) {
        var newscatterWidth = document.getElementById('charts').offsetWidth;

        Object.keys(dc_charts).forEach((chart_group) => {
          dc_charts[chart_group].forEach((chart) => {
            // @x-technical-debt: check performance issues and re-enable updating
            // of chart width on viewport resize
            // chart.width(newscatterWidth);
          });
        });

        event_chart_01.width(newscatterWidth);
        dc.renderAll();
      };

      // Define dimension of marker
      var markerDimension = layer_data.crossfilter.dimension(function(d) {
        return d.eventID;
      });

      // map reduce
      var markerGroup = markerDimension.group().reduce(

        function(p, v) {
          if (!p.indices[v.eventID] || p.indices[v.eventID] === 0) {
            p.markers[p.markers.length] = layer_data.dataset[v.eventID].marker;
            p.indices[v.eventID] = 1;
          } else
            p.indices[v.eventID]++;
          return p;
        },

        function(p, v) {
          if (p.indices[v.eventID] && p.indices[v.eventID] > 0) {
            p.indices[v.eventID]--;
            if (p.indices[v.eventID] === 0) {
              var i = p.markers.indexOf(layer_data.dataset[v.eventID].marker);

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

      // For each data row, draw and manage event data
      layer_data.dataset.forEach(point_data.bind(undefined,
        config,
        instance_settings,
        _map,
        data_source_type,
        pattrn_data_sets, {
          non_empty_integer_variables: layer_data.non_empty_variables.integer,
          non_empty_tag_variables: layer_data.non_empty_variables.tag,
          non_empty_boolean_variables: layer_data.non_empty_variables.boolean
        },
        markerChart
      ));

      /**
       * Make dc.markerChart function, passing in Pattrn objects needed from legacy
       * omnibus scope and settings/configs
       *
       * @x-technical-debt Clean up closure and passing of variables from
       * current scope
       */
      dc.markerChart = function(parent, chartGroup) {
        return marker_chart(parent, chartGroup, instance_settings, config, { map: _map, L: L, dispatch: dispatch});
      };

      // Execute markerChart function - assign marker dimension and group to the chart
      markerChart = dc.markerChart(instance_settings.map.root_selector)
        .dimension(markerDimension)
        .group(markerGroup)
        .filterByBounds(true);

      dc.renderAll();

      return layer_data;
    });
  });
}


/**
 * Load data
 * Eventually, multiple sources will be supported. Until the
 * core visualization code is updated to handle multiple sources,
 * we actually only load a single data source:
 * by default, if any JSON files are defined, we load the first one;
 * as fallback, if any Google Sheet document is defined, we load the
 * first one.
 */
function load_data(config, platform_settings) {
  var data_sources = config.data_sources;

  if(is_defined(data_sources.geojson_data) && is_defined(data_sources.geojson_data.data_url) && data_sources.geojson_data.data_url.length) {
    q.queue().defer(d3.json, data_sources.geojson_data.data_url)
      .defer(d3.json, data_sources.geojson_data.metadata_url)
      .defer(d3.json, data_sources.geojson_data.settings_url)
      .await(load_geojson_data.bind(undefined, config, platform_settings));
  } else if(data_sources.json_file && data_sources.json_file.length) {
    d3.json(data_sources.json_file[0], function(error, data) {
      var dataset = data.Data.elements,
          settings = data.Settings.elements;

      consume_table('json_file', config, platform_settings, settings, dataset, null);
    });
  } else if(data_sources.google_docs && data_sources.google_docs.length) {
    if(is_defined(data_sources.google_docs[0].metadata_url)) {
      q.queue().defer(d3.json, data_sources.google_docs[0].metadata_url)
        .await(load_google_sheets_data.bind(undefined, consume_table_google_docs, consume_table, config, platform_settings, data_sources.google_docs[0]));
    } else

      load_google_sheets_data(consume_table_google_docs, consume_table, config, platform_settings, data_sources.google_docs[0], {});
  }
}

function load_geojson_data(config, platform_settings, error, dataset, variables, settings) {
  if (error) throw error;
  var data_trees = [];
  var dataset_in_legacy_format = geojson_to_pattrn_legacy_data_structure(dataset, variables, config, settings);
  var data_sources = config.data_sources;

  consume_table('geojson_file', config, platform_settings, settings, dataset_in_legacy_format, variables);
}

/**
 * @since: 1.0.0
 * Legacy map function, used in v1 code; replaced with Array.prototype.map() in
 * Pattrn v2, with transition completed in 2.0.0-alpha22.
 * @x-technical-debt: review and remove this dead code
 */
function map(array, callback) {
  var result = [];
  var i;

  for (i = 0; i < array.length; ++i) {
    result.push(callback(array[i]));
  }

  return result;
}

/**
 * Filter crossfilter data by text on specified dimension.
 * @since 1.0.0
 * moved outside of jumbo function in 2.0.0-alpha22
 * @param Object dim The crossfilter dimension on which to filter
 * @param String queriedText The filter text
 */
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
}
