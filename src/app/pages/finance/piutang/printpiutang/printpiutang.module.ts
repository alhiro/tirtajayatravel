import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'ngx-easy-table';

import { PrintPiutangRoutingModule } from './printpiutang-routing.module';
import { PrintpiutangComponent } from './printpiutang.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '@app/_metronic/shared/shared.module';

@NgModule({
  declarations: [PrintpiutangComponent],
  imports: [
    // Common modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    // Lazy loading
    PrintPiutangRoutingModule,
    // Custom modules
    TableModule,
    NgbModule,
    SharedModule,
  ],
})
export class PrintPiutangModule {}
