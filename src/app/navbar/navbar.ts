import { Component, OnInit } from '@angular/core';
import { RouterModule } from "@angular/router";
import { CookieService } from 'ngx-cookie-service';
import { ToolsService } from '../services/tool';
import { SignUp } from '../sign-up/sign-up';
import { SignIn } from '../sign-in/sign-in';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, SignIn, SignUp],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  constructor(private cookie: CookieService, private tool: ToolsService) {}

  public isSignShow: boolean = false;
  public isRegisterShow: boolean = false;
  public isLoggedIn: boolean = false;
  public userImg: string = '';
  public userName: string = '';

  ngOnInit(): void {
    const saved = this.cookie.get('userInfo');
    if (saved && this.cookie.get('user')) {
      try {
        const info = JSON.parse(saved);
        this.isLoggedIn = true;
        this.userImg = info.avatar;
        this.userName = info.firstName;
      } catch (e) {
        document.cookie = 'user=; Max-Age=0; path=/;';
        document.cookie = 'user=; Max-Age=0;';
        document.cookie = 'userInfo=; Max-Age=0; path=/;';
        document.cookie = 'userInfo=; Max-Age=0;';
      }
    }

    this.tool.isSignedIn.subscribe((loggedIn: boolean) => {
      this.isLoggedIn = loggedIn;
    });

    this.tool.isSignShow.subscribe((show: boolean) => {
      this.isSignShow = show;
    });

    this.tool.isRegistered.subscribe((show: boolean) => {
      this.isRegisterShow = show;
    });

    this.tool.userNavbarInfo.subscribe((data: any) => {
      if (data) {
        this.userImg = data.avatar;
        this.userName = data.firstName;
        this.isLoggedIn = true;
      } else {
        this.userImg = '';
        this.userName = '';
        this.isLoggedIn = false;
      }
    });
  }

  signInForm() {
    this.tool.isSignShow.next(true);
    this.tool.isRegistered.next(false);
  }

  signOut() {
    document.cookie = 'user=; Max-Age=0; path=/;';
    document.cookie = 'user=; Max-Age=0;';
    document.cookie = 'userInfo=; Max-Age=0; path=/;';
    document.cookie = 'userInfo=; Max-Age=0;';

    this.isLoggedIn = false;
    this.userImg = '';
    this.userName = '';

    this.tool.isSignedIn.next(false);
    this.tool.userNavbarInfo.next(null);
    this.tool.isCartActive.next(false);
  }

  showRegister() {
    this.tool.isSignShow.next(false);
    this.tool.isRegistered.next(true);
  }

  closeForm(close: boolean) {
    this.isSignShow = close;
  }

  closeRegister(close: boolean) {
    this.isRegisterShow = close;
  }

  loggedIn(logg: boolean) {
    this.isLoggedIn = logg;
  }
}