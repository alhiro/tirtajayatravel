import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'ngx-easy-table';

import { PackageRoutingModule } from './package-routing.module';
import { PackageComponent } from './package.component';
import { SharedModule } from '../../../_metronic/shared/shared.module';
import { DropdownMenusModule } from '../../../_metronic/partials/content/dropdown-menus/dropdown-menus.module';
import { ModalsModule } from '@app/_metronic/partials';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [PackageComponent],
  imports: [
    // Common modules
    CommonModule,
    TranslateModule,
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
