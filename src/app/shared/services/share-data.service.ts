import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ShareDataService {
  $scrollToComment = new Subject<string>();
  $nextCommentsPage = new Subject<boolean>();
  
  constructor() { }
}
