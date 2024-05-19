import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-icons-base',
  templateUrl: './icons-base.component.html',
  styleUrls: ['./icons-base.component.css'],
})
export class IconsBaseComponent {
  @Input() width = 16;
  @Input() height = 16;
  constructor() {}
}
