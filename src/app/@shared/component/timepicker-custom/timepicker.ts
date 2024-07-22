import {
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { isInteger, isNumber, padNumber, toInteger } from '../../utility/utils';
import { NgbTime } from './ngb-time';
import { NgbTimepickerConfig } from './timepicker-config';
import { NgbTimeAdapter } from './ngb-time-adapter';

const NGB_TIMEPICKER_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NgbTimepicker),
  multi: true,
};

/**
 * A lightweight & configurable timepicker directive.
 */
@Component({
  selector: 'ngb-timepicker-custom',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./timepicker.scss'],
  templateUrl: './timepicker.html',
  providers: [NGB_TIMEPICKER_VALUE_ACCESSOR],
})
export class NgbTimepicker implements ControlValueAccessor, OnChanges {
  disabled: boolean;
  model: any;
  selectHours: any;

  private _hourStep!: number;
  private _minuteStep!: number;
  private _secondStep!: number;

  /**
   * Whether to display 12H or 24H mode.
   */
  @Input() meridian: boolean;

  /**
   * Whether to display the spinners above and below the inputs.
   */
  @Input() spinners: boolean;

  /**
   * Whether to display seconds input.
   */
  @Input() seconds: boolean;

  /**
   * Number of hours to increase or decrease when using a button.
   */
  @Input()
  set hourStep(step: number) {
    this._hourStep = isInteger(step) ? step : this._config.hourStep;
  }

  get hourStep(): number {
    return this._hourStep;
  }

  /**
   * Number of minutes to increase or decrease when using a button.
   */
  @Input()
  set minuteStep(step: number) {
    this._minuteStep = isInteger(step) ? step : this._config.minuteStep;
  }

  get minuteStep(): number {
    return this._minuteStep;
  }

  /**
   * Number of seconds to increase or decrease when using a button.
   */
  @Input()
  set secondStep(step: number) {
    this._secondStep = isInteger(step) ? step : this._config.secondStep;
  }

  get secondStep(): number {
    return this._secondStep;
  }

  /**
   * To make timepicker readonly
   */
  @Input() readonlyInputs: boolean;

  /**
   * To set the size of the inputs and button
   */
  @Input() size: 'small' | 'medium' | 'large';

  /**
   * To set the value start hour
   */
  @Input() startHour: number;

  /**
   * To set the value end hour
   */
  @Input() endHour: number;

  /**
   * To display dropdown select
   */
  @Input() select: boolean;

  constructor(
    private readonly _config: NgbTimepickerConfig,
    private _ngbTimeAdapter: NgbTimeAdapter<any>,
    private _cd: ChangeDetectorRef
  ) {
    this.meridian = _config.meridian;
    this.spinners = _config.spinners;
    this.seconds = _config.seconds;
    this.hourStep = _config.hourStep;
    this.minuteStep = _config.minuteStep;
    this.secondStep = _config.secondStep;
    this.disabled = _config.disabled;
    this.readonlyInputs = _config.readonlyInputs;
    this.size = _config.size;
    this.startHour = _config.startHour;
    this.endHour = _config.endHour;

    // select
    this.select = _config.select;
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any) {
    const structValue = this._ngbTimeAdapter.fromModel(value);
    this.model = structValue ? new NgbTime(structValue.hour, structValue.minute, structValue.second) : new NgbTime();
    if (!this.seconds && (!structValue || !isNumber(structValue.second))) {
      this.model.second = 0;
    }
    this._cd.markForCheck();
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  changeHour(step: number) {
    this.model.changeHour(step);
    this.propagateModelChange();
  }

  changeMinute(step: number) {
    this.model.changeMinute(step);
    this.propagateModelChange();
  }

  changeSecond(step: number) {
    this.model.changeSecond(step);
    this.propagateModelChange();
  }

  updateHour(newVal: any) {
    const input = newVal as HTMLInputElement;
    const value = input.value;

    const isPM = this.model.hour >= 12;
    const enteredHour = toInteger(value);
    if (this.meridian && ((isPM && enteredHour < 12) || (!isPM && enteredHour === 12))) {
      this.model.updateHour(enteredHour + 12);
    } else {
      this.model.updateHour(enteredHour);
    }
    this.propagateModelChange();
  }

  updateMinute(newVal: any) {
    const input = newVal as HTMLInputElement;
    const value = input.value;
    this.model.updateMinute(toInteger(value));
    this.propagateModelChange();
  }

  updateSecond(newVal: any) {
    const input = newVal as HTMLInputElement;
    const value = input.value;
    this.model.updateSecond(toInteger(value));
    this.propagateModelChange();
  }

  toggleMeridian() {
    if (this.meridian) {
      this.changeHour(12);
    }
  }

  formatHour(value: number) {
    if (isNumber(value)) {
      if (this.meridian) {
        return padNumber(value % 12 === 0 ? 12 : value % 12);
      } else {
        return padNumber(value % 24);
      }
    } else {
      return padNumber(NaN);
    }
  }

  formatMinSec(value: number) {
    return padNumber(value);
  }

  get isSmallSize(): boolean {
    return this.size === 'small';
  }

  get isLargeSize(): boolean {
    return this.size === 'large';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seconds'] && !this.seconds && this.model && !isNumber(this.model.second)) {
      this.model.second = 0;
      this.propagateModelChange(false);
    }
  }

  private propagateModelChange(touched = true) {
    if (touched) {
      this.onTouched();
    }
    if (this.model.isValid(this.seconds)) {
      this.onChange(
        this._ngbTimeAdapter.toModel({ hour: this.model.hour, minute: this.model.minute, second: this.model.second })
      );
    } else {
      this.onChange(this._ngbTimeAdapter.toModel({ hour: 0, minute: 0, second: 0 }));
    }
  }

  _range(start: number, end: number, step = 1) {
    const len = Math.floor((end - start) / step) + 1;
    return Array(len)
      .fill(len)
      .map((_, idx) => start + idx * step);
  }

  createSelectHours(starthour: number, endHour: number) {
    return this._range(starthour, endHour, this.hourStep);
  }

  createSelectMinutes() {
    return this._range(0, 59, this.minuteStep);
  }

  createSelectSeconds() {
    return this._range(0, 59, this.secondStep);
  }
}
