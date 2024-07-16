import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { InviteUsersModalComponent } from './invite-users-modal/invite-users-modal.component';
import { MainModalComponent } from './main-modal/main-modal.component';
import { UpgradePlanModalComponent } from './upgrade-plan-modal/upgrade-plan-modal.component';
import { ModalComponent } from './modal/modal.component';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module';
import { ModalXlComponent } from './modal-xl/modal-xl.component';
import { ModalFullComponent } from './modal-full/modal-full.component';

@NgModule({
  declarations: [
    InviteUsersModalComponent,
    MainModalComponent,
    UpgradePlanModalComponent,
    ModalComponent,
    ModalXlComponent,
    ModalFullComponent,
  ],
  imports: [CommonModule, InlineSVGModule, RouterModule, NgbModalModule, SharedModule],
  exports: [
    InviteUsersModalComponent,
    MainModalComponent,
    UpgradePlanModalComponent,
    ModalComponent,
    ModalXlComponent,
    ModalFullComponent,
  ],
})
export class ModalsModule {}
