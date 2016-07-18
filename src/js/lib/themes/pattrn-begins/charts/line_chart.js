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

let jade = require('pug');

let chart_template =
`.tab-pane.fade.in(id = chart_id)
  .col-sm-12.col-lg-12(id = 'd3_line_chart_' + chart_id)
    .col-sm-6.col-lg-6
      p.filterText
        | Current filter:
        span#highlightText.filter No active filter: click/drag on charts to filter data
    .col-sm-6.col-lg-6
      p.chartTitle(id = 'line_chart_' + chart_id + '_chartTitle')`;

/**
 * Compile template for chart markup
 * @param Object locals The variables to be used in the template
 * @x-technical-debt locals need to be sanity-checked
 * @x-technical-debt This function should be a generic template function, shared
 * amongst themes. Some themes may need to do more here than just compiling the
 * template, but likely not - this is supposed to be a thin view, with logic
 * kept in a model.
 * @x-technical-debt Actual Jade template should be in a separate file, read in
 * at build time. Or not. The whole themes strategy needs to be planned
 * carefully.
 */
export function template(locals) {
  return jade.compile(chart_template)(locals);
}
