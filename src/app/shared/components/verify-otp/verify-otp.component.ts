import { Component, Input } from '@angular/core';
import { UserService } from '../../services/user.service';
import { timeout } from 'rxjs';
import { ShareDataService } from '../../services/share-data.service';
import { AuthService } from 'src/app/auth/services/auth.service';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomvalidationService } from 'src/app/auth/services/customvalidation.service';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css',
})
export class VerifyOtpComponent {
  @Input() email: string = '';
  @Input() forgetPasswordMode: boolean = false;
  otp: string = '';
  backendError: string = '';
  verified: boolean = false;
  forgetPasswordForm = this.formBuilder.group({
    newPassword: [
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(10),
        this.customValidator.passwordValidator(),
      ]),
    ],
    cNewPassword: [
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(10),
        this.customValidator.passwordValidator(),
      ]),
    ],
  });
  constructor(
    private userService: UserService,
    private shareDataService: ShareDataService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService
  ) {}

  verifyOtp() {
    this.authService.verifyEmailViaOTP(this.otp, this.email).subscribe({
      next: (res) => {
        if (res.body!.message.includes('Verified')) {
          this.verified = true;
          setTimeout(() => {
            this.shareDataService.$informationUpdated.next(true);
          }, 2000);
        }
      },
      error: (error) => {
        this.backendError = error.error.message;
      },
    });
  }
  forgetPassword() {
    this.forgetPasswordMode = true;
    let updateInfo = {
      newPassword: this.forgetPasswordForm.value.newPassword,
      cNewPassword: this.forgetPasswordForm.value.cNewPassword,
    };
    this.authService
      .changeOrForgetPassword(
        this.email!,
        updateInfo.newPassword!,
        updateInfo.cNewPassword!,
        undefined,
        this.otp
      )
      .subscribe(
        (res) => {
          if (res.status === 200) {
            this.shareDataService.$informationUpdated.next(true);
          }
        },
        (error) => {
          this.backendError = error.error.message;
        }
      );
  }
}
