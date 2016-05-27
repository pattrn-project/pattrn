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

import { is_defined } from '../utils/is_defined.js';

export function point_data(pattrn_data_sets, d, i) {
  // If data on source data set is available, set colour of markers accordingly, otherwise use defaults
  var marker_color = is_defined(d.pattrn_data_set) && is_defined(pattrn_data_sets[d.pattrn_data_set]) ? pattrn_data_sets[d.pattrn_data_set] : instance_settings.map.markers.color;

  d.i = i;
  var dayMonthFormat = d3.time.format("%d/%m/%y");
  var fullDateFormat = d3.time.format("%A, %d %B %Y");

  // Marker settings
  d.marker = new L.circleMarker(new L.LatLng(d.latitude, d.longitude), {
    title: "",
    radius: 7,
    color: marker_color,
    opacity: 0.9,
    fillOpacity: 0.8,
    clickable: true,
  });

  d.marker.data = d;

  // Tooltip content
  var eventDetailsContent = "<div class='col-sm-12' style='padding-top:15px' id='background'>";
  if (is_defined(d.event_ID)) eventDetailsContent += "<p class='caption-grey'>EVENT ID:</p> <p class='noMargin'>" + d.event_ID + "</p>";
  if (is_defined(d.dd)) eventDetailsContent += "<p class='caption-grey'>DATE:</p> <p class='noMargin'> " + fullDateFormat(d.dd) + "</p>";
  if (is_defined(d.location_name)) eventDetailsContent += "<p class='caption-grey'>LOCATION: </p> <p class='noMargin'> " + d.location_name + "</p><br/>";
  eventDetailsContent += "</div>";

  // Summary content
  var summaryContent = "<div class='col-sm-12' style='padding-top:15px' id='infowindow'>";
  if (is_defined(d.event_summary)) summaryContent += "<p class='summary'>" + d.event_summary + "</p>";
  if (is_defined(d.source_name)) summaryContent += "<p class='caption-grey'>SOURCE:</p> <p class='summary'>" + d.source_name + "</p><br/>";
  summaryContent += (
    "<div class='summaryTable'></div><br/>" +
    "</div>"
  );

  // set empty popup to leverage leaflet functions
  var hoverContent = "";
  var popup = d.marker.popup = new L.popup()
    .setLatLng(d.marker.getLatLng())
    .setContent(hoverContent);

  var content = document.getElementById('dateTime');
  var Summary = document.getElementById('summary');
  var Media = document.getElementById('media');

  d.marker.on("click", function(e) {

    var image_html = document.getElementById("image_gallery").innerHTML = '';
    var video_html = document.getElementById("video_gallery").innerHTML = '';
    var summary_table = document.getElementById("summaryTable").innerHTML = '';
    var urls = document.getElementById("urls").innerHTML = '';
    $('.edit_dropdown').remove();

    if (is_defined(markerChart) && markerChart.filter() == e.target.data.i) {
      markerChart.filter(true);
    } else {

      $('#edit_dropdown').append(
        "<li><a target='_blank' href=" + config.script_url + d.event_ID + " class='edit_dropdown noMargin'>Edit this event</a><li>"
      );

      if(is_defined(e.target.data.photos)) {
        // Photos
        d3.json(e.target.data.photos, function(D) {

          var json_photos = $.parseJSON('[' + dataset[i].photos + ']');

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

      if(is_defined(e.target.data.videos)) {
        // Videos
        d3.json(e.target.data.videos, function(D) {

          var json_videos = $.parseJSON('[' + dataset[i].videos + ']');

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

      if(is_defined(e.target.data.links)) {
        // Urls
        d3.json(e.target.data.links, function(D) {

          var array_urls = $.parseJSON('[' + dataset[i].links + ']');

          for (j = 0; j < array_urls.length; j++) {
            $('#urls').append(
              '<li><a target="_blank" href="' + array_urls[j].url + '"> Title: ' + array_urls[j].title + '</a></li><p style="line-height: 100%"><br/>Subtitle: ' + array_urls[j].subtitle + '</p>'
            );
          }

        });
      }

      // Open popup
      e.target.popup.openOn(markerChart.getMap());

      // Change style of popup
      $('.leaflet-popup-content-wrapper').addClass('transparent');
      $('.leaflet-popup-tip').addClass('transparent');
      $('.leaflet-popup-close-button').addClass('transparent');

      // Style marker on click
      d.marker.setRadius(10);
      d.marker.setStyle({
        color: highlightColour,
        fillColor: highlightColour,
        fillOpacity: 0.8,
      });

      // Add infowindow content
      content.innerHTML = eventDetailsContent;
      Summary.innerHTML = summaryContent;

      // Table content - generic functions
      function appendIntegerValueToTable(field_name) {
        if (!is_defined(d[field_name])) return;
        $('#summaryTable').append(
          "<tr class='col-sm-12'><th class='col-sm-6'><p>" + field_name +
          "</p></th> <th class='col-sm-6' ><p class='white'> " + d[field_name] +
          "</p> </th> </tr>"
        );
      }

      function appendTagValueToTable(field_name) {
        if (!is_defined(d[field_name])) return;
        $('#summaryTable').append(
          "<tr class='col-sm-12'><th class='col-sm-6'><p>" + field_name +
          "</p></th><th class='col-sm-6' ><p class='white'> " + d[field_name].split(',').join(', ') +
          "</p> </th> </tr>"
        );
      }

      function appendGeoJSONPropertyToTable(key, value) {
        $('#summaryTable').append(
          "<tr class='col-sm-12'><th class='col-sm-6'><p>" + key +
          "</p></th><th class='col-sm-6' ><p class='white'> " + value +
          "</p> </th> </tr>"
        );
      }

      if ('geojson_file' === data_source_type) {
        Object.keys(d.source_variables)
          .filter(function(value) {
            return !value.match(/^pattrn_[^_]{2,}/);
          })
          .forEach(function(value, index, array) {
            if (is_defined(d.source_variables[value])) appendGeoJSONPropertyToTable(value, d.source_variables[value]);
          });
      }

      non_empty_number_variables.forEach(function(item, index) {
        appendIntegerValueToTable(item);
      });

      non_empty_tag_variables.forEach(function(item, index) {
        appendTagValueToTable(item);
      });

      non_empty_boolean_variables.forEach(function(item, index) {
        appendTagValueToTable(item);
      });
    }

    _map.on("popupclose", function(e) {
      // If data on source data set is available, set colour of markers accordingly, otherwise use defaults
      var marker_color = is_defined(d.pattrn_data_set) && is_defined(pattrn_data_sets[d.pattrn_data_set]) ? pattrn_data_sets[d.pattrn_data_set] : instance_settings.map.markers.color;

      d.marker.setRadius(7);
      d.marker.setStyle({
        fillColor: marker_color,
        color: marker_color,
        fillOpacity: instance_settings.map.markers.opacity
      });
      content.innerHTML = "<p style='padding-top:15px'>Please click a marker<br><br></p>";
      Summary.innerHTML = "<p>This panel will update when a marker is clicked</p>";
      var summary_table = document.getElementById("summaryTable").innerHTML = '';
      var image_html = document.getElementById("image_gallery").innerHTML = '';
      var video_html = document.getElementById("video_gallery").innerHTML = '';
      var urls = document.getElementById("urls").innerHTML = '';
      $('.edit_dropdown').remove();
    });
  });
}
