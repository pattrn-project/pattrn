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
  let date_format_string = '%Y-%m-%dT%H:%M:%S';
  let dateFormat = d3.time.format(date_format_string);

  // Remove rows with invalid dates
  dataset = dataset
    .map(function(d) {
      let date_object;

      /**
       * Parse datetime, set to null if we trip an exception or if datetime
       * cannot be parsed; rows with null d.dd will then be filtered out
       */
      try {
        date_object = dateFormat.parse(d.date_time);
      } catch (e) {
        date_object = null;
      }

      /**
       * Add dd member to each case, holding a date object
       * (this is what is used throughout Pattrn, since Pattrn v1.0).
       * d.dd will be null if we tripped an exception while parsing d.date_time
       * or of d3.date.format().parse() returned null because of not being
       * able to parse d.date_time.
       */
      d.dd = date_object;

      return d;
    })
    .filter(function(d) {
      if(is_defined(d.dd)) {
        return true;
      } else {
        log_dropped_row(d, `The date format used for this row's date_time (${d.date_time}) does not match the d3.time.format configured for this instance (${date_format_string})`);
        return false;
      }
    });

  return dataset;
}
