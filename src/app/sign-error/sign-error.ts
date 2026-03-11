import { Component, OnInit } from '@angular/core';
import { ToolsService } from '../services/tool';

@Component({
  selector: 'app-sign-error',
  imports: [],
  templateUrl: './sign-error.html',
  styleUrl: './sign-error.css',
})
export class SignError implements OnInit {
  constructor(private tools: ToolsService) {}

  public isShown: boolean = false;

  ngOnInit(): void {
    this.tools.isErrSMS.subscribe((info: boolean) => {
      this.isShown = info;
    });
  }

  outSide(e: any) {
    if (e.target.classList.contains('notAccountErr')) {
      this.tools.isErrSMS.next(false);
    }
  }

  closeErr() {
    this.tools.isErrSMS.next(false);
  }

  signIn() {
    this.tools.isErrSMS.next(false);
    this.tools.isSignShow.next(true);
  }

  register() {
    this.tools.isErrSMS.next(false);
    this.tools.isRegistered.next(true);
  }
}