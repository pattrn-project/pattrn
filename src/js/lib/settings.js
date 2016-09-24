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
   if(is_defined(settings_from_config.environment)) {
     instance_settings.environment = settings_from_config.environment;
   }
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
  if(is_defined(settings_from_config.map)) {
    if(is_defined(settings_from_config.map.root_selector)) {
      instance_settings.map.root_selector = settings_from_config.map.root_selector
    }
    if(is_defined(settings_from_config.map.markers)) {
      instance_settings.map.markers = settings_from_config.map.markers
    }
    if(is_defined(settings_from_config.map.zoom)) {
      instance_settings.map.zoom = settings_from_config.map.zoom
    }
    if(is_defined(settings_from_config.map.zoom)) {
      instance_settings.map.disableClusteringAtZoom = settings_from_config.map.disableClusteringAtZoom
    }
  }

  /**
   * Make configuration available as global object
   * @x-technical-debt: yuck globals. better way to do this while keeping
   * configuration readily available through the Pattrn code lifecycle without
   * passing it around? Pattrn singleton class, i guess.
   * Will have to be after v2.0.
   */
  window.Pattrn.configuration = instance_settings;

  return instance_settings;
}

/**
 * Return active configuration, as combined from defaults and instance-specific
 * configuration.
 * @return Object The active Pattrn configuration object
 */
export function get_instance_configuration() {
  return window.Pattrn.configuration;
}
