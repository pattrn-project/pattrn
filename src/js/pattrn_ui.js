/*
Copyright (C) 2016 andrea rota <a@xelera.eu>
Copyright (C) 2015 Forensic Architecture

This file is part of Pattrn - http://pattrn.co/.

It includes code originally developed as part of version 1.0 of Pattrn and
distributed under the PATTRN-V1-LICENSE, with changes (licensed under AGPL-3.0)
adding new features and allowing integration of the legacy code with the
AGPL-3.0 Pattrn 2.0 distribution.

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

var is_defined = require('./is_defined');
var $ = require('jquery');

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
