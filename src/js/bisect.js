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

import { is_defined } from './is_defined.js';

/**
 * MONKEYPATCH - bisect as needed until dc works
 */
function bisect_features(features, config) {
  if(is_defined(config)
    && is_defined(config.data_sources)
    && is_defined(config.data_sources.geojson_data)
    && is_defined(config.data_sources.geojson_data.debug)
    && is_defined(config.data_sources.geojson_data.debug.bisect)
    && Array.isArray(config.data_sources.geojson_data.debug.bisect)
    && config.data_sources.geojson_data.debug.bisect.length < 10) {
      var bisect = config.data_sources.geojson_data.debug.bisect.filter(function(element, index, array) {
        return element === 'left' || element === 'right';
      });

      if(bisect.length !== config.data_sources.geojson_data.debug.bisect.length) {
        console.log('Bisect configuration provided is not valid: expecting an array whose members can either be "left" or "right"');
      } else {
        bisect.forEach(function(element, index, array) {
          var half = Math.floor(features.length / 2);

          if(element === 'left') {
            features = features.splice(0, half);
          } else if(element === 'right') {
            features = features.splice(half, features.length);
          }
        });
      }
  }

  return features;
}

module.exports = bisect_features;
