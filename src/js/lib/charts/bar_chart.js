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
 * bar chart
 * While transitioning from Pattrn v1 to v2: this function subsumes
 * the code manually duplicated (5x, with tiny variations) in the legacy code.
 * Pattrn v1 was handling up to 5 (hard-coded) line charts representing
 * counts of events over time. The aim of the v1->v2 refactor is to avoid
 * manual code duplication and to allow an arbitrary number of charts of this
 * type to be used in the Pattrn frontend.
 * @x-modifies-dom
 * @x-technical-debt: just pass in the variable and retrieve variable name and
 * label (currently: data.field_name and data.field_title) here (via library
 * function shared with other chart types)
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
 *    * dc_chart: d3 element of line chart
 *  * data:
 *    * variable: the variable object
 *    * field_name: the name of the field in the dataset
 *    * field_title: the label to display for this variable, if defined in the metadata
 * @param {Object} pattrn_objects Pattrn objects from jumbo scope
 *  * fields:
 *    * dc: The main dc.js instance used in the app
 *    * crossfilter: The main Crossfilter instance used in the app
 *    * layer_data: Metadata of the layer for which this chart is being created
 */
export function pattrn_bar_chart(index, dataset, chart_settings, pattrn_objects) {
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

  // REDUCE FUNCTION
  function reduceAddTarget(p, v) {
    if (typeof v[chart_settings.data.field_name] !== 'string') return p;
    v[chart_settings.data.field_name].split(',').forEach(function(val, idx) {
      p[val] = (p[val] || 0) + 1; //increment counts
    });
    return p;
  }

  function reduceRemoveTarget(p, v) {
    if (typeof v[chart_settings.data.field_name] !== 'string') return p;
    v[chart_settings.data.field_name].split(',').forEach(function(val, idx) {
      p[val] = (p[val] || 0) - 1; //decrement counts
    });
    return p;
  }

  function reduceInitialTarget() {
    return {};
  }

  var chart_title = document.getElementById(chart_settings.elements.title);
  // @x-technical-debt: create element and re-enable following line
  // chart_title.innerHTML = "Events by " + chart_settings.data.field_title;
  var chart_chartTitle = document.getElementById(chart_settings.elements.chart_title)
    .innerHTML = `Events by ${chart_settings.data.field_title} (${pattrn_objects.layer_data.name})`;

  var chart = dc.barChart(chart_settings.elements.dc_chart, chart_settings.dc_chart_group);
  var chart_xf_dimension = pattrn_objects.crossfilter.dimension(function(d) {
    return d[chart_settings.data.field_name];
  });
  var chart_xf_group = chart_xf_dimension.groupAll().reduce(reduceAddTarget, reduceRemoveTarget, reduceInitialTarget).value();

  chart_xf_group.all = function() {
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

  chart
    .width(chart_settings.scatterWidth)
    .height(chart_height)
    .dimension(chart_xf_dimension)
    .group(chart_xf_group)
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
    .y(d3.scale.sqrt().clamp(true).domain([0,dataset.length]))
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
      /**
       * @since 2.0.0beta1
       * We now support union (logical OR) filters on categorial variables
       * using bar charts. This may make sense as the default, but for the
       * moment we just keep the Pattrn v1.0 default (intersection filter),
       * letting users configure on a per-variable basis whether to use
       * union filters instead.
       * @x-technical-debt: there should be no assumption about the type of
       * filter (union or intersection) to be used for each variable: except
       * when loading Pattrn v1.0 configuration and data (for which the legacy
       * behaviour of intersection filter type should be the only allowed),
       * the type of filter must be configured for each filter.
       * The if below should be changed accordingly (i.e. test for Pattrn v1.0
       * behaviour, otherwise raise exception or discard variable if
       * filter_type is not defined).
       */
      if(chart_settings.data.variable.filter_type === 'union') {
        return filterHandlerUnion(dimension, filters);
      } else {
        return filterHandlerIntersection(dimension, filters);
      }
    })
    .on("filtered", function(d) {
      // @x-technical-debt: switch to D3 v4 API
      pattrn_objects.dispatch.filter();
      return document.getElementById("filterList").className = "glyphicon glyphicon-filter activeFilter";
    })
    .barPadding(0.1)
    .outerPadding(0.05);

  chart.yAxis().ticks(3);

  return chart;
}

/**
 * Crossfilter filter handler implementing union (logical OR) filter: given a
 * set of selected values, return all data rows for which this variable is set
 * to *any* of the values.
 * @param Object dimension The current dimension
 * @param Array filters The filter values currently selected on the bar chart
 * @return Boolean Whether any of the filter values apply to the current datum
 */
function filterHandlerUnion(dimension, filters) {
  dimension.filter(null);
  if (filters.length === 0) {
    dimension.filter(null);
  } else {
    dimension.filterFunction(function(d) {
      for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        if (filter.isFiltered && filter.isFiltered(d)) {
          return true;
        } else if (filter <= d && filter >= d) {
          return true;
        }
      }
      return false;
    });
  }
  return filters;
}

/**
 * Crossfilter filter handler implementing intersection (logical AND) filter: given a
 * set of selected values, return all data rows for which this variable is set
 * to *any* of the values.
 * @param Object dimension The current dimension
 * @param Array filters The filter values currently selected on the bar chart
 * @return Boolean Whether any of the filter values apply to the current datum
 */
function filterHandlerIntersection(dimension, filters) {
  dimension.filter(null);
  dimension.filterFunction(function(d) {
    for (var i = 0; i < filters.length; i++) {
      if (d.indexOf(filters[i]) < 0) return false;
    }
    return true;
  });
  return filters;
}
