import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'ngx-easy-table';

import { PrintPassengerRoutingModule } from './printPassenger-routing.module';
import { PrintPassengerComponent } from './printPassenger.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@app/_metronic/shared/shared.module';

@NgModule({
  declarations: [PrintPassengerComponent],
  imports: [
    // Common modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    // Lazy loading
    PrintPassengerRoutingModule,
    // Custom modules
    TableModule,
    NgbModule,
    SharedModule,
  ],
})
export class PrintPassengerModule {}
