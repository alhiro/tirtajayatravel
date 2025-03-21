import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { NotificationsInnerComponent } from './dropdown-inner/notifications-inner/notifications-inner.component';
import { QuickLinksInnerComponent } from './dropdown-inner/quick-links-inner/quick-links-inner.component';
import { UserInnerComponent } from './dropdown-inner/user-inner/user-inner.component';
import { LayoutScrollTopComponent } from './scroll-top/scroll-top.component';
import { SearchResultInnerComponent } from './dropdown-inner/search-result-inner/search-result-inner.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { I18nModule } from '@app/modules/i18n';

@NgModule({
  declarations: [
    NotificationsInnerComponent,
    QuickLinksInnerComponent,
    SearchResultInnerComponent,
    UserInnerComponent,
    LayoutScrollTopComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    InlineSVGModule,
    RouterModule,
    NgbTooltipModule,
    SharedModule,
    TranslateModule,
    I18nModule,
  ],
  exports: [
    NotificationsInnerComponent,
    QuickLinksInnerComponent,
    SearchResultInnerComponent,
    UserInnerComponent,
    LayoutScrollTopComponent,
  ],
})
export class ExtrasModule {}
