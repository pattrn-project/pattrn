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

let widget_template =
`mixin widget-content(widget_id)
  .border(
    id = 'd3_aggregate_count_' + widget_id
    style = 'margin-left:10px'
  )
    h2.agreggateText
      span.number-display
      p(id = 'agreggateCountTitle_' + widget_id) No Data
  div(
    id = 'SliderChart_' + widget_id
    style='padding-top:10px'
  )
if index == 0
  #agreggate.col-sm-2.col-lg-2.col-lg-offset-1
    + widget-content(widget_id)
else
  #agreggate.col-sm-2.col-lg-2
    + widget-content(widget_id)`;

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
  return jade.compile(widget_template)(locals);
}
