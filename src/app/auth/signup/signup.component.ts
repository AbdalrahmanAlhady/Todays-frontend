import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomvalidationService } from '../customvalidation.service';
import { AuthService } from '../auth.service';
import { User } from 'src/app/shared/models/user.model';
import { Router } from '@angular/router';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit, OnDestroy {
  backendError: string = '';
  signedup: boolean = false;
  signupForm = this.formBuilder.group({
    first_name: [
      '',
      [Validators.required, Validators.maxLength(20), Validators.minLength(3)],
    ],
    last_name: [
      '',
      [Validators.required, Validators.maxLength(20), Validators.minLength(3)],
    ],
    email: [
      '',
      Validators.compose([
        Validators.required,
        Validators.email,
        Validators.pattern('.*com$'),
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
    ],
    phone: [
      '',
      Validators.compose([
        Validators.required,
        Validators.pattern('^01[0125][0-9]{8}$'),
        this.customValidator.numeric,
      ]),
    ],
    password: [
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(10),
        this.customValidator.passwordValidator(),
      ]),
    ],
    cPassword: [
      '',
      Validators.compose([
        Validators.required,
        Validators.minLength(10),
        this.customValidator.passwordValidator(),
      ]),
    ],
    birthdate: [Date, Validators.compose([Validators.required])],
    gender: ['', Validators.compose([Validators.required])],
  });
  subscriptions= new Subscription();
  constructor(
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService,
    private authService: AuthService,
    private router: Router,
  ) {}
  ngOnInit(): void {
  }
  switchToSignin() {
    this.router.navigate(['/signin'])
  }
  signup(formData: User) {
    this.subscriptions.add(
    this.authService.signup(formData).subscribe({
      next: (res) => {
        if (res.status === 200 || 201) {
          this.signedup = true;
          setTimeout(() => {
            this.signedup = false;
            this.router.navigate(['/signin'])
          }, 4000);
        }
      },
      error: (error) => {

        this.backendError = error.error.message;
      },
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }


}
