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

export const platform_settings = {
  "default": {
    "release_status": "beta",
    "environment": "development",
    "title": "Pattrn",
    "subtitle": "A data-driven, participatory fact mapping platform",
    "about": "Pattrn is a tool to map complex events - such as conflicts, protests, or crises - as they unfold.",
    "colour": "#f45656",
    "map": {
      "root_selector": "chart-map",
      "markers": {
        "color": "black",
        "fillColor": "black",
        "opacity": "0.8"
      },
      "zoom": {
        "max": 14,
        "min": 2
      },
      "disableClusteringAtZoom": 12
    }
  }
};
