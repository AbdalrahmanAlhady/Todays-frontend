import { Component, Input } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { Media } from '../../models/media.model';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css'
})
export class VideoPlayerComponent {
@Input() url!:string|SafeUrl
@Input() avgDimensions!:Media['dimensions']
}
