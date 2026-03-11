import { Component, EventEmitter, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiArea } from '../services/api-area';
import { ToolsService } from '../services/tool';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css'],
})
export class SignIn {
  constructor(
    private api: ApiArea,
    private tools: ToolsService,
    private cookie: CookieService,
  ) {}

  @Output() closeEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() changeEmit: EventEmitter<boolean> = new EventEmitter();
  @Output() loggedEmit: EventEmitter<boolean> = new EventEmitter();

  public errorSMS: string | undefined;
  public errAlert: boolean = false;
  public successLogin: boolean = false;

  protected signInForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', Validators.required),
  });

  signIn() {
    this.api.signIn(this.signInForm.value).subscribe({
      next: (data: any) => {

        // ✅ Set cookies consistently with SameSite: Lax (no path argument)
        this.cookie.set('user', data.access_token, { expires: 1, sameSite: 'Lax' });
        this.errAlert = false;
        this.successLogin = true;

        this.api.profileInfo().subscribe((profile: any) => {
          const userInfo = {
            firstName: profile.firstName,
            avatar: profile.avatar,
          };
          this.tools.userNavbarInfo.next(userInfo);
          this.cookie.set('userInfo', JSON.stringify(userInfo), { expires: 1, sameSite: 'Lax' });
        });

        setTimeout(() => {
          this.closeEmit.emit(false);
          this.loggedEmit.emit(true);
        }, 1000);
      },
      error: (err) => {
        this.errorSMS = err.error.error;
        this.errAlert = true;
      },
    });
  }

  closeForm() {
    this.closeEmit.emit(false);
  }

  outSide(event: any) {
    if (event.target.classList.contains('signArea')) {
      this.closeEmit.emit(false);
    }
  }

  change() {
    this.changeEmit.emit(true);
  }
}