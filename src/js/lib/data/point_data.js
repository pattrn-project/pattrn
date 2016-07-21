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

var $ = require('jquery');

import {
  is_defined
} from '../utils/is_defined.js';

/**
 * Handle data and setup of events for each data point
 *
 * @x-technical-debt: this function was taken out of the legacy code's single
 * scope while refactoring, but as we need several (7+, depending on how we
 * count) variables from the parent scope, we should really pass these in
 * as an object.
 */
export function point_data(config, instance_settings, _map, data_source_type, variable_list, pattrn_data_sets, non_empty_variables, markerChart, item, index) {
  // If data on source data set is available, set colour of markers accordingly, otherwise use defaults
  var marker_color = is_defined(item.pattrn_data_set) && is_defined(pattrn_data_sets[item.pattrn_data_set]) ?
    pattrn_data_sets[item.pattrn_data_set] :
    instance_settings.map.markers.color;

  item.i = index;

  var dayMonthFormat = d3.time.format("%d/%m/%y");
  var fullDateFormat = d3.time.format("%A, %d %B %Y");

  // Marker settings
  item.marker = new L.circleMarker(new L.LatLng(item.latitude, item.longitude), {
    title: "",
    radius: 7,
    color: marker_color,
    opacity: 0.9,
    fillOpacity: 0.8,
    clickable: true,
  });

  item.marker.data = item;

  // Tooltip content
  var content = {};

  content.event_details = "<div class='col-sm-12' style='padding-top:15px' id='background'>";
  if (is_defined(item.event_ID)) content.event_details += "<p class='caption-grey'>EVENT ID:</p> <p class='noMargin'>" + item.event_ID + "</p>";
  if (is_defined(item.dd)) content.event_details += "<p class='caption-grey'>DATE:</p> <p class='noMargin'> " + fullDateFormat(item.dd) + "</p>";
  if (is_defined(item.location_name)) content.event_details += "<p class='caption-grey'>LOCATION: </p> <p class='noMargin'> " + item.location_name + "</p><br/>";
  content.event_details += "</div>";

  // Summary content
  content.event_summary = "<div class='col-sm-12' style='padding-top:15px' id='infowindow'>";
  if (is_defined(item.event_summary)) {
    content.event_summary += "<p class='summary'>" + item.event_summary + "</p>";
  }
  if (is_defined(item.source_name)) {
    content.event_summary += "<p class='caption-grey'>SOURCE:</p> <p class='summary'>" + item.source_name + "</p><br/>";
  }
  content.event_summary += (
    "<div class='summaryTable'></div><br/>" +
    "</div>"
  );

  // set empty popup to leverage leaflet functions
  var hoverContent = "";
  var popup = item.marker.popup = new L.popup()
    .setLatLng(item.marker.getLatLng())
    .setContent(hoverContent);

  var elements = {
    details: document.getElementById('dateTime'),
    summary: document.getElementById('summary'),
    media: document.getElementById('media')
  };

  item.marker.on("click", point_data_click.bind(undefined, config, instance_settings, _map, data_source_type, variable_list, non_empty_variables, pattrn_data_sets, elements, content, markerChart, item, index));
}

