/*
Copyright (C) 2016 andrea rota <a@xelera.eu>

The core D3 collapsible tree code is Copyright (C) Mike Bostock 2016,
distributed under the GNU GPLv3 and published here:
https://gist.github.com/mbostock/4339083

This file is part of Pattrn - http://pattrn.co/.

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

import {
  is_defined
} from '../utils/is_defined.js';
import {
  add_node_id_to_tree_nodes,
  list_tree_variable
} from '../pattrn_data.js';

import d3 from 'd3';
import dc from 'dc';

/**
 * handle tree charts. currently just a stub.
 */
export function pattrn_tree_chart(index, chart_settings, dataset, dc, xf, data_tree) {
  /**
   * Parameters passed in and defaults
   */
  // default from legacy code; originally hardcoded in each code snippet: 300, except line_chart_03 (150)
  var chart_width = chart_settings.width || chart_settings.scatterWidth || 300;
  // default from legacy code, defined as chartHeight within the main consume_table() function
  var chart_height = chart_settings.height || 350;
  var chart_transition_duration = chart_settings.transition_duration || 750;

  // transition from legacy: assign first to scope variable - just use the
  // chart_settings.fields.field_name var when refactoring
  // var tree_field_name_X = chart_settings.fields.field_name;

  var tree_chart_0X_title = document.getElementById(chart_settings.elements.title);
  tree_chart_0X_title.innerHTML = "Events by " + chart_settings.elements.title; // chart_settings.fields.field_title;
  var tree_chart_0X_chartTitle = document.getElementById(chart_settings.elements.chart_title).innerHTML = "Events by " + chart_settings.elements.title; // chart_settings.fields.field_title;
}
