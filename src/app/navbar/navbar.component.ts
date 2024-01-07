import { Component, DoCheck, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../shared/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, DoCheck {
  user!: User;
  isAuth: boolean = false;
  constructor(private authService: AuthService,private router:Router) {}
  ngOnInit(): void {
    this.isAuthorized();
  }
  ngDoCheck(): void {
    if (!this.isAuth) {
      this.isAuthorized;
    }
  }
  isAuthorized() {
    this.authService
      .getUser(this.authService.getCurrentUserId())
      .subscribe((res) => {
        this.user = res.body!.user;
      });
    this.isAuth = this.authService.isUserAuthorized();
  }
  toProfile(){
this.router.navigate(['/profile'])
  }
}
