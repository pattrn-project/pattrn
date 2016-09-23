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
import { log_dropped_row } from '../utils/hello_devs.js';
import { is_defined } from '../utils/is_defined.js';

/**
 * Drop rows with invalid datetimes
 *
 * @param Array dataset The master Pattrn dataset
 * @return Array The dataset without rows with invalid datetimes
 */
export default function add_dateobject_to_rows(dataset) {
  /**
   * timestamp format to be used for parsing
   * @x-feature: this could be made configurable. pros: flexibility, cons:
   * lack of consistency across Pattrn instances (but do we care? just pick
   * a sensible default (ISO8601?) and document things accurately)
   */
  let dateFormat = d3.time.format('%Y-%m-%dT%H:%M:%S');

  // Remove rows with invalid dates
  dataset = dataset
    .filter(function(d) {
      try {
        dateFormat.parse(d.date_time);
      } catch (e) {
        return false;
      }
      return true;
    })
    .map(function(d) {
      // Add dd member to each case, holding a date object
      // (this is what is used throughout Pattrn, since Pattrn v1.0)
      d.dd = dateFormat.parse(d.date_time);

      return d;
    });

  return dataset;
}
