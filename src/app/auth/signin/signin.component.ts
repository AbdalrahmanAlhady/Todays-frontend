import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomvalidationService } from '../customvalidation.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent {
  backendError:string = '';
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
    password: [
      '',
      Validators.compose([
        Validators.required
      ]),
    ],
  });
  constructor(
    private formBuilder: FormBuilder,
    private customValidator: CustomvalidationService,
    private authService: AuthService,
    private router: Router,
  ) {}
  switchToSignup() {
    this.router.navigate(['/signup'])
  }
  signin(formData: { email: string; password: string }) {
    this.authService.signin(formData.email,formData.password).subscribe({
      next: (res) => {
        if (res.body?.token) {
          localStorage.setItem('userToken',JSON.stringify(res.body.token!)!);
          this.authService.userToken.next(res.body?.token);
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.backendError = error.error.message 
      },
    });
  }
}
