import { is_defined } from './is_defined.js';

/**
 * MONKEYPATCH - bisect as needed until dc works
 */
export function bisect_features(features, config) {
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
