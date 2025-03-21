import { Injectable } from '@angular/core';

/**
 * Configuration service for the NgbTimepicker component.
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the timepickers used in the application.
 */
@Injectable({ providedIn: 'root' })
export class NgbTimepickerConfig {
  meridian = false;
  spinners = true;
  seconds = false;
  hourStep = 1;
  minuteStep = 1;
  secondStep = 1;
  disabled = false;
  readonlyInputs = false;
  size: 'small' | 'medium' | 'large' = 'medium';
  startHour = 0;
  endHour = 0;

  // Select
  select = false;
}
