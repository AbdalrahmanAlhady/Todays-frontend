import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { finalize } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Media } from './media.model';

@Injectable({
  providedIn: 'root',
})
export class MediaUploadService {
  imgsArr: Media[] = [];
  img!: Media;
  constructor(private http: HttpClient, private storage: AngularFireStorage) {}
  uploadImg(file: File, post_id: string, imgCounter: number) {
    const task = this.storage.upload(
      `/postImgs/${post_id}/img${imgCounter}`,
      file
    );
    debugger;
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.storage
            .ref(`/postImgs/${post_id}/img${imgCounter}`)
            .getDownloadURL()
            .subscribe((res) => {
              console.log(res);
              debugger;
              if (res) {
                this.img = {
                  url: res,
                  storageProvider: 'firebase',
                  post_id,
                  type: 'img',
                };
                this.storePostImgsUrls(this.img).subscribe({
                  next: (res) => {
                    console.log(res);
                  },
                  error: (err) => {},
                });
              }
              debugger;
            })
        })
      ).subscribe()
    debugger;
  }
  cancelUploadingImg(url: string) {
    return this.storage.refFromURL(url).delete();
  }
  storePostImgsUrls(img: Media) {
    return this.http.post<Media>(
      'http://localhost:3000/api/v1/media/storePostImgsUrls',
      img,
      { observe: 'response' }
    );
  }
}
