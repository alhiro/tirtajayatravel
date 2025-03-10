import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'ngx-easy-table';
import { InlineSVGModule } from 'ng-inline-svg-2';

import { PackageRoutingModule } from './package-routing.module';
import { PackageComponent } from './package.component';
import { SharedModule } from '../../../_metronic/shared/shared.module';
import { DropdownMenusModule } from '../../../_metronic/partials/content/dropdown-menus/dropdown-menus.module';
import { ModalsModule } from '@app/_metronic/partials';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDatepicker,
  NgbDropdownModule,
  NgbTimepickerModule,
  NgbTooltipModule,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { DateTimeModule } from '@app/@shared/component/date-time.module';
import { NgbTimepickerModuleCustom } from '@app/@shared/component/timepicker-custom/timepicker.module';
import { CustomerModule } from '@app/pages/master/customer/customer.module';

@NgModule({
  declarations: [PackageComponent],
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
    PackageRoutingModule,
    // Custom modules
    SharedModule,
    DropdownMenusModule,
    TableModule,
    ModalsModule,
    DateTimeModule,
    CustomerModule,
    NgbTimepickerModuleCustom,
  ],
  exports: [PackageComponent],
})
export class PackageModule {}
