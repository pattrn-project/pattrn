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
import { add_node_id_to_tree_nodes, list_tree_variable } from '../pattrn_data.js';

var d3 = require('d3');

/**
 * handle tree charts. currently just a stub.
 */
export function pattrn_tree_chart(index, chart_settings, dataset, dc, xf, tree_data) {
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
  tree_chart_0X_title.innerHTML = "Events by " + chart_settings.fields.field_title;
  var tree_chart_0X_chartTitle = document.getElementById(chart_settings.elements.chart_title).innerHTML = "Events by " + chart_settings.fields.field_title;

  var width = chart_width;
  var height = chart_height;
  var maxLabel = 150;
  var duration = chart_transition_duration;
  var radius = 5;

  var i = 0;
  var root;

  // crossfilter dimension and group
  window.tree_dimension = xf.dimension((d) => { return is_defined(d[tree_data.field_name.id]) ? d[tree_data.field_name.id] : 0; });
  // @x-technical-debt: allow for scenarios where a count is defined (rather than just returning 1 for counts as in this first iteration)
  window.tree_group = tree_dimension.group().reduceSum((d) => { return 1; });

  var tree = d3.layout.tree()
    .size([height, width]);

  var diagonal = d3.svg.diagonal()
    .projection(function(d) {
      return [d.y, d.x];
    });

  var svg = d3.select(chart_settings.elements.d3_chart).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + maxLabel + ",0)");

  root = tree_data.tree_data;
  root.x0 = height / 2;
  root.y0 = 0;

  root.children.forEach(collapse);

  update(root);

  function update(source) {
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse();
    var links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) {
      d.y = d.depth * maxLabel;
    });

    // Update the nodes…
    svg.selectAll("g.node").remove();
    var node = svg.selectAll("g.node")
      .data(nodes, function(d) {
        return d.id || (d.id = ++i);
      });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on("click", click);

    nodeEnter.append("circle")
      .attr("r", 0)
      .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "white";
      });

    nodeEnter.append("text")
      .attr("x", function(d) {
        var spacing = computeRadius(d) + 5;
        return d.children || d._children ? -spacing : spacing;
      })
      .attr("dy", "3")
      .attr("text-anchor", function(d) {
        return d.children || d._children ? "end" : "start";
      })
      .attr("class", function(d) {
        var active = d.active;
        return d.active ? "active" : "inactive";
      })
      .text(function(d) {
        var id, xf_node, count, size, descendant_mids;

        if(is_defined(d.mid)) {
          // get id of node
          // id = d.node_id.join(':');
          // count of items in this node
          xf_node = window.tree_group.all().find(function(item) { return item.key === d.mid; });

          descendant_mids = flatten(rec_reduce(function(item) { return is_defined(item) ? item.mid : null; }, d, [ '_children', 'children' ]));

          size = descendant_mids.map((mid) => {
            var xf_node = window.tree_group.all().find((item) => {
              return item.key === mid;
            });
            return is_defined(xf_node) ? xf_node.value : 0;
          }).reduce((a, b) => a + b, 0);

          // if a crossfilter group for this node is available, show its associated count
          count = (is_defined(xf_node) ? xf_node.value : 0) + size;

          return count ? `${d.name} (${count})` : `${d.name}`;
        } else {
          return d.name;
        }
      })
      .style("fill-opacity", 0)
      .on("click", function(d) {
        d.active = !d.active;
        console.log(d);
      });

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    nodeUpdate.select("circle")
      .attr("r", function(d) {
        return radius;
      })
      .style("fill", function(d) {
        return d._children ? "steelblue" : "#fff";
      });

    nodeUpdate.select("text").style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    nodeExit.select("circle").attr("r", 0);
    nodeExit.select("text").style("fill-opacity", 0);

    // Update the links…
    var link = svg.selectAll("path.link")
      .data(links, function(d) {
        return d.target.id;
      });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {
          x: source.x0,
          y: source.y0
        };
        return diagonal({
          source: o,
          target: o
        });
      });

    // Transition links to their new position.
    link.transition()
      .duration(duration)
      .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {
          x: source.x,
          y: source.y
        };
        return diagonal({
          source: o,
          target: o
        });
      })
      .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function computeRadius(d) {
    if (d.children || d._children) return radius + (radius * nbEndNodes(d) / 10);
    else return radius;
  }

  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

}

/**
 * For a given node of a tree, count events associated directly with the node,
 * plus all events of all its descendents.
 * Rather than traversing the whole subtree of descendents for each node, we
 * rely on the counts of a node's immediate children and sum their sum to
 * the node's own count.
 */
function countEventsIncludingDescendants(node) {

}

function nbEndNodes(n) {
  var nb = 0;
  if (n.children) {
    n.children.forEach(function(c) {
      nb += nbEndNodes(c);
    });
  } else if (n._children) {
    n._children.forEach(function(c) {
      nb += nbEndNodes(c);
    });
  } else nb++;

  return nb;
}

function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

/**
 * recursive reduce
 * used to build the tree walker which calculates size of subtrees
 */
function rec_reduce(fn, base, children_members) {
  var children_member = children_members.filter((member) => {
    return is_defined(base[member]) && base[member].length;
  });

  if(children_member.length === 0) {
    return fn(base);
  } else {
    return base[children_member[0]].map((item) => { return rec_reduce(fn, item, children_members); });
  }
}

function get_node_size(node) {
  var xf_node = window.tree_group.all().find(function(item) {return item.key === node.mid ;});
  return is_defined(xf_node) ? xf_node.value : null;
}

function flatten(ary) {
    var ret = [];

    // Avoid treating strings as arrays - if this not an array, just return an empty array
    if(!Array.isArray(ary)) return ret;

    for(var i = 0; i < ary.length; i++) {
        if(Array.isArray(ary[i])) {
            ret = ret.concat(flatten(ary[i]));
        } else {
            ret.push(ary[i]);
        }
    }
    return ret;
}
