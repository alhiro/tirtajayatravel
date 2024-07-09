import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { LoaderComponent } from './loader/loader.component';
import { SubCategoryComponent } from '@app/pages/master/sub-category/sub-category.component';
import { TableModule } from 'ngx-easy-table';

@NgModule({
  imports: [
    // Common modules
    TranslateModule,
    CommonModule,
  ],
  declarations: [LoaderComponent],
  exports: [LoaderComponent],
})
export class SharedModule {}
