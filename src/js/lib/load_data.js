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

var tabletop = require('tabletop');

/**
 * Load data
 * Eventually, multiple sources will be supported. Until the
 * core visualization code is updated to handle multiple sources,
 * we actually only load a single data source:
 * by default, if any JSON files are defined, we load the first one;
 * as fallback, if any Google Sheet document is defined, we load the
 * first one.
 */
export function load_data(data_sources) {
  if(data_sources.geojson_data && data_sources.geojson_data.data_url && data_sources.geojson_data.data_url.length) {
    q.defer(d3.json, data_sources.geojson_data.data_url)
      .defer(d3.json, data_sources.geojson_data.metadata_url)
      .defer(d3.json, data_sources.geojson_data.settings_url)
      .await(function(error, dataset, variables, settings) {
        if (error) throw error;
        var dataset_in_legacy_format = geojson_to_pattrn_legacy_data_structure(dataset, variables, config, settings);
        consume_table(dataset_in_legacy_format, variables, settings, 'geojson_file');
      });
  } else if(data_sources.json_file && data_sources.json_file.length) {
    d3.json(data_sources.json_file[0], function(error, data) {
      var dataset = data.Data.elements,
          settings = data.Settings.elements;

      consume_table(dataset, null, settings, 'json_file');
    });
  } else if(data_sources.google_docs && data_sources.google_docs.length) {
      init_table(data_sources.google_docs[0]);
  }
}

/**
 * TableTop table initialization
 * @x-technical-debt: write documentation
 */
export function load_google_sheets_data(callback, consume_table_callback, config, platform_settings, src, xhr_error, dataset_metadata) {
  // @x-technical-debt: handle xhr errors
  tabletop.init({
    key: src.public_spreadsheet,
    callback: callback.bind(undefined, consume_table_callback, config, platform_settings, dataset_metadata),
    simpleSheet: false
  });
}

/**
 *
 * Wrap actual function, should be done with .bind()
 * @x-technical-debt: write documentation
 */
export function consume_table_google_docs(consume_table_callback, config, platform_settings, dataset_metadata, data) {
    var dataset = data.Data.elements,
        settings = data.Settings.elements[0];  // settings are in the first data row - just get this

    consume_table_callback('google_docs', config, platform_settings, settings, dataset, dataset_metadata);
}
