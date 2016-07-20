
/*
Copyright (C) 2016 andrea rota <a@xelera.eu>
Copyright (C) 2015 Forensic Architecture

This file is part of Pattrn - http://pattrn.co/.

It includes code originally developed as part of version 1.0 of Pattrn and
distributed under the PATTRN-V1-LICENSE, with changes (licensed under AGPL-3.0)
adding new features and allowing integration of the legacy code with the
AGPL-3.0 Pattrn 2.0 distribution.

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
import dc from 'dc';

/**
 * event count chart
 * This code/module should likely be removed, and the generic line chart
 * code should be used instead. At the moment this is not possible as line
 * chart code includes handling of event count widgets (brush), but this
 * has been split out, that should be possible.
 * @x-modifies-dom
 * @param {Number} index Index (integer) of this chart within the set of charts of this type in use
 * @param {Object} dataset The master dataset (refactor - do we need this here?)
 * @param {Object} chart_settings Settings for this chart.
 *  * color_scale: a color scale for the chart, if not using the default one
 *    (https://github.com/dc-js/dc.js/blob/master/web/docs/api-1.6.0.md#colorscolorscale-or-colorarray)
 *  * turn_on_controls: [infer from legacy code (originally used only in line_chart_01)]
 *  * width: width of the chart (default: 300)
 *  * height: height of the chart (default: 200)
 *  * transition_duration: duration of chart animation transition
 *    (https://github.com/dc-js/dc.js/blob/master/web/docs/api-1.6.0.md#transitiondurationduration)
 *  * elements: DOM elements to update
 *    * title: chart title
 *    * chart_title: chart chart title (ehrm legacy code?)
 *    * dc_chart: d3 element of line chart
 *  * fields:
 *    * field_name: the name of the field in the dataset
 * @param {Object} pattrn_objects Pattrn objects from jumbo scope
 */
export function pattrn_event_count_chart(index, dataset, chart_settings, pattrn_objects) {
  // default from legacy code, defined as chartHeight within the main consume_table() function
  var chart_height = chart_settings.height || 200;

  var event_chart_chartTitle = document.getElementById(chart_settings.elements.chart_title).innerHTML = chart_settings.fields.field_title + " over time";

  var event_chart = dc.lineChart(chart_settings.elements.dc_chart, chart_settings.dc_chart_group);
  var event_chart_dimension = pattrn_objects.xf.dimension(function(d) {
    return !Number.isNaN(+d3.time.day(d.dd)) ? +d3.time.day(d.dd) : null;
  });
  var event_chart_group = event_chart_dimension.group().reduceCount(function(d) {
    return !Number.isNaN(+d3.time.day(d.dd)) ? +d3.time.day(d.dd) : null;
  });

  event_chart.width(chart_settings.scatterWidth)
    .height(chart_height)
    .margins({
      top: 0,
      right: 50,
      bottom: 50,
      left: 50
    })
    .dimension(event_chart_dimension)
    .group(event_chart_group)
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
      // @x-technical-debt: switch to D3 v4 API
      pattrn_objects.dispatch.filter();
      return document.getElementById("filterList").className = "glyphicon glyphicon-filter activeFilter";
    })
    .brushOn(true)
    .xAxis();

  event_chart.yAxis().ticks(3);
  event_chart.turnOnControls(true);
  event_chart.xAxis().tickFormat(d3.time.format("%d-%m-%y"));

  return event_chart;
}
