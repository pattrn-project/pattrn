let crossfilter = require('crossfilter2');

import { is_defined } from'../utils/is_defined.js';

export function parse_pattrn_layer_groups(dataset, metadata) {
  /**
   * array of crossfilters
   * one for each layer group of type 'intersection' (all filters apply across
   * the whole set of layers), one for each layer of each layer group of type
   * 'union' (each filter on each layer operates independently)
   */
  let xfs = [];

  if(is_defined(metadata.layers) && is_defined(metadata.layer_groups)) {
    xfs = metadata.layer_groups.map((layer_group) => {

      if(layer_group.type === 'intersection') {
        return {
          id: layer_group.id,
          name: layer_group.name,
          type: layer_group.type,
          layer_names: layer_group.layers,
          variables: layer_group.variables,
          layers: intersection_layer_group(dataset, metadata, layer_group)
        };
      } else if(layer_group.type === 'union') {
        return {
          id: layer_group.id,
          name: layer_group.name,
          type: layer_group.type,
          layer_names: layer_group.layers,
          variables: layer_group.variables,
          layers: union_layer_group(dataset, metadata, layer_group)
        };
      }
    });
  }

  return xfs;
}

function union_layer_group(dataset, metadata, layer_group) {
  let group_layers_data = layer_group.layers.map((layer, index) => {
    let data = layer_data(dataset, metadata, [ layer_group.layers[index] ], layer);
    let layer_metadata = metadata.layers.find(layer => layer.id === layer_group.layers[index]);

    return {
      id: layer_metadata.id,
      name: layer_metadata.name,
      data: data,
      crossfilter: crossfilter(data),
      variables: layer_metadata.variables
    };
  });

  return group_layers_data;
}

function intersection_layer_group(dataset, metadata, layer_group) {
  let group_layers_data = layer_group.layers.map((layer, index) => {
    return layer_data(dataset, metadata, [ layer_group.layers[index] ], layer);
  });

  let data_union = [].concat.apply([], group_layers_data);

  /**
   * @x-technical-debt: best not to hardcode id and name here. we may need to
   * make this configurable via metadata or instance defaults in a later
   * iteration.
   */
  return [
    {
      id: 'all_data',
      name: 'all data',
      crossfilter: crossfilter(data_union),
      data: data_union,
      variables: layer_group.variables
    }
  ];
}

function layer_data(dataset, metadata, layers, layer) {
  let group_layer_selects = get_group_layer_selects(metadata, layers);

  let layer_data = dataset.filter(datum => {
    let matching_selects = [];

    matching_selects = group_layer_selects.filter(select => {
      return is_defined(datum[select.where.column]) && select.where.in.indexOf(datum[select.where.column]) >= 0;
    });

    return matching_selects.length;
  });

  return layer_data;
}

function get_group_layer_selects(metadata, layers) {
  return layers.map(layer => {
    return metadata.layers.find(metadata_layer => metadata_layer.id === layer).select;
  })
}
