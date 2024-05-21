import {
  Component,
  ElementRef,
  Input,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { el } from 'timeago.js/lib/lang';
import { ShareDataService } from '../../services/share-data.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent implements OnInit {
  @Input() modalRef?: BsModalRef;
  @Input() title: string = '';
  @Input() displayMedia: boolean = false;
@ViewChild('wait') wait!:ElementRef
  subscriptions= new Subscription();
  constructor(
    private modalService: BsModalService,
    private render: Renderer2,
    private shareDataService: ShareDataService,
  ) {}

  ngOnInit(): void {
  this.subscriptions.add(
    this.shareDataService.$scrollToComment.subscribe((comment_id) => {
      if (comment_id) this.scrollTo(comment_id);
    }));
  }
  closeModal() {
    this.modalRef?.hide();
  }

  scrollTo(comment_id: string) {
    let el = this.render.selectRootElement(`#comment${comment_id}_sub_comment`, true);
    el.scrollIntoView();
    this.render.setStyle(el, 'border', '#016d81d4 2px solid');
    setTimeout(() => {
      this.render.removeStyle(el, 'border');
    }, 5000);
  }
  nextCommentsPage(){
    this.shareDataService.$nextCommentsPage.next(true);
  }
}
