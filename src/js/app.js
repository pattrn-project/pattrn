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

// require dependencies
var jquery = require('jquery'),
    L = require('leaflet'),
    d3 = require('d3'),
    q = require('d3-queue').queue(),
    dc = require('dc'),
    crossfilter = require('crossfilter'),
    tabletop = require('tabletop');

// expose jquery as global.jQuery; this is needed for jQuery plugins
global.jQuery = jquery;

// require bootstrap (menus etc) - needs jQuery global
require('bootstrap');

// leaflet.marketcluster Leaflet plugin
require('leaflet.markercluster');
// lightgallery jQuery plugin
require('lightgallery');

// require the core Pattrn code
// TECHNICAL_DEBT: this will be broken down in manageable modules
var pattrn = require('./platform.js');

/**
 * finally, invoke the actual monolithic pattrn() function
 * TECHNICAL_DEBT: until the full pattrn() function is refactored, we pass in
 * its dependencies, in order to shim the legacy Pattrn code
 */
pattrn(jquery, d3, q, dc, crossfilter, tabletop);
