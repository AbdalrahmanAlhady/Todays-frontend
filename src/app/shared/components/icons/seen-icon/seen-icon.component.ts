import { Component, Input } from '@angular/core';
import { IconsBaseComponent } from '../icons-base/icons-base.component';

@Component({
  selector: 'app-seen-icon',
  templateUrl: './seen-icon.component.html',
  styleUrl: './seen-icon.component.css'
})
export class SeenIconComponent  extends IconsBaseComponent {
@Input() color:string ='#e3e3e3';
}
