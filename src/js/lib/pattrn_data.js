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
