import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { CustomvalidationService } from 'src/app/auth/services/customvalidation.service';
import { User } from 'src/app/shared/models/user.model';
import { ShareDataService } from 'src/app/shared/services/share-data.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-edit-personal-information',
  templateUrl: './edit-personal-information.component.html',
  styleUrl: './edit-personal-information.component.css',
})
export class EditPersonalInformationComponent implements OnInit, OnDestroy {
  @Input() currentUser!: User;
  @ViewChild('otpModal') otpModal!: TemplateRef<void>;
  @ViewChild('doneModal') doneModal!: TemplateRef<void>;
  subscriptions = new Subscription();
  backendError: string = '';
  signedup: boolean = false;
  modalRef?: BsModalRef;
  done: boolean = false;
  forgetPasswordMode: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService,
    private userService: UserService,
    private modalService: BsModalService,
    private shareDataService: ShareDataService,
    private authService: AuthService
  ) {}
  basicInformationForm = this.formBuilder.group({
    first_name: [
      '',
      [Validators.required, Validators.maxLength(20), Validators.minLength(3)],
    ],
    last_name: [
      '',
      [Validators.required, Validators.maxLength(20), Validators.minLength(3)],
    ],
    phone: [
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern('^01[0125][0-9]{8}$'),
        this.customValidator.numeric,
      ]),
    ],

    birthdate: [new Date(), Validators.compose([Validators.required])],
  });
  emailForm = this.formBuilder.group({
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
  changePasswordForm = this.formBuilder.group({
    currentPassword: ['', Validators.compose([Validators.required])],
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
  ngOnInit(): void {
    if (this.currentUser) {
      this.basicInformationForm.patchValue({
        first_name: this.currentUser.first_name,
        last_name: this.currentUser.last_name,
        phone: this.currentUser.phone,
        birthdate: this.currentUser.birthdate,
      });
      this.emailForm.patchValue({
        email: this.currentUser.email,
      });
    }
  }
  checkBasicInformationChanges() {
    if (
      this.currentUser &&
      new Date(
        this.basicInformationForm.get('birthdate')?.value!
      ).toISOString() === new Date(this.currentUser!.birthdate).toISOString() &&
      this.basicInformationForm.get('first_name')?.value ===
        this.currentUser.first_name &&
      this.basicInformationForm.get('last_name')?.value ===
        this.currentUser.last_name &&
      this.basicInformationForm.get('phone')?.value === this.currentUser.phone
    ) {
      return true;
    } else {
      return false;
    }
  }

  updateBasicInformation() {
    let updateInfo = {
      first_name:
        this.basicInformationForm.value.first_name !==
        this.currentUser.first_name
          ? this.basicInformationForm.value.first_name
          : this.currentUser.first_name,
      last_name:
        this.basicInformationForm.value.last_name !== this.currentUser.last_name
          ? this.basicInformationForm.value.last_name
          : this.currentUser.last_name,
      phone:
        this.basicInformationForm.value.phone !== this.currentUser.phone
          ? this.basicInformationForm.value.phone
          : this.currentUser.phone,
      birthdate:
        new Date(this.basicInformationForm.value.birthdate!) !==
        new Date(this.currentUser.birthdate)
          ? this.basicInformationForm.value.birthdate
          : this.currentUser.birthdate,
    };
    this.subscriptions.add(
      this.userService.updateUser(this.currentUser.id!, updateInfo).subscribe({
        next: (res) => {
          this.currentUser = res.body?.user!;
          if (this.currentUser) {
            this.modalService.show(this.doneModal);
          }
        },
        error: (error) => {
          console.log(error);
        },
      })
    );
  }
  updateEmail() {
    let updateInfo = {
      email: this.emailForm.value.email,
    };
    this.subscriptions.add(
      this.userService.updateUser(this.currentUser.id!, updateInfo).subscribe(
        (res) => {
          this.currentUser = res.body?.user!;
          this.modalService.show(this.otpModal);
          this.subscriptions.add(
            this.shareDataService.$informationUpdated.subscribe(
              (informationUpdated) => {
                if (informationUpdated) {
                  this.shareDataService.$informationUpdated.next(false);
                }
              }
            )
          );
        },
        (error) => {
          console.log(error);
        }
      )
    );
  }
  verifyEmail() {
  //same us update email but with the current email 
  this.updateEmail()
  }
  updatePassword() {
    let updateInfo = {
      currentPassword: this.changePasswordForm.value.currentPassword,
      newPassword: this.changePasswordForm.value.newPassword,
      cNewPassword: this.changePasswordForm.value.cNewPassword,
    };
    this.subscriptions.add(
      this.authService
        .changeOrForgetPassword(
          this.currentUser.email!,
          updateInfo.newPassword!,
          updateInfo.cNewPassword!,
          updateInfo.currentPassword!
        )
        .subscribe(
          (res) => {
            if (res.status === 200) {
              this.modalService.show(this.doneModal);
            }
          },
          (error) => {
            console.log(error);
          }
        )
    );
  }

  openModal(template: TemplateRef<any>) {
    this.modalService.show(template);
  }
  sendForgetPasswordEmail() {
    this.subscriptions.add(
      this.authService.sendOTP(this.currentUser.email!).subscribe({
        next: (res) => {
          if (res.status === 200) {
            this.forgetPasswordMode = true;
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
              })
            );
          }
        },
        error: (err) => {},
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
