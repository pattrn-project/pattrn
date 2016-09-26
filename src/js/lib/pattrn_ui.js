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

var $ = require('jquery');
var saveAs = require('file-saver');

import { is_defined } from './utils/is_defined';

/**
 * Initialize UI elements (title, subtitle, title area colours, about text)
 *
 * @x-modifies-dom
 * @param {Object} instance_settings The settings for this Pattrn instance
 */
export function initialize_ui(instance_settings) {
  var release_status_el;
  var highlight_el;

  // Title
  document
    .getElementById('platformTitle')
    .innerHTML = instance_settings.title

  // Subtitle
  document
    .getElementById('platformSubtitle')
    .innerHTML = instance_settings.subtitle;

  // Is this a pre-release platform? If so, display the pre-release label defined (e.g. beta)
  if(is_defined(instance_settings.release_status)) {
    release_status_el = document.getElementById('platformTitle').appendChild(document.createElement('span'));

    if(is_defined(release_status_el)) {
      release_status_el.className = 'pre-release';
      release_status_el.innerHTML = '(' + instance_settings.release_status + ')';
    }
  }

  // About modal
  document
    .getElementById('aboutModalContent')
    .innerHTML = instance_settings.about;

  // Highlight colour
  highlight_el = document.getElementById("highlight");
  highlight_el.style.backgroundColor = instance_settings.colour;
  $('.filter').css('color', instance_settings.colour);
}

/**
 * When user clicks on the map, outside of any markers, set the #info and #data-layers panels
 * to inactive (UX depends on theme); conversely, set #info panel to active
 * when user clicks on it; same for #data-layers
 * @x-technical-debt: this should be moved to a theme-specific layout
 * setup function.
 * @param Object _map The main Leaflet map object
 */
export function activate_side_panels(_map) {
  _map.on('click', bring_map_to_center);
  $('#data-layers.active .panel-control').on('click', bring_map_to_center);
  $('#info.active .panel-control').on('click', bring_map_to_center);
  $('#info').on('click', () => {
    $('#info').addClass('active');
    $('#data-layers').removeClass('active');
    $('#charts').addClass('info-panel-active');
  });
  $('#data-layers').on('click', () => {
    $('#data-layers').addClass('active');
    $('#info').removeClass('active');
  });
}

/**
 * close side panels and bring map to center
 */
function bring_map_to_center() {
  $('#info').removeClass('active');
  $('#data-layers').removeClass('active');
  $('#charts').removeClass('info-panel-active');
}

/**
 * Attach events to data layers toggle, so that clicking anywhere on the div
 * of a layer group will toggle it
 */
export function activate_data_layers_toggle() {
  $('.layer-group-container').on('click', function(e) {
    // do not trigger this if any of the .layer-group-container children, rather
    // than the .layer-group-container itself, are clicked
    if(e.target !== this) return;

    $(this).parent().find('input').prop('checked', true);
  });
}

/**
 * Attach FileSaver behaviour to chart download links
 */
export function activate_chart_download_buttons() {
  $('.downloadChartAsSVG').on('click', function() {
    let svg_string = $(this).parents('.tab-pane').find('svg').prop('outerHTML');
    // let svg_blob = new Blob([svg_string], {type: "image/svg+xml;charset=utf-8"});
    // saveAs(svg_blob, 'chart.svg');
    console.log(svg_string);
  })
}
