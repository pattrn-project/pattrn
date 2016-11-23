/*
Copyright (C) 2016 andrea rota <a@xelera.eu>
Copyright (C) 2015 Forensic Architecture

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

import d3 from 'd3';

/**
 * Activate a dc.js text search widget
 * @param Object widget_config The widget's configuration:
 *  *fields:
 *    * Object crossfilter The layer group's crossfilter object
 *    * Object dc The layer group's dc object
 *    * String chart_group The id of the layer group's DC chart group
 *    * [Object] non_empty_tag_variables List of non-empty variables of type
 *      tag for the current layer group
 *    * String el Selector for the layer group's text search widget (<input>
 *      element)
 *
 * @x-technical-debt: test that the array concatenation added
 * whilst refactoring makes sense and works as expected
 * @x-technical-debt: allow for scenarios where event_summary, source_name and
 * location_name are not defined in the source data (and hence not available
 * for the crossfilter dimension)
 */
export default function activate_text_search_widget(widget_config) {
  // Search

  const searchDimension = widget_config.crossfilter.dimension(function(d) {
    const tag_variables = widget_config.non_empty_tag_variables.map(function(item) {
      return d[item];
    });

    return [d.event_ID, d.event_summary, d.source_name, d.location_name].concat(tag_variables);
  });

  d3.select(widget_config.el).on('input', function() {
    text_filter(searchDimension, this.value);
    widget_config.dc.redrawAll(widget_config.chart_group_id);
  });
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
