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
    crossfilter = require('crossfilter2'),
    range = require('lodash.range');

import { process_settings } from './lib/settings.js';
import { is_defined } from './lib/utils/is_defined.js';
import { hello_devs_hello } from './lib/utils/hello_devs.js';
import { marker_chart } from './lib/data/dc_markerchart.js';
import { parse_pattrn_layer_groups } from './lib/data/layers.js';
import { geojson_to_pattrn_legacy_data_structure } from './lib/geojson_to_pattrn_legacy.js';

import { initialize_ui, activate_side_panels, activate_data_layers_toggle, activate_chart_download_buttons } from './lib/pattrn_ui.js';

import { generate_data_layer_menu } from './lib/ui/menus.js';

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
import colour_by_data_source from './lib/data/colour_by_data_source.js';
import add_dateobject_to_rows from './lib/data/add_dateobject_to_rows.js';

/**
 * Pattrn chart types
 * These are based on chart modules, abstracted from the duplicated code (5x) in Pattrn v1
 */
import { pattrn_event_count_chart } from './lib/charts/event_count_chart.js';
import { pattrn_line_chart } from './lib/charts/line_chart.js';
import { pattrn_tag_bar_chart } from './lib/charts/tag_bar_chart.js';
import { pattrn_boolean_bar_chart } from './lib/charts/boolean_bar_chart.js';
import { pattrn_tree_chart } from './lib/charts/tree_chart.js';

/**
 * Pattrn theme views
 * This will need to be refactored into a proper pluggable and configurable
 * theme system, but the first iteration aims at feature parity with the
 * legacy hardcoded HTML.
 */
import { template as event_count_chart_template } from './lib/themes/pattrn-begins/charts/event_count_chart.js';
import { template as line_chart_template } from './lib/themes/pattrn-begins/charts/line_chart.js';
import { template as tag_bar_chart_template } from './lib/themes/pattrn-begins/charts/tag_bar_chart.js';
import { template as boolean_chart_template } from './lib/themes/pattrn-begins/charts/boolean_chart.js';
import { template as tree_chart_template } from './lib/themes/pattrn-begins/charts/tree_chart.js';
import { template as aggregate_count_widget_template } from './lib/themes/pattrn-begins/widgets/aggregate_count.js';

/**
 * @x-technical-debt: this should be handled properly through the ES6 import
 */
array_equals();

/**
 * Once upon a time, when Pattrn was young and its version was 1.0, all the
 * Pattrn code was wrapped within a single IIFE whose name was pattrn():
 * https://github.com/pattrn-project/pattrn/blob/v1.0/js/platform.js#L1
 * While transitioning to Pattrn v2.0 and breaking things down into manageable
 * modular code, we did things one bit at a time, bringing things out of
 * pattrn() and into small functions and ES2015 modules. As we get ready to
 * tag the v2.0 Pattrn release, pattrn() is still a very long function, as
 * fully refactoring this and finishing extracting code to manageable
 * functions (or classes and class methods, or whatever as the direction set
 * after the v2.0 release will be) would be out of scope for this first
 * refactor.
 *
 * @param Object platform_settings Default settings for the Pattrn platform.
 */
