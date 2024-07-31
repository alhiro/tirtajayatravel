import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'ngx-easy-table';

import { PrintbsdRoutingModule } from './printbsd-routing.module';
import { PrintbsdComponent } from './printbsd.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [PrintbsdComponent],
  imports: [
    // Common modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    // Lazy loading
    PrintbsdRoutingModule,
    // Custom modules
    TableModule,
    NgbModule,
  ],
})
export class PrintbsdModule {}
