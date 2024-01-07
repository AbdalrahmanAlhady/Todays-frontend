import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, finalize } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Media } from '../models/media.model';

@Injectable({
  providedIn: 'root',
})
export class MediaUploadService {
  $postMediaArr = new Subject<Media[]>();
  postMediaArr: Media[] = [];
  $commentMedia = new Subject<Media>();
  media!: Media;
  constructor(private http: HttpClient, private storage: AngularFireStorage) {}
  uploadMedia(
    file: File,
    postORcomment_id: string | null,
    containerType: 'post' | 'comment',
    mediaType: 'img' | 'video',
    mediaIndex?: number,
    mediaLength?: number
  ) {
    const path = `/${containerType}_${mediaType}s/${postORcomment_id}/${mediaType}${mediaIndex}`;
    const task = this.storage.upload(path, file);
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.storage
            .ref(path)
            .getDownloadURL()
            .subscribe((res) => {
              if (res) {
                this.media = {
                  url: res,
                  storageProvider: 'firebase',
                  post_id: containerType === 'post' ? postORcomment_id : null,
                  comment_id:
                    containerType === 'comment' ? postORcomment_id : null,
                  type: mediaType,
                };
                this.storeMediaUrl(this.media, containerType, mediaLength);
              }
            });
        })
      )
      .subscribe();
    return task.percentageChanges();
  }
  deleteMedia(url: string) {
    return this.storage.refFromURL(url).delete();
  }
  storeMediaUrl(
    media: Media,
    containerType: 'post' | 'comment',
    mediaLength?: number
  ) {
    return this.http
      .post<{ media: Media }>(
        'http://localhost:3000/api/v1/media/storeMediaUrls',
        media,
        { observe: 'response' }
      )
      .subscribe({
        next: (res) => {
          if (containerType === 'post' && res.status === 201) {
            if (res.body!.media) {
              this.postMediaArr.push(res.body!.media);
              if (this.postMediaArr.length === mediaLength) {
                this.$postMediaArr.next(this.postMediaArr);
              }
            }
          } else if (containerType === 'comment' && res.status === 201) {
            this.$commentMedia.next(res.body!.media);
          }
        },
        error: (err) => {
          console.log(err)
        },
      });
  }
}
