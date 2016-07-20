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

var d3 = require('d3');
var dc = require('dc');

/**
 * bar chart
 * While transitioning from Pattrn v1 to v2: this function subsumes
 * the code manually duplicated (5x, with tiny variations) in the legacy code.
 * Pattrn v1 was handling up to 5 (hard-coded) line charts representing
 * counts of events over time. The aim of the v1->v2 refactor is to avoid
 * manual code duplication and to allow an arbitrary number of charts of this
 * type to be used in the Pattrn frontend.
 * @x-modifies-dom
 * @param {Number} index Index (integer) of this line chart within the set of line charts in use
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
 *    * d3_line_chart: d3 element of line chart
 *  * fields:
 *    * field_name: the name of the field in the dataset
 * @param {Object} dc The main dc.js instance used in the app [needs refactoring]
 * @param {Object} xf The main Crossfilter instance used in the app [needs refactoring]
 */
export function pattrn_tag_bar_chart(index, dataset, chart_settings, pattrn_objects) {
  /**
   * Parameters passed in and defaults
   */
  //var slider_chart_color_scale = chart_settings.color_scale || d3.scale.category20c();
  //var turn_on_controls = chart_settings.turn_on_controls || false;
  // default from legacy code; originally hardcoded in each code snippet: 300, except line_chart_03 (150)
  //var chart_width = chart_settings.width || 300;
  // default from legacy code, defined as chartHeight within the main consume_table() function
  var chart_height = chart_settings.height || 350;
  // legacy code uses 500ms for charts 3, 4 and 5 and doesn't override default for
  // charts 1 and 2
  //var chart_transition_duration = chart_settings.transition_duration || 750;

  // transition from legacy: assign first to scope variable - just use the
  // chart_settings.fields.field_name var when refactoring
  var tags_field_name_X = chart_settings.fields.field_name;

  // REDUCE FUNCTION
  function reduceAddTarget_0X(p, v) {
    if (typeof v[tags_field_name_X] !== 'string') return p;
    v[tags_field_name_X].split(',').forEach(function(val, idx) {
      p[val] = (p[val] || 0) + 1; //increment counts
    });
    return p;
  }

  function reduceRemoveTarget_0X(p, v) {
    if (typeof v[tags_field_name_X] !== 'string') return p;
    v[tags_field_name_X].split(',').forEach(function(val, idx) {
      p[val] = (p[val] || 0) - 1; //decrement counts
    });
    return p;
  }

  function reduceInitialTarget_0X() {
    return {};
  }

  var bar_chart_0X_title = document.getElementById(chart_settings.elements.title);
  // @x-technical-debt: create element and re-enable following line
  // bar_chart_0X_title.innerHTML = "Events by " + chart_settings.fields.field_title;
  var bar_chart_0X_chartTitle = document.getElementById(chart_settings.elements.chart_title).innerHTML = "Events by " + chart_settings.fields.field_title;
  var bar_chart_0X = dc.barChart(chart_settings.elements.d3_bar_chart, chart_settings.dc_chart_group);
  var bar_chart_0X_dimension = pattrn_objects.xf.dimension(function(d) {
    return d[tags_field_name_X];
  });
  var bar_chart_0X_group = bar_chart_0X_dimension.groupAll().reduce(reduceAddTarget_0X, reduceRemoveTarget_0X, reduceInitialTarget_0X).value();

  bar_chart_0X_group.all = function() {
    var newObject = [];
    for (var key in this) {
      /**
       * Do not count items marked as 'Unknown'.
       * @x-technical-debt: This needs to properly handle unknowns marked as
       * such in the source data, by differentiating unknowns introduced whilst
       * loading the pattrn data to avoid NaNs in crossfilter dimensions (see
       * #14).
       */
      if (this.hasOwnProperty(key) && key != "all" && key !== 'Unknown') {
        newObject.push({
          key: key,
          value: this[key]
        });
      }
    }
    return newObject;
  };

  bar_chart_0X
    .width(chart_settings.scatterWidth)
    .height(chart_height)
    .dimension(bar_chart_0X_dimension)
    .group(bar_chart_0X_group)
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
    // for a rough sqrt scale:
    // .y(d3.scale.sqrt().clamp(true).domain([0,dataset.length]))
    .yAxisLabel("no. of events")
    .elasticY(true)
    .on(`renderlet.${chart_settings.elements.title}`, function(chart) {
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
      // @x-technical-debt: switch to D3 v4 API
      pattrn_objects.dispatch.filter();
      return document.getElementById("filterList").className = "glyphicon glyphicon-filter activeFilter";
    })
    .barPadding(0.1)
    .outerPadding(0.05);

  bar_chart_0X.yAxis().ticks(3);

  return bar_chart_0X;
}