export default function pattrn(platform_settings) {
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

  /**
   * Initial message for developer console output
   */
  hello_devs_hello();

  /**
   * Create Pattrn global object (yuck); this is then currently used only by the
   * /settings.js module to store a global (yuck) configuration object.
   * @x-technical-debt: yuck, but until we refactor to use a singleton class
   * this helps avoiding to pass around the configuration object across
   * function calls)
   */
  window.Pattrn = {};

  // Load the json file with the local settings
  q.queue()
    .defer(d3.json, 'config.json')
    .await((error, config) => {
      /**
       * Add link to edit interface, if defined
       */
      if (config.script_url) {
        $('#edit_dropdown').append(
          "<li><a target='_blank' href=" + config.script_url + "new" + " class='noMargin'>Add a new event</a></li>"
        );
      }

      /**
       * Load data; legacy code used to wrap this in jQuery's document.ready()
       * though this doesn't really seem to be needed - at least with the
       * current code flow.
       */
      load_data(config, platform_settings);
    })
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
   * @x-technical-debt: do this gracefully via a class and related SASS style,
   * at least
   */
  if (data_source_type === 'geojson_file') {
    document.getElementById('edit_event').style.display = 'none';
  }

  if (data_source_type === 'geojson_file') {
    pattrn_data_sets = colour_by_data_source(dataset);
  }

  // sync tree charts and dc.js charts via d3 dispatch
  var dispatch = d3.dispatch('filter');

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
    // actually populate variables configured to have their data populated
    // programmatically
    variables_from_mock_data.forEach((variable) => {
      let plugin = pattrn_mock_data_plugins()[variable.data_from_plugin.plugin];
      if(plugin) item[variable.id] = plugin(variable.data_from_plugin.args)
    });

    return item;
  }).map(rename_pattrn_core_variables.bind(undefined, dataset_metadata));

  dataset = add_dateobject_to_rows(dataset);

  /**
   * get flat list of Pattrn (b/i/t/r) variables
   */
  var variable_list = list_all_pattrn_variables(variables);

  /**
   * layer groups
   */
  var layer_groups = parse_pattrn_layer_groups(dataset, dataset_metadata);

  /**
   * @since 2.0.0-alpha22
   * What was once the Oomph Omnibus Master Loop in Pattrn v1, subsequently
   * refactored to remove the most egregious bits of technical debt,
   * shall from now on be wrapped in an map() in order to support layer groups.
   */
  var pattrn_layer_groups = layer_groups.map((layer_group, layer_group_index, layer_groups_array) => {
    let group_layers = layer_group.layers.map((layer, layer_index, layer_group_layers_array) => {
      // Layer data structure: initialize with layer metadata as parsed via parse_pattrn_layer_groups()
      let layer_data = layer;

      // DC charts for this layer
      // @x-technical-debt: generate this programmatically from actual charts created
      layer_data['dc_charts'] = {
        integer: [],
        tag: [],
        boolean: [],
        tree: [],
        event_count: [],
        media: []
      };
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
       * @x-technical-debt: avoid hardcoding of event_count variable type; this
       * should be not necessary once counts have been moved to use plain line
       * charts, anyways.
       * @x-technical-debt: check that layer_data.variables is defined before
       * trying to get its keys.
       */
      layer_data['variable_names'] = Object.keys(layer_data.variables).map((variable_type) => {
        return {
          type: variable_type,
          names: layer_data.variables[variable_type].map((item) => { return item.id; })
        };
      });

      /**
       * @x-legacy-comment Make new column with eventID for the charts / markers
       * Besides being used in some leftover legacy code, eventID is also used
       * in Pattrn v2 as a fake variable against which number of events over
       * time are plotted.
       */
      layer_data.dataset = layer_data.dataset.map((item, index) => {
        item['eventID'] = index;
        return item;
      });

      /**
       * Drop all variables defined in metadata files if the dataset does not
       * actually contain any data for these.
       * @x-technical-debt: use a map over variable types
       */
      layer_data['non_empty_variables'] = layer_data.variable_names.map((variable_type) => {
        return {
          type: variable_type.type,
          names: variable_type.names.filter(is_column_not_empty.bind(undefined, layer_data.dataset))
        };
      });

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
      layer_data.dataset.forEach((row, index) => {
        layer_data.non_empty_variables.forEach(function(variable_type) {
          variable_type.names.forEach((variable_name) => {
            if(['integer'].indexOf(variable_type.type) >= 0) {
              replace_undefined_values(variable_name, {
                dataset: layer_data.dataset,
                row: row,
                index: index,
                empty_value: 0
              });
            } else if(['tag', 'boolean', 'tree'].indexOf(variable_type.type) >= 0) {
              replace_undefined_values(variable_name, {
                dataset: layer_data.dataset,
                row: row,
                index: index,
                empty_value: 'Unknown'
              });
            }
          });
        });
      });

      return layer_data;
    });

    layer_group.layers = group_layers;

    return layer_group;
  });

  console.log("Let's have a look at layer groups:");

  console.log(pattrn_layer_groups);

  /**
   * Generate data layers menu for side panel
   */
  generate_data_layer_menu(pattrn_layer_groups, pattrn_data_sets, variable_list)

  /**
   * Activate events on data layers and info panels
   */
  activate_side_panels(_map);

  /**
   * Activate events on data layers toggles
   */
  activate_data_layers_toggle();

  /**
   * Create charts and map layers/layer groups
   * @x-technical-debt: refactor out to separate function
   */
  pattrn_layer_groups.forEach((layer_group, layer_group_index, layer_groups) => {
    layer_group.layers = layer_group.layers.map((layer_data, layer_index) => {
      // selector for root of layer menu, used to append the DC data count widget
      let layer_data_count_selector = `.layer-root-${layer_data.id}`;

      // group id used to group DC charts;
      // add this to layer_data for uses outside of this function
      let chart_group_id = layer_data.chart_group_id = `lg${layer_group_index}_ly${layer_index}`;

      /**
       * @x-technical-debt: in legacy code, a variable for each chart was
       * created in this scope, with its only effective use being in
       * window.onresize() to trigger a repaint of each chart affected. This
       * breaks with the refactored code and needs to be restored, while
       * also investigating whether a different way to handle this could be
       * more perfomant (e.g. do we need to repaint both visible and invisible
       * charts?).
       */
      layer_data.non_empty_variables.forEach((variable_group, variable_group_index) => {

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

        /**
         * @x-technical-debt: switch from overlapping forEach + if to a proper
         * forEach iterating over variable groups
         */

        if(variable_group.type === 'integer') {
          layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names.forEach(function(item, index) {
            let chart_id = `${chart_group_id}_vg${variable_group_index}_var${index}`;

            /**
             * Create HTML fragment for chart tab
             * @x-technical-debt switch from jQuery to D3 (or any future DOM library)
             * @x-technical-debt do not hardcode root of chart tabs
             * @x-technical-debt spin off aggregate charts into own chart type and module
             */
            $('#charts .tab-content').append(line_chart_template({ chart_id: chart_id }));

            layer_data.dc_charts['integer'].push(pattrn_line_chart(index + 1,
              layer_data.dataset,
              {
                elements: {
                  title: `line_chart_${chart_id}_title`,
                  chart_title: `line_chart_${chart_id}_chartTitle`,
                  dc_chart: `#d3_line_chart_${chart_id}`,
                  aggregate_count_title: `agreggateCountTitle_${chart_id}`,
                  d3_aggregate_count: `#d3_aggregate_count_${chart_id}`,
                  slider_chart: `#SliderChart_${chart_id}`
                },
                fields: {
                  field_name: layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index],
                  field_title: is_defined(variable_list.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index])) ?
                    variable_list.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]).name :
                    layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]
                },
                dc_chart_group: chart_group_id,
                scatterWidth: scatterWidth
              },
              {
                crossfilter: layer_data.crossfilter,
                dispatch: dispatch,
                layer_data: layer_data
              }));
          });
        }

        if(variable_group.type === 'tag') {
          layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names.forEach(function(item, index) {
            let chart_id = `${chart_group_id}_vg${variable_group_index}_var${index}`;

            /**
             * Create HTML fragment for chart tab
             * @x-technical-debt switch from jQuery to D3 (or any future DOM library)
             * @x-technical-debt do not hardcode root of chart tabs
             */
            $('#charts .tab-content').append(tag_bar_chart_template({ chart_id: chart_id }));

            layer_data.dc_charts['tag'].push(pattrn_tag_bar_chart(index + 1,
              layer_data.dataset,
              {
                elements: {
                  title: `bar_chart_${chart_id}_title`,
                  chart_title: `bar_chart_${chart_id}_chartTitle`,
                  dc_chart: `#d3_bar_chart_${chart_id}`
                },
                fields: {
                  field_name: layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index],
                  field_title: is_defined(variable_list.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index])) ?
                    variable_list.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]).name :
                    layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]
                },
                dc_chart_group: chart_group_id,
                scatterWidth: scatterWidth
              },
              {
                crossfilter: layer_data.crossfilter,
                dispatch: dispatch,
                layer_data: layer_data
              }));
          });
        }

        if(variable_group.type === 'boolean') {
          layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names.forEach(function(item, index) {
            let chart_id = `${chart_group_id}_vg${variable_group_index}_var${index}`;

            /**
             * Create HTML fragment for chart tab
             * @x-technical-debt switch from jQuery to D3 (or any future DOM library)
             * @x-technical-debt do not hardcode root of chart tabs
             */
            $('#charts .tab-content').append(boolean_chart_template({ chart_id: chart_id }));

            layer_data.dc_charts['boolean'].push(pattrn_boolean_bar_chart(index + 1,
              layer_data.dataset,
              {
                elements: {
                  title: `boolean_chart_${chart_id}_title`,
                  chart_title: `boolean_chart_${chart_id}_chartTitle`,
                  dc_chart: `#d3_boolean_chart_${chart_id}`
                },
                fields: {
                  field_name: layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index],
                  field_title: is_defined(variable_list.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index])) ?
                    variable_list.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]).name :
                    layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]
                },
                dc_chart_group: chart_group_id,
                scatterWidth: scatterWidth
              },
              {
                crossfilter: layer_data.crossfilter,
                dispatch: dispatch,
                layer_data: layer_data
              }));
          });
        }

        if(variable_group.type === 'tree') {
          layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names.forEach(function(item, index) {
            let chart_id = `${chart_group_id}_vg${variable_group_index}_var${index}`;

            /**
             * Create HTML fragment for chart tab
             * @x-technical-debt switch from jQuery to D3 (or any future DOM library)
             * @x-technical-debt do not hardcode root of chart tabs
             */
            $('#charts .tab-content').append(tree_chart_template({ chart_id: chart_id }));

            // @x-technical-debt: need to check that item.tree_data is actually defined
            q.queue()
              .defer(d3.json, variables.tree[index].tree_data)
              .await(function(error, data) {
                let tree_mids = d3.layout.tree().nodes(data).map((item) => { return item.mid; });
                if(variables.tree.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index])['data_from_tree']) {
                  layer_data.dataset = layer_data.dataset.map((item) => {
                    // @x-hack add random position in binary tree
                    item[layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]] = tree_mids[Math.floor(Math.random() * tree_mids.length)];
                    return item;
                  });
                }

                pattrn_tree_chart(index + 1,
                  layer_data.dataset,
                  {
                    elements: {
                      title: `tree_chart_${chart_id}_title`,
                      chart_title: `tree_chart_${chart_id}_chartTitle`,
                      dc_chart: `#d3_tree_chart_${chart_id}`
                    },
                    fields: {
                      field_name: layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index],
                      field_title: is_defined(variable_list.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index])) ?
                        variable_list.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]).name :
                        layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]
                    },
                    dc_chart_group: chart_group_id,
                    scatterWidth: scatterWidth,
                    height: 600
                  },
                  {
                    crossfilter: layer_data.crossfilter,
                    dispatch: dispatch,
                    layer_data: layer_data
                  },
                  {
                    tree_data: data,
                    field_name: variables['tree'][index]
                  });
              });
          });
        }

        if(variable_group.type === 'event_count') {
          layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names.forEach((item, index) => {
            /**
             * Event counts over time
             * @x-technical-debt: to be refactored into its own module - or just
             * adapted to use the generic line_chart code and templates
             */
            let chart_id = `${chart_group_id}_vg${variable_group_index}_var${index}`;

            /**
             * Create HTML fragment for chart tab
             * @x-technical-debt switch from jQuery to D3 (or any future DOM library)
             * @x-technical-debt do not hardcode root of chart tabs
             */
            $('#charts .tab-content').append(event_count_chart_template({ chart_id: chart_id }));

            layer_data.dc_charts['event_count'].push(pattrn_event_count_chart(index + 1,
              layer_data.dataset,
              {
                elements: {
                  title: `event_count_chart_${chart_id}_title`,
                  chart_title: `event_count_chart_${chart_id}_chartTitle`,
                  dc_chart: `#d3_event_chart_${chart_id}`
                },
                fields: {
                  field_name: layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index],
                  field_title: is_defined(variable_list.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index])) ?
                    variable_list.find(item => item.id === layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]).name :
                    layer_data.non_empty_variables.find(vt => vt.type === variable_group.type).names[index]
                },
                dc_chart_group: chart_group_id,
                scatterWidth: scatterWidth
              },
              {
                crossfilter: layer_data.crossfilter,
                dispatch: dispatch,
                layer_data: layer_data
              }));
            })
        }
      });

      // TOTAL EVENTS
      var number_of_events = dc.dataCount("#number_total_events").dimension(layer_data.crossfilter).group(layer_data.crossfilter.groupAll());

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
      // @x-technical-debt: properly check for undefined values within
      // non_empty_X_variables - or better yet, refactor this to a list as
      // done for the rest of variable group data structures.
      layer_data.dataset.forEach(point_data.bind(undefined,
        config,
        instance_settings,
        layer_group,
        layer_data,
        _map,
        data_source_type,
        variable_list,
        pattrn_data_sets, {
          non_empty_integer_variables: is_defined(layer_data.non_empty_variables.find(vt => vt.type === 'integer')) ?
            layer_data.non_empty_variables.find(vt => vt.type === 'integer').names
            : [],
          non_empty_tag_variables: is_defined(layer_data.non_empty_variables.find(vt => vt.type === 'tag')) ?
            layer_data.non_empty_variables.find(vt => vt.type === 'tag').names
            : [],
          non_empty_boolean_variables: is_defined(layer_data.non_empty_variables.find(vt => vt.type === 'boolean')) ?
            layer_data.non_empty_variables.find(vt => vt.type === 'boolean').names
            : []
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
      dc.markerChart = function(parent, chart_group_id) {
        return marker_chart(
          parent,
          {
            chart_group_id: chart_group_id,
            layer_group_index: layer_group_index,
            layer_index: layer_index
          },
          instance_settings,
          config,
          {
            map: _map,
            L: L,
            dispatch: dispatch
          }
        );
      };

      // Execute markerChart function - assign marker dimension and group to the chart
      markerChart = dc.markerChart(instance_settings.map.root_selector, chart_group_id)
        .dimension(markerDimension)
        .group(markerGroup)
        .filterByBounds(true);

      /**
       * Dimension used to filter whole layer in or out, against the eventID
       * variable (which is always defined and always positive by construction)
       */
      layer_data.always_positive_dimension = layer_data.crossfilter.dimension(function(d) {
        return d.eventID;
      });

      /**
       * Toggle whole layer via toggle_layer closure
       * This works by filtering on the eventID column: since this is a
       * positive integer by construction, to remove all the events we filter
       * for -1 (which leads to no matches).
       */
      function toggle_layer() {
        if(this.checked) {
          always_positive_dimension.filterAll();
        } else {
          always_positive_dimension.filter(-1);
        }
        dc.redrawAll(chart_group_id);
      }

      /**
       * Attach data toggle behaviour to layer check box
       * @x-technical-debt: should be refactored out to own function
       * @x-technical-debt: whole widget generation (<input> element) should be done here
       */
      d3.select(`${layer_data_count_selector} .layer-root input`).on('click', toggle_layer);

      // DC data counter for this layer
      d3.select(`${layer_data_count_selector} .layer-root`)
        .append('span')
        .classed('data-counter', true);

      dc.dataCount(`${layer_data_count_selector} .layer-root .data-counter`, chart_group_id).dimension(layer_data.crossfilter).group(layer_data.crossfilter.groupAll());

      dc.renderAll(chart_group_id);

      return layer_data;

    });
  });

  activate_chart_download_buttons();

  // Set first generated variable tab as active
  d3.select('.tab-pane.variable').classed('active', true);

  // Resize charts
  window.onresize = function(event) {
    var newscatterWidth = document.getElementById('charts').offsetWidth;

    pattrn_layer_groups.forEach((layer_group, layer_group_index) => {
      layer_group.layers.forEach((layer, layer_index) => {
        // group id used to group DC charts
        let chart_group_id = `lg${layer_group_index}_ly${layer_index}`;

        Object.keys(layer.dc_charts).forEach((chart_group) => {
          layer.dc_charts[chart_group].forEach((chart) => {
            // @x-technical-debt: check performance issues and re-enable updating
            // of chart width on viewport resize.
            // Once performance is fixed, we can just remove the if around
            // chart.width(newscatterWidth)
          });
        });

        dc.redrawAll(chart_group_id);
      })
    })
  };
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
