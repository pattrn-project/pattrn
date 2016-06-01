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

  var width = chart_width;
  var height = chart_height;
  var maxLabel = 150;
  var duration = chart_transition_duration;
  var radius = 5;

  var i = 0;
  var root;

  var tree = d3.layout.tree()
      .size([height, width]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select(chart_settings.elements.d3_chart).append("svg")
      .attr("width", width)
      .attr("height", height)
          .append("g")
          .attr("transform", "translate(" + maxLabel + ",0)");

  root = data_tree;
  root.x0 = height / 2;
  root.y0 = 0;

  root.children.forEach(collapse);

  update(root);
/*
  var vis = d3.select(chart_settings.elements.d3_chart)
    .append('svg')
    .attr('width', chart_width)
    .attr('height', chart_height)
    .append('g')
    .attr('transform', 'translate(40, 0)');

  var tree = d3.layout.tree()
    .size([chart_width - 100, chart_height - 100]);
  var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

    // Preparing the data for the tree layout, convert data into an array of nodes
    var nodes = tree.nodes(data_tree);
    // Create an array with all the links
    var links = tree.links(nodes);

    console.log(data_tree);
    console.log(nodes);
    console.log(links);

    var link = vis.selectAll("pathlink")
    .data(links)
    .enter().append("svg:path")
    .attr("class", "link")
    .attr("d", diagonal);

    var node = vis.selectAll("g.node")
    .data(nodes)
    .enter().append("g")
    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    // Add the dot at every node
    node.append("circle")
    .attr("r", 3.5);

    // place the name atribute left or right depending if children
    node.append("text")
    .attr("dx", function(d) { return d.children ? -8 : 8; })
    .attr("dy", 3)
    .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
    .text(function(d) { return d.name; });

    */

    function update(source)
    {
        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse();
        var links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * maxLabel; });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function(d){
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d){ return "translate(" + source.y0 + "," + source.x0 + ")"; })
            .on("click", click);

        nodeEnter.append("circle")
            .attr("r", 0)
            .style("fill", function(d){
                return d._children ? "lightsteelblue" : "white";
            });

        nodeEnter.append("text")
            .attr("x", function(d){
                var spacing = computeRadius(d) + 5;
                return d.children || d._children ? -spacing : spacing;
            })
            .attr("dy", "3")
            .attr("text-anchor", function(d){ return d.children || d._children ? "end" : "start"; })
            .attr("class", function(d) {
              var active = d.active;
              return d.active ? "active" : "inactive";
            })
            .text(function(d){
              return d.count ? `${d.name} (${d.count})` : d.name;
            })
            .style("fill-opacity", 0)
            .on("click", function(d) {
              d.active = !d.active;
              console.log(d);
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", function(d){ return computeRadius(d); })
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text").style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
            .remove();

        nodeExit.select("circle").attr("r", 0);
        nodeExit.select("text").style("fill-opacity", 0);

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d){ return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d){
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d){
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d){
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    function computeRadius(d)
    {
        if(d.children || d._children) return radius + (radius * nbEndNodes(d) / 10);
        else return radius;
    }


    function click(d)
    {
        if (d.children){
            d._children = d.children;
            d.children = null;
        }
        else{
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }

}




function nbEndNodes(n)
{
    var nb = 0;
    if(n.children){
        n.children.forEach(function(c){
            nb += nbEndNodes(c);
        });
    }
    else if(n._children){
        n._children.forEach(function(c){
            nb += nbEndNodes(c);
        });
    }
    else nb++;

    return nb;
}

function collapse(d){
    if (d.children){
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}
