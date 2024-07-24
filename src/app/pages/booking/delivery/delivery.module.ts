import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'ngx-easy-table';

import { DeliveryRoutingModule } from './delivery-routing.module';
import { DeliveryComponent } from './delivery.component';
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
import { PackageModule } from '../package/package.module';
import { PassengerModule } from '../passenger/passenger.module';

@NgModule({
  declarations: [DeliveryComponent],
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
    DeliveryRoutingModule,
    // Custom modules
    SharedModule,
    DropdownMenusModule,
    TableModule,
    ModalsModule,
    PackageModule,
    PassengerModule,
  ],
})
export class DeliveryModule {}
