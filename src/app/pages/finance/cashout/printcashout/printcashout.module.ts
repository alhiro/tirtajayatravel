import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'ngx-easy-table';

import { PrintcashoutRoutingModule } from './printcashout-routing.module';
import { PrintcashoutComponent } from './printcashout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@app/_metronic/shared/shared.module';

@NgModule({
  declarations: [PrintcashoutComponent],
  imports: [
    // Common modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    // Lazy loading
    PrintcashoutRoutingModule,
    // Custom modules
    TableModule,
    NgbModule,
    SharedModule,
  ],
})
export class PrintcashoutModule {}
