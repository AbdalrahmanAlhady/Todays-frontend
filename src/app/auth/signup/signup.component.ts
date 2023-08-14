import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomvalidationService } from '../customvalidation.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  constructor(
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService
  ) {}
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
    gender: ['',Validators.compose([Validators.required])],
  });
  switchToSignin(){}
  signup(){}
}