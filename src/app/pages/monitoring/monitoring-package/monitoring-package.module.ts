import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'ngx-easy-table';

import { MonitoringPackageRoutingModule } from './monitoring-package-routing.module';
import { MonitoringPackageComponent } from './monitoring-package.component';
import { SharedModule } from '../../../_metronic/shared/shared.module';
import { DropdownMenusModule } from '../../../_metronic/partials/content/dropdown-menus/dropdown-menus.module';
import { ModalsModule } from '@app/_metronic/partials';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InlineSVGModule } from 'ng-inline-svg-2';
import {
  NgbDatepicker,
  NgbDropdownModule,
  NgbModule,
  NgbTimepickerModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { DateTimeModule } from '@app/@shared/component/date-time.module';
import { NgbTimepickerModuleCustom } from '@app/@shared/component/timepicker-custom/timepicker.module';

@NgModule({
  declarations: [MonitoringPackageComponent],
  imports: [
    // Common modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InlineSVGModule,
    NgbDropdownModule,
    NgbModule,
    NgbDatepicker,
    NgbTimepickerModule,
    NgbTooltipModule,
    // Lazy loading
    MonitoringPackageRoutingModule,
    // Custom modules
    SharedModule,
    DropdownMenusModule,
    TableModule,
    ModalsModule,
    DateTimeModule,
    NgbTimepickerModuleCustom,
  ],
})
export class MonitoringPackageModule {}
