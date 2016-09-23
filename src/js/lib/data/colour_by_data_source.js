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

import d3 from 'd3';

/**
 * If the pattrn_data_set variable is set for any of the observations,
 * associate colours to each source data set, to be used when displaying
 * markers.
 *
 * @param Array dataset The master Pattrn data set
 * @return Object Colours by source dataset
 */
export default function colour_by_data_source(dataset) {
  let pattrn_data_sets = {};
  let data_source_column = dataset.map(function(value) {
      return value.pattrn_data_set;
    })
    .reduce(function(p, c) {
      if (p.indexOf(c) < 0) p.push(c);
      return p;
    }, []);

  /**
   * @x-technical-debt: a different color scale should be supported, for
   * instances in which >10 data sets are used
   */
  var fill = d3.scale.category10();

  data_source_column.forEach(function(value, index, array) {
    pattrn_data_sets[value] = fill(index);
  });

  return pattrn_data_sets;
}
