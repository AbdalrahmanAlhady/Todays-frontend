import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomvalidationService } from '../../services/customvalidation.service';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ShareDataService } from 'src/app/shared/services/share-data.service';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit, OnDestroy {
  @ViewChild('otpModal') otpModal!: TemplateRef<void>;
  @ViewChild('doneModal') doneModal!: TemplateRef<void>;
  backendError: string = '';
  modalRef?: BsModalRef;
  forgetPasswordMode: boolean = false;
  forgetPasswordEmail: string = '';
  subscriptions = new Subscription();
  signinForm = this.formBuilder.group({
    email: [
      '',
      Validators.compose([
        Validators.required,
        Validators.email,
        Validators.pattern('.*com$'),
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
    ],
    password: ['', Validators.compose([Validators.required])],
  });
  forgetPasswordForm = this.formBuilder.group({
    email: [
      '',
      Validators.compose([
        Validators.required,
        Validators.email,
        Validators.pattern('.*com$'),
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
    ],
  });
  constructor(
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService,
    private authService: AuthService,
    private router: Router,
    private modalService: BsModalService,
    private shareDataService: ShareDataService,
    private localStorageService: LocalStorageService,
    private userService: UserService
  ) {}
  ngOnInit(): void {}

  switchToSignup() {
    this.router.navigate(['/signup']);
  }
  signin(formData: { email: string; password: string }) {
    this.subscriptions.add(
      this.authService.signin(formData.email, formData.password).subscribe({
        next: (res) => {
          if (res.body?.accessToken && res.body?.refreshToken) {
            this.localStorageService.setItem(
              'accessToken',
              res.body.accessToken!
            );
            this.localStorageService.setItem(
              'refreshToken',
              res.body.refreshToken
            );
            this.localStorageService.setItem(
              'user',
              this.userService.spreadUserMedia(res.body.user)
            );
            this.authService.$userAccessToken.next(res.body?.accessToken);
            this.authService.signedIn = true;
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          this.backendError = error.message;
        },
      })
    );
  }

  sendForgetPasswordEmail() {
    this.subscriptions.add(
    this.authService.sendOTP(this.forgetPasswordForm.value.email!).subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.modalRef = this.modalService.show(this.otpModal);
          this.subscriptions.add(
          this.shareDataService.$informationUpdated.subscribe((res) => {
            if (res) {
              this.modalRef?.hide();
              this.modalService.show(this.doneModal);
              setTimeout(() => {
                this.shareDataService.$informationUpdated.next(false);
                window.location.reload();
              }, 2000);
            }
          }))
        }
      },
      error: (err) => {
        this.backendError = err.error.message;
      },
    }))
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
