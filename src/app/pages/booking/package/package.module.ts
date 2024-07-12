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
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [PackageComponent],
  imports: [
    // Common modules
    CommonModule,
    FormsModule,
    TranslateModule,
    InlineSVGModule,
    NgbDropdownModule,
    // Lazy loading
    PackageRoutingModule,
    // Custom modules
    SharedModule,
    DropdownMenusModule,
    TableModule,
    ModalsModule,
    ReactiveFormsModule,
  ],
})
export class PackageModule {}
