import { Component } from '@angular/core';
import { IconsBaseComponent } from '../icons-base/icons-base.component';

@Component({
  selector: 'app-empty-posts',
  templateUrl: './empty-posts.component.html',
  styleUrl: './empty-posts.component.css'
})
export class EmptyPostsComponent extends IconsBaseComponent {
  constructor() { super(); }

}
