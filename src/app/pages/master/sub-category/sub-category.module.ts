import { NgModule } from '@angular/core';
import { SharedModule } from '../../../_metronic/shared/shared.module';
import { DropdownMenusModule, ModalsModule } from '@app/_metronic/partials';
import { ReactiveFormsModule } from '@angular/forms';
import { SubCategoryRoutingModule } from './sub-category-routing.module';
import { SubCategoryComponent } from './sub-category.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'ngx-easy-table';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [SubCategoryComponent],
  imports: [
    // Common modules
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    // Lazy loading
    SubCategoryRoutingModule,
    // Module dependencies
    TableModule,
    // Metronic modules
    SharedModule,
    ModalsModule,
    DropdownMenusModule,
    NgbTooltipModule,
  ],
})
export class SubCategoryModule {}
