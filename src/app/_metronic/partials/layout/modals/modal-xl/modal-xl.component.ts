import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { ModalConfig } from '../modal.config';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-xl',
  templateUrl: './modal-xl.component.html',
})
export class ModalXlComponent {
  @Input() public modalConfig!: ModalConfig;
  @ViewChild('modal') private modalContent!: TemplateRef<ModalXlComponent>;
  private modalRef!: NgbModalRef;

  constructor(private modalService: NgbModal) {}

  open(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.modalRef = this.modalService.open(this.modalContent, { size: 'xl' });
      this.modalRef.result.then(resolve, resolve);
    });
  }

  async close(): Promise<void> {
    if (this.modalConfig.shouldClose === undefined || (await this.modalConfig.shouldClose())) {
      const result = this.modalConfig.onClose === undefined || (await this.modalConfig.onClose());
      this.modalRef.close(result);
    }
  }

  async dismiss(): Promise<void> {
    if (this.modalConfig.disableDismissButton !== undefined) {
      return;
    }

    if (this.modalConfig.shouldDismiss === undefined || (await this.modalConfig.shouldDismiss())) {
      const result = this.modalConfig.onDismiss === undefined || (await this.modalConfig.onDismiss());
      this.modalRef.dismiss(result);
    }
  }
}
