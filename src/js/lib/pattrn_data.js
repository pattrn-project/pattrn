/*
Copyright (C) 2016 andrea rota <a@xelera.eu>

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

import { is_defined } from './utils/is_defined.js';

export function count_rows_with_data(dataset, item) {
  return dataset.reduce(function(pv, cv, ci, a) {
    return (is_defined(cv[item]) && cv[item] !== "") ? pv + 1 : pv;
  }, 0);
}

export function replace_undefined_values (parameters, variable) {
  if (!is_defined(parameters.row[variable]) || parameters.row[variable] === "") {
    parameters.dataset[parameters.index][variable] = parameters.empty_value;
  }
}

export function is_column_not_empty(dataset, item) {
  return count_rows_with_data(dataset, item) > 0;
}

export function list_all_pattrn_variables(variables) {
  var variable_list = [];

  Object.keys(variables).forEach(function(variable_type) {
    variable_list = variable_list.concat(variables[variable_type]);
  });

  return variable_list;
}

/**
 * Used for tests only: return an array of `maxdepth` elements
 * mapping to a random position on a binary tree of `maxdepth` depth.
 * @param Array args
 *  - Integer maxdepth The maximum depth of nodes to return
 *  - Integer mindepth The minimum depth of nodes to return
 */
export function random_node_in_tree(args) {
  // if mindepth is defined, pick a random actual depth between mindepth and
  // maxdepth
  var actualDepth;
  var random_integers;

  var mindepth = is_defined(args.mindepth) ? args.mindepth : 1;
  var maxdepth = args.maxdepth;

  // a maxdepth is needed: if not given, just return
  if(!is_defined(maxdepth)) return;

  actualDepth = Math.floor(Math.random() * (maxdepth - mindepth + 1)) + mindepth;
  random_integers = new Uint8Array(actualDepth);

  window.crypto.getRandomValues(random_integers);

  random_integers = Array.from(random_integers.map((number) => {
    return number % 2 == 0;
  }));
  random_integers.unshift(0);

  return random_integers;
}

/**
 * Compare arrays
 * Credits: http://stackoverflow.com/a/14853974/550077
 */
export function array_equals() {
  // Warn if overriding existing method
  if (Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
  // attach the .equals method to Array's prototype to call it on any array
  Array.prototype.equals = function(array) {
    // if the other array is a falsy value, return
    if (!array)
      return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
      return false;

    for (var i = 0, l = this.length; i < l; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this[i].equals(array[i]))
          return false;
      } else if (this[i] != array[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  }

  // Hide method from for-in loops
  Object.defineProperty(Array.prototype, "equals", {enumerable: false});
}

/**
 * declare available plugins
 * @x-technical-debt: this should be part of a proper plugin system, but in
 * the meanwhile we just hardcode this while leaving the whole structure
 * somewhat modular (defined in a separate module, abstracting the plugin
 * list via a data structure, etc.).
 */
export function pattrn_mock_data_plugins() {
  return {
    "random_node_in_tree": random_node_in_tree
  };
}

/**
 * Process metadata for core Pattrn variables, performing any variable
 * name translation as configured in metadata (e.g. renaming dataset-specific
 * variable names to the ones required by Pattrn core)
 */
export function rename_pattrn_core_variables(dataset_metadata, item) {
  if(is_defined(dataset_metadata)
    && is_defined(dataset_metadata.variables)
    && is_defined(dataset_metadata.variables.pattrn_core)
  ) {
    dataset_metadata.variables.pattrn_core.forEach((variable) => {
      if(is_defined(variable.pattrn_id) && is_defined(variable.id)) {
        item[variable.pattrn_id] = item[variable.id];
        delete item[variable.id];
      }
    });
  }

  return item;
}
