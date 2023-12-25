import { Component, Input, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  @Input() modalRef?: BsModalRef;
  @Input() title: string = '';
  @Input() displayMedia: boolean = false;


  constructor(private modalService: BsModalService) {}

  closeModal() {
    this.modalRef?.hide();
  }
}
