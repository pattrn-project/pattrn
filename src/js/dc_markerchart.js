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

// Many thanks to Boyan Yurukov for his emails and help,
// check out his project - dc-leaflet: https://github.com/yurukov/dc.leaflet.js

function marker_chart(parent, chartGroup, L, dc, instance_settings, config) {

    // Create an empty chart
    var _chart = dc.baseChart({});
    var markercluster;
    var markerList = [];
    var blockpopup = false;

    // Render function
    _chart._doRender = function() {

        // MAP SETTINGS
        _map = L.map(instance_settings.map.root_selector, {
            touchZoom: false,
            scrollWheelZoom: false,
            maxZoom:14,
            minZoom:2}
        );

        // Baselayers
        var base_layer_01 = L.tileLayer(config.base_layers[0].url, {
                // attribution: ''
        }).addTo(_map);

        var basemaps = {};
        for (i=0; i<config.base_layers.length; i++){
            layerName = config.base_layers[i].name;
            basemaps[layerName] = L.tileLayer(config.base_layers[i].url);
        }

        var overlaymaps = {};

        L.control.layers(basemaps, overlaymaps, {position: 'topleft'}).addTo(_map);

        // Create markercluster
        markercluster = new L.MarkerClusterGroup({
            disableClusteringAtZoom: 12,
            showCoverageOnHover: false,
            chunkedLoading: true,
            spiderfyDistanceMultiplier:2,
            maxClusterRadius: 24
        });

        // Add markercluster to the map
        _map.addLayer(markercluster);

        // Remove layers from marker cluster
        markercluster.clearLayers();

        _chart.group().all().forEach(function(v, i) {
            markerList = markerList.concat(v.value.markers);
        });

        markercluster.addLayers(markerList);

        _map.fitBounds(markercluster.getBounds());

        _chart._postRender();

        return _chart._doRedraw();
    };

    // Redraw function
    _chart._doRedraw = function(){
        var markerList = [];
        // Remove layers from marker cluster
        markercluster.clearLayers();
        _chart.group().all().forEach(function(v, i) {
            markerList = markerList.concat(v.value.markers);
        });
        markercluster.addLayers(markerList);
        return _chart;
    };

    _chart.blockpopup = function(_) {
        blockpopup=  _=== null;
    };

    _chart.brushOn = function(_) {
        if (!arguments.length) return brushOn;
        brushOn = _;
        return _chart;
    };

    _chart.filterByBounds = function(_) {
        if (!arguments.length) return filterByBounds;
        filterByBounds = _;
        return _chart;
    };

    _chart.getMap = function() {
        return _map;
    };

    // UPDATE MARKERS
    _chart._postRender = function() {

        if (filterByBounds)
            _chart.filterHandler(doFilterByBounds);
            _map.on('zoomend moveend', zoomFilter, this );

        if (!filterByBounds)
            _map.on('click', zoomFilter, this );
            _map.on('zoomstart', zoomStart, this);

    };

    var zoomStart = function(e) {
        zooming=true;
    };

    var zoomFilter = function(e) {

        if (e.type=="moveend" && (zooming || e.hard))
            return; zooming=false;

        if (filterByBounds) {
            var filter;
            // reset filter based on pan and zoom
            if (_map.getCenter().equals([31.4, 34.3]) && _map.getZoom()==11)
                filter = null;
                else
                    filter = _map.getBounds();
                    dc.events.trigger(function () {
                        _chart.filter(null);
                        if (filter) {
                            innerFilter=true;
                            _chart.filter(filter);
                            innerFilter=false;
                        }
                        dc.redrawAll(_chart.chartGroup());
                    });
        }

        else if (_chart.filter() && (e.type=="click" ||
            (_chart.filter() in markerList &&
            !_map.getBounds().contains(markerList[_chart.filter()].getLatLng())))) {
                dc.events.trigger(function () {
                    _chart.filter(null);
                    dc.redrawAll(_chart.chartGroup());
                });
            }

    };

    var doFilterByBounds = function(dimension, filters) {
        _chart.dimension().filter(null);
        if (filters && filters.length>0) {
            _chart.dimension().filterFunction(function(d) {
                if (!(d in markerList))
                    return false;
                    var location0 = markerList[d].getLatLng();
                    return location0 && filters[0].contains(location0);
                });
                if (!innerFilter && _map.getBounds().toString!=filters[0].toString())
                    _map.fitBounds(filters[0]);
                }
            };

    var cha = _chart.anchor(parent, chartGroup);
    return cha;
}

module.exports = marker_chart;
