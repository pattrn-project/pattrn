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

import { is_defined } from './utils/is_defined';

/**
 * Override default settings with any available instance-specific settings
 * @param {Object} platform_settings Default settings (can be overridden by settings in the `settings` object)
 * @param {Object} settings_from_config The settings for this instance as loaded from the config file
 */
export function process_settings(platform_settings, settings_from_config) {
  /**
   * Initialize instance_settings with defaults
   */
  var instance_settings = platform_settings.default;

  /**
   * If settings_from_config is not defined, there is nothing to override - just
   * return the default settings.
   */
  if(!is_defined(settings_from_config)) {
    return instance_settings;
  }

  /**
   * Merge settings from configuration file into instance settings
   * @x-technical-debt: this should be done through plain object merging, after
   * validating settings_from_config against our settings schema (which needs
   * to be defined)
   */
  if(is_defined(settings_from_config.title)) {
    instance_settings.title = settings_from_config.title;
  }
  if(is_defined(settings_from_config.subtitle)) {
    instance_settings.subtitle = settings_from_config.subtitle;
  }
  if(is_defined(settings_from_config.about)) {
    instance_settings.subtitle = settings_from_config.about;
  }
  if(is_defined(settings_from_config.colour)) {
    instance_settings.subtitle = settings_from_config.colour;
  }

  return instance_settings;
}
