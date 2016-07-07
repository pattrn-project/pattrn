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

import { bisect_features } from './utils/bisect.js';
import { is_defined } from'./utils/is_defined.js';

/**
 * Translate GeoJSON source data to the legacy format that
 * Pattrn v1 expects.
 * Only FeatureCollections comprising Points are supported at the moment
 * @param Object data The GeoJSON feature collection
 * @param Object The dataset structured as Pattrn v1 expects
 */
export function geojson_to_pattrn_legacy_data_structure(data, dataset_metadata, config, settings) {
  var features = [];
  var variables = dataset_metadata.variables;

  if(! is_defined(data) || ! is_defined(data.features) || ! Array.isArray(data.features)) {
    throw 'No GeoJSON feature defined';
  }

  features = data.features
    /**
     * Extract key variables from source GeoJSON data,
     * mapping them to a flat structure as per Pattrn v1
     * source data structure.
     * @x-technical-debt: validate first; reject items without valid lat/lon,
     * date_time, and make sure we never try to access undefined values
     */
    .map(function(value, index, array) {
      var data = {
        event_ID: index,
        location_name: is_defined(value.properties.pattrn_location_name) ? value.properties.pattrn_location_name : null,
        latitude: value.geometry.coordinates[1],
        longitude: value.geometry.coordinates[0],
        geo_accuracy: null,
        date_time: is_defined(value.properties.pattrn_date_time) ? value.properties.pattrn_date_time : null,
        event_summary: is_defined(value.properties.pattrn_event_summary) ? value.properties.pattrn_event_summary : null,
        source_name: null
      };
      var defined_variables = Object.keys(data).length;

      /**
       * Pad variables with dummy empty ones (null is not ok because
       * of lack of error handling before use of variables in legacy
       * code) up to the first integer variable in Pattrn v1 data layout.
       */
      for(var i = 0; i < 8 - defined_variables; i++) {
        data['dummy_base_' + i] = '';
      }

      /**
       * TECHNICAL_DEBT: limit this to 5 until
       * we break from the v1 data layout legacy.
       * Add int variables, if defined
       */
      if(is_defined(variables.integer)) {
        variables.integer.forEach(function(v, i, a) {
          if(is_defined(v.id)) {
            data[v.id] = value.properties[v.id];
          }
        });
      }

      /**
       * Pad variables with dummy empty ones (null is not ok because
       * of lack of error handling before use of variables in legacy
       * code) up to the first tag variable in Pattrn v1 data layout.
       */
      defined_variables = Object.keys(data).length;
      for(var i = 0; i < 13 - defined_variables; i++) {
        data['dummy_int_' + i] = '';
      }

      /**
       * TECHNICAL_DEBT: do this only if applicable
       * add source_data_set as first tag variable
       */
      data['source_data_set'] = value.properties.pattrn_data_set;

      /**
       * TECHNICAL_DEBT: limit this to 4 (5 minus the previous one) until
       * we break from the v1 data layout legacy.
       * Add other tag variables, if defined
       */
      if(is_defined(variables.tag)) {
        variables.tag.forEach(function(v, i, a) {
          if(is_defined(v.id)) {
            data[v.id] = value.properties[v.id];
          }
        });
      }

      /**
       * Pad variables with dummy empty ones (null is not ok because
       * of lack of error handling before use of variables in legacy
       * code) up to the first bool variable in Pattrn v1 data layout.
       */
      defined_variables = Object.keys(data).length;
      for(var i = 0; i < 18 - defined_variables; i++) {
        data['dummy_tag_' + i] = '';
      }

      /**
       * TECHNICAL_DEBT: limit this to 4 (5 minus the previous one) until
       * we break from the v1 data layout legacy.
       * Add other tag variables, if defined
       */
      if(is_defined(variables.boolean)) {
        variables.boolean.forEach(function(v, i, a) {
          if(is_defined(v.id)) {
            data[v.id] = value.properties[v.id];
          }
        });
      }

      /**
       * and finally pad until we have 28 variables as in a complete
       * Pattrn v1 dataset
       */
      defined_variables = Object.keys(data).length;
      for(var i = 0; i < 29 - defined_variables; i++) {
        data['dummy_extra_' + i] = '';
      }

      /**
       * Now add any tree variables - no need to fit them into legacy dataset
       * structure as variables of this type are not supported by legacy Pattrn
       * in any case.
       */
      if(is_defined(variables.tree)) {
        variables.tree.forEach(function(v, i, a) {
          if(is_defined(v.id)) {
            data[v.id] = value.properties[v.id];
          }
        });
      }

      data['pattrn_data_set'] = value.properties.pattrn_data_set;
      data['source_variables'] = value.properties;

      return data;
    })
    /**
     * Filter out observations that don't include all of the
     * variables needed (date_time, latitude, longitude).
     */
    .filter(function(value, index, array) {
      return is_defined(value.date_time) && is_defined(value.latitude) && is_defined(value.longitude);
    });

  features = bisect_features(features, config);

  return features;
}
