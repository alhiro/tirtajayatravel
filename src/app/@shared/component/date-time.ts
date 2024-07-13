import { Component, Input, forwardRef, ElementRef, OnInit } from '@angular/core';
import { NgControl, FormGroupDirective, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
  selector: 'date-time-picker-custom',
  template: `
    <div ngbDropdown (openChange)="!$event && onTouch()" class="custom-datetime">
      <button [class]="parentClass" [disabled]="isDisabled" class="datepicker" ngbDropdownToggle>
        {{ _value ? (_value | date : 'dd/MM/yyyy hh:mm a' : '+0000') : label }}
      </button>
      <div ngbDropdownMenu style="padding: 15px;">
        <ngb-datepicker #dp [(ngModel)]="date" [minDate]="minDate" (dateSelect)="getDatetime()"></ngb-datepicker>
        <ngb-timepicker
          [hourStep]="hourStep"
          [minuteStep]="minuteStep"
          [meridian]="meridian"
          [ngModel]="time"
          [seconds]="false"
          [spinners]="spinners"
          (ngModelChange)="time = $event; getDatetime()"
        ></ngb-timepicker>
      </div>
    </div>
  `,
  styles: [
    `
      // .custom-datetime {
      //   position: absolute;
      //   left: 0;
      //   bottom: 0;
      //   width: 100%;
      //   z-index: 11;
      // }

      .custom-datetime button {
        width: 100%;
        display: block;
        text-align: left;
        background: transparent;
        box-shadow: none;
        border: 0;
      }

      .custom-datetime button:after {
        display: none;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePickerComponent),
      multi: true,
    },
  ],
})
export class DateTimePickerComponent implements ControlValueAccessor {
  @Input() mask = 'medium';
  @Input() meridian: boolean = true;
  @Input() placeholder: string = 'yyyy/MM/dd hh:mm am/pm';
  @Input() hourStep = 1;
  @Input() minuteStep = 1;
  @Input() spinners: boolean = false;

  minDate: any;
  date: any;
  time: any = { hour: 0, minute: 0 };
  isDisabled!: boolean;
  onChange = (_: any) => {};
  onTouch = () => {};
  _value: any;
  label: any;
  control: any;
  get parentClass() {
    return this.elementRef.nativeElement.className;
  }
  constructor(private elementRef: ElementRef) {
    // Get the current date and time in UTC format
    const currentDate = new Date();
    // Convert the UTC date to a string in the format "YYYY-MM-DDTHH:mm:ssZ"
    const currentDateUTCString = currentDate.toUTCString();
    console.log('currentDateUTCString ' + currentDateUTCString);

    // Specify the global timezone (e.g. "America/New_York")
    var globalTimezone = 'Asia/Jakarta';
    // Use the `toLocaleString` method to format the date/time string in the specified timezone
    const globalDate = new Date(currentDateUTCString).toLocaleString('en-US', {
      timeZone: globalTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    console.log('globalDate ' + globalDate);
    var getDate = new Date(globalDate);
    console.log('getDate ' + getDate);

    this.minDate = {
      year: getDate.getFullYear(),
      month: getDate.getMonth() + 1,
      day: getDate.getDate(),
    };
  }
  getDatetime() {
    console.log('this date-time.ts ' + JSON.stringify(this.date));

    let value = null;
    if (!this.date) {
      value = this.placeholder;
      this._value = null;
    } else {
      value = new Date(
        Date.UTC(
          this.date.year,
          this.date.month - 1,
          this.date.day,
          this.time ? this.time.hour : 0,
          this.time ? this.time.minute : 0
        )
      ).toUTCString();
      this._value = value;
    }

    this.onChange(this._value);
    this.label = value;

    console.log('_value ' + this._value);
    console.log('this.label ' + this.label);
  }
  writeValue(obj: any): void {
    // if (obj && obj.getFullYear) {
    //   const date = new Date(
    //     Date.UTC(
    //       obj.getFullYear(),
    //       obj.getMonth(),
    //       obj.getDate(),
    //       obj.getUTCHours(),
    //       obj.getMinutes()
    //     )
    //   );

    //   this.date = {
    //     year: date.getFullYear(),
    //     month: date.getMonth() + 1,
    //     day: date.getDate()
    //   };
    //   this.time = { hour: this.hourStep*(Math.round(date.getHours()/this.hourStep)), minute: this.minuteStep*(Math.round(date.getMinutes()/this.minuteStep)) };
    //   setTimeout(() => {
    //     this.getDatetime();
    //   });
    // }
    this.getDatetime();
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }
}
