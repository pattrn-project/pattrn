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
          layer_group_id: layer_group.id,
          type: layer_group.type,
          layers: layer_group.layers,
          crossfilters: intersection_layer_group(dataset, metadata, layer_group)
        };
      } else if(layer_group.type === 'union') {
        return {
          layer_group_id: layer_group.id,
          type: layer_group.type,
          layers: layer_group.layers,
          crossfilters: union_layer_group(dataset, metadata, layer_group)
        };
      }
    });
  }

  return xfs;
}

function union_layer_group(dataset, metadata, layer_group) {
  let group_layers_data = layer_group.layers.map((layer, index) => {
    return layer_data(dataset, metadata, [ layer_group.layers[index] ], layer);
  });

  return group_layers_data.map(item => {
    return {
      crossfilter: crossfilter(item),
      data: item
    }
  });
}

function intersection_layer_group(dataset, metadata, layer_group) {
  let group_layers_data = layer_group.layers.map((layer, index) => {
    return layer_data(dataset, metadata, [ layer_group.layers[index] ], layer);
  });

  let data_union = [].concat.apply([], group_layers_data);

  return [
    {
      crossfilter: crossfilter(data_union),
      data: data_union
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
