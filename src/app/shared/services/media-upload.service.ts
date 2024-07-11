import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, finalize } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Media } from '../models/media.model';
import { EndPoint } from '../endpoints/EndPoint';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class MediaUploadService {
  $postMediaArr = new Subject<Media[]>();
  postMediaArr: Media[] = [];
  $commentMedia = new Subject<Media>();
  $profileMedia = new Subject<Media>();
  media!: Media;
  constructor(
    private http: HttpClient,
    private storage: AngularFireStorage,
    private userService: UserService
  ) {}
  uploadMedia(
    file: File,
    postORcomment_id: string | null,
    mediaType: 'img' | 'video',
    forObject: 'post' | 'comment' | 'profile' | 'cover',
    mediaDimensions?: {
      width: number;
      height: number;
    },
    mediaIndex?: number,
    mediaLength?: number
  ) {
    const owner_id = this.userService.getCurrentUserId();
    //posts_imgs/post1/img1
    const path = `/${forObject}s_${mediaType}s/${forObject}${
      postORcomment_id ? postORcomment_id : 'user' + owner_id
    }/${mediaType}${mediaIndex! >= 0 ? mediaIndex : ''}`;
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
                  post_id: forObject === 'post' ? postORcomment_id : null,
                  comment_id: forObject === 'comment' ? postORcomment_id : null,
                  type: mediaType,
                  dimensions: mediaDimensions!,
                  owner_id,
                  for: forObject,
                  current:
                    forObject === 'post' || forObject === 'comment'
                      ? null
                      : true,
                };
                this.storeMediaUrl(this.media, forObject, mediaLength);
              }
            });
        })
      )
      .subscribe();
    return task.percentageChanges();
  }
  deleteMediafromFirebase(url: string) {
    return this.storage.refFromURL(url).delete();
  }
  deleteMedia(id: string) {
    return this.http.delete<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.MEDIA_API}/${id}`
    );
  }
  storeMediaUrl(
    media: Media,
    forObject: 'post' | 'comment' | 'profile' | 'cover',
    mediaLength?: number
  ) {
    return this.http
      .post<{ media: Media }>(
        `${EndPoint.API_ROOT}/${EndPoint.MEDIA_API}`,
        media,
        { observe: 'response' }
      )
      .subscribe({
        next: (res) => {
          if (forObject === 'post' && res.status === 201) {
            if (res.body!.media) {
              this.postMediaArr.push(res.body!.media);
              if (this.postMediaArr.length === mediaLength) {
                this.$postMediaArr.next(this.postMediaArr);
              }
            }
          } else if (forObject === 'comment' && res.status === 201) {
            this.$commentMedia.next(res.body!.media);
          } else if (res.status === 201) {
            this.$profileMedia.next(res.body!.media);
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  getMediaOfUser(
    userId: string,
    page?: string,
    mediaNumber?: string,
    mediaType?: string
  ) {
    let queryParams = new HttpParams();
    if (page) queryParams = queryParams.append('page', page);
    if (mediaNumber) queryParams = queryParams.append('limit', mediaNumber);
    if (mediaType) queryParams = queryParams.append('type', mediaType);
    return this.http.get<{ media: { count: number; rows: Media[] } }>(
      `${EndPoint.API_ROOT}/${EndPoint.MEDIA_API}/user/${userId}`,
      { observe: 'response', params: queryParams }
    );
  }
}
