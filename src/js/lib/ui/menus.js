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

import { is_defined } from '../utils/is_defined.js';

/**
 * Generate layer groups/layers menu for data layer panel from
 * layer group data
 * @x-technical-debt: document parameters/return
 */
export function generate_data_layer_menu(pattrn_layer_groups, pattrn_data_sets, variable_list) {
   pattrn_layer_groups.forEach((layer_group, group_index) => {
     let layer_group_root = d3
       .select('#myExploreTab .layer-groups-root')
       .append('div')
       .classed('layer-group-root', true);

     let layer_group_element_id = `layer-group-selector-${layer_group.id}`;

     let radio_el_attributes = {
       id: layer_group_element_id,
       type: 'radio',
       name: 'layer_groups',
       value: layer_group.id
     };

     if(group_index === 0) radio_el_attributes.checked = true;

     layer_group_root
       .append('input')
         .classed('layer-group', true)
         .attr(radio_el_attributes);

     layer_group_root
       .append('div')
       .classed('layer-group-container', true);

     layer_group_root
       .select('.layer-group-container')
       .append('label')
       .attr({
         for: layer_group_element_id
       })
       .text(() => {
         return layer_group.name;
       });

     layer_group_root = layer_group_root
       .select('.layer-group-container')
       .append('ul');

     layer_group.layers.forEach((layer_data, layer_index) => {
       let layer_menu_root = layer_group_root
         .append('li')
         .classed('layer-menu-root', true)
         .classed(`layer-root-${layer_data.id}`, true);

       layer_menu_root.append('span')
         .classed('layer-root', true)
         .style('color', (d, i) => {
           return is_defined(pattrn_data_sets[layer_data.id]) ? pattrn_data_sets[layer_data.id] : 'inherit';
         })
         .append('label')
         .text(layer_data.name)
         .append('input')
         .attr('type', 'checkbox')
         .attr('checked', 'true');

       layer_menu_root.append('ul');

       layer_data.non_empty_variables.forEach((variable_group, variable_group_index) => {
         let variable_group_menu_root = layer_menu_root
           .append('li')
           .append('ul')
           .selectAll('li')
           .data(variable_group.names);

         variable_group_menu_root
           .enter()
           .append('li')
           .append('a')
           .attr('role', 'menuitem')
           .attr('data-toggle', 'tab')
           .attr('href', (d, i) => {
             return `#lg${group_index}_ly${layer_index}_vg${variable_group_index}_var${i}`;
           })
           .text((d, i) => {
             /**
              * if variable is defined in metadata file, return its name
              * otherwise return the variable id (column name)
              * Variables should always be defined in metadata, but whilst
              * transitioning from legacy event count charts to the Pattrn v2
              * layer/layer group structure, the variable used for event counts
              * (eventID, added at runtime) is used without it having to be
              * defined in the metadata file. This should be the only edge case,
              * and such it should be properly refactored to a non-edge setup
              * as part of technical debt noted elsewhere.
              */
             let variable = variable_list.find(variable => variable.id === d)

             return is_defined(variable) ? variable.name : d;
           });
       });

     });
   });
}
