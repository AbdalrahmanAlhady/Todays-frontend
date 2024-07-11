import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {
  $scrollToComment = new Subject<string>();
  $nextCommentsPage = new Subject<boolean>();
  $nextProfileMediaPage = new Subject<boolean>();
  $nextProfileFriendsPage = new Subject<boolean>();
  $noMoreProfileMediaPages = new Subject<boolean>();
  $noMoreProfileFriendsPages = new Subject<boolean>();
  $informationUpdated = new Subject<boolean>();
  $viewMedia = new Subject<{type:'img' | 'video', url:string}>();
  constructor() { }
}
