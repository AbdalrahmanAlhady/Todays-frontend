import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, finalize } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Media } from '../models/media.model';

@Injectable({
  providedIn: 'root',
})
export class MediaUploadService {
  $postImgsArr = new BehaviorSubject<Media[]>([]);
  $commentImg = new Subject<Media>();
  media!: Media;
  constructor(private http: HttpClient, private storage: AngularFireStorage) {}
  uploadImg(
    file: File,
    postORcomment_id: string | null,
    containerType: 'post' | 'comment',
    mediaType:'img'|'video',
    imgCounter?: number,
  ) {
    const task = this.storage.upload(
      `/${containerType}_${mediaType}s/${postORcomment_id}/${mediaType}${imgCounter}`,
      file
    );
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.storage
            .ref(`/${containerType}_${mediaType}s/${postORcomment_id}/${mediaType}${imgCounter}`)
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

                this.storeImgUrl(this.media).subscribe({
                  next: (res) => {
                    if (containerType === 'post') {
                      this.$postImgsArr.next([
                        ...this.$postImgsArr.getValue(),
                        res.body!.media,
                      ]);
                    }else if (containerType === 'comment') {
                      this.$commentImg.next(res.body!.media)
                    }
                  },
                  error: (err) => {},
                });
              }
            });
        })
      )
      .subscribe();
      return task.percentageChanges()
  }
  deleteImg(url: string) {
    return this.storage.refFromURL(url).delete();
  }
  storeImgUrl(img: Media) {
    return this.http.post<{media:Media}>(
      'http://localhost:3000/api/v1/media/storePostImgsUrls',
      img,
      { observe: 'response' }
    );
  }
}
