import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'ngx-easy-table';

import { PrintListRoutingModule } from './printList-routing.module';
import { PrintListPackageComponent } from './printList.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@app/_metronic/shared/shared.module';

@NgModule({
  declarations: [PrintListPackageComponent],
  imports: [
    // Common modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    // Lazy loading
    PrintListRoutingModule,
    // Custom modules
    TableModule,
    NgbModule,
    SharedModule,
  ],
})
export class PrintListModule {}
