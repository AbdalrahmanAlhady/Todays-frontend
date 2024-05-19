import { Component } from '@angular/core';
import { IconsBaseComponent } from '../icons-base/icons-base.component';

@Component({
  selector: 'app-logo',
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css'
})
export class LogoComponent extends IconsBaseComponent {
  constructor() { super(); }

}
