import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeeniconComponent } from './keenicon/keenicon.component';

@NgModule({
  declarations: [KeeniconComponent],
  imports: [CommonModule],
  exports: [KeeniconComponent],
})
export class SharedModule {}