function point_data_click(config, instance_settings, _map, data_source_type, variable_list, non_empty_variables, pattrn_data_sets, elements, content, markerChart, item, index, e) {
  var image_html = document.getElementById("image_gallery").innerHTML = '';
  var video_html = document.getElementById("video_gallery").innerHTML = '';
  var summary_table = document.getElementById("summaryTable").innerHTML = '';
  var urls = document.getElementById("urls").innerHTML = '';

  var highlightColour = instance_settings.colour;

  $('.edit_dropdown').remove();

  if (is_defined(markerChart) && markerChart.filter() == e.target.data.i) {
    markerChart.filter(true);
  } else {

    $('#edit_dropdown').append(
      "<li><a target='_blank' href=" + config.script_url + item.event_ID + " class='edit_dropdown noMargin'>Edit this event</a><li>"
    );

    if (is_defined(e.target.data.photos)) {
      // Photos
      d3.json(e.target.data.photos, function(D) {

        var json_photos = $.parseJSON('[' + item.photos + ']');

        for (j = 0; j < json_photos.length; j++) {
          $('#image_gallery').append(
            '<li data-src="' + json_photos[j].src +
            '"data-sub-html="' + json_photos[j].subhtml + '" >' +
            '<img src="' + json_photos[j].thumb + '"/>' +
            '<br/>' +
            json_photos[j].caption +
            '<p>Source: ' + json_photos[j].source + '</p>' +
            '</li>'
          );
        }


        $(document).ready(function() {
          $("#image_gallery").lightGallery();
        });

      });
    }

    if (is_defined(e.target.data.videos)) {
      // Videos
      d3.json(e.target.data.videos, function(D) {

        var json_videos = $.parseJSON('[' + item.videos + ']');

        for (j = 0; j < json_videos.length; j++) {
          $('#video_gallery').append(
            '<li style= "list-style-type: none;" data-src="' + json_videos[j].src +
            '"data-sub-html="' + json_videos[j].subhtml + '" id="image_link">' +
            '<a href="#"><p>Video: <strong>' + json_videos[j].caption + '</strong></p></a>' +
            '<p>Source: ' + json_videos[j].source + '</p>' +
            '</li>'
          );
        }

        $(document).ready(function() {
          $("#video_gallery").lightGallery();
        });

      });
    }

    if (is_defined(e.target.data.links)) {
      // Urls
      d3.json(e.target.data.links, function(D) {

        var array_urls = $.parseJSON('[' + item.links + ']');

        for (j = 0; j < array_urls.length; j++) {
          $('#urls').append(
            '<li><a target="_blank" href="' + array_urls[j].url + '"> Title: ' + array_urls[j].title + '</a></li><p style="line-height: 100%"><br/>Subtitle: ' + array_urls[j].subtitle + '</p>'
          );
        }

      });
    }

    // Open popup
    // @x-technical-debt: ok to check if var is defined, but it should be
    // actually *always* defined here - if it is undefined, something has
    // failed upstream
    if (is_defined(markerChart)) {
      e.target.popup.openOn(markerChart.getMap());
    }

    // Change style of popup
    $('.leaflet-popup-content-wrapper').addClass('transparent');
    $('.leaflet-popup-tip').addClass('transparent');
    $('.leaflet-popup-close-button').addClass('transparent');

    // Style marker on click
    item.marker.setRadius(10);
    item.marker.setStyle({
      color: highlightColour,
      fillColor: highlightColour,
      fillOpacity: 0.8,
    });

    // Add infowindow content
    elements.details.innerHTML = content.event_details;
    elements.summary.innerHTML = content.event_summary;


    if ('geojson_file' === data_source_type) {
      Object.keys(item.source_variables)
        .filter(function(value) {
          return !value.match(/^pattrn_[^_]{2,}/);
        })
        .forEach(function(value, index, array) {
          if (is_defined(item.source_variables[value])) appendGeoJSONPropertyToTable(value, item.source_variables[value], variable_list);
        });
    }

    non_empty_variables.non_empty_integer_variables.forEach(function(item, index) {
      appendIntegerValueToTable(e, item, variable_list);
    });

    non_empty_variables.non_empty_tag_variables.forEach(function(item, index) {
      appendTagValueToTable(e, item, variable_list);
    });

    non_empty_variables.non_empty_boolean_variables.forEach(function(item, index) {
      appendTagValueToTable(e, item, variable_list);
    });
  }

  _map.on("popupclose", function(item) {
    // If data on source data set is available, set colour of markers accordingly, otherwise use defaults
    var marker_color = is_defined(item.pattrn_data_set) && is_defined(pattrn_data_sets[item.pattrn_data_set]) ?
      pattrn_data_sets[item.pattrn_data_set] :
      instance_settings.map.markers.color;

    item.marker.setRadius(7);
    item.marker.setStyle({
      fillColor: marker_color,
      color: marker_color,
      fillOpacity: instance_settings.map.markers.opacity
    });
    content.innerHTML = "<p style='padding-top:15px'>Please click a marker<br><br></p>";
    summary.innerHTML = "<p>This panel will update when a marker is clicked</p>";
    var summary_table = document.getElementById("summaryTable").innerHTML = '';
    var image_html = document.getElementById("image_gallery").innerHTML = '';
    var video_html = document.getElementById("video_gallery").innerHTML = '';
    var urls = document.getElementById("urls").innerHTML = '';
    $('.edit_dropdown').remove();
  });
}

// Table content - generic functions
function appendIntegerValueToTable(d, field_name, variable_list) {
  if (!is_defined(d[field_name])) return;

  let variable = variable_list.find(variable => variable.id === field_name);
  let full_field_name = is_defined(variable) && is_defined(variable.name) ? variable.name : field_name;

  $('#summaryTable').append(
    "<tr class='col-sm-12'><th class='col-sm-6'><p>" + full_field_name +
    "</p></th> <th class='col-sm-6' ><p class='white'> " + d[field_name] +
    "</p> </th> </tr>"
  );
}

function appendTagValueToTable(d, field_name, variable_list) {
  if (!is_defined(d[field_name])) return;

  let variable = variable_list.find(variable => variable.id === field_name);
  let full_field_name = is_defined(variable) && is_defined(variable.name) ? variable.name : field_name;

  $('#summaryTable').append(
    "<tr class='col-sm-12'><th class='col-sm-6'><p>" + full_field_name +
    "</p></th><th class='col-sm-6' ><p class='white'> " + d[field_name].split(',').join(', ') +
    "</p> </th> </tr>"
  );
}

function appendGeoJSONPropertyToTable(key, value, variable_list) {
  let variable = variable_list.find(variable => variable.id === key);
  let full_field_name = is_defined(variable) && is_defined(variable.name) ? variable.name : key;

  $('#summaryTable').append(
    "<tr class='col-sm-12'><th class='col-sm-6'><p>" + full_field_name +
    "</p></th><th class='col-sm-6' ><p class='white'> " + value +
    "</p> </th> </tr>"
  );
}
