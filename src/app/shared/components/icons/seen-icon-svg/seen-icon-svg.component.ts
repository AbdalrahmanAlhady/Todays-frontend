import { Component, Input } from '@angular/core';
import { IconsBaseComponent } from '../icons-base/icons-base.component';

@Component({
  selector: 'app-seen-icon-svg',
  templateUrl: './seen-icon-svg.component.html',
  styleUrl: './seen-icon-svg.component.css',
})
export class SeenIconSvgComponent extends IconsBaseComponent {
  @Input() color: string = '#e3e3e3';
  constructor() {
    super();
  }
}
