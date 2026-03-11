import { ApiArea } from '../services/api-area';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Component, EventEmitter,  Output } from '@angular/core';

@Component({
  selector: 'app-sign-up',
  imports: [ReactiveFormsModule],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp {
constructor(private service:ApiArea){}
@Output() closeEmit:EventEmitter<boolean>=new EventEmitter();
  errAlert: boolean = false;
  successRegister: boolean = false;
  errorList: any[] = [];
 protected signUpForm: FormGroup = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    age: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(7),
    ]),
    address: new FormControl('', Validators.required),
    phone: new FormControl('+995', [
      Validators.required,
      Validators.minLength(9),
    ]),
    zipcode: new FormControl('', Validators.required),
    avatar: new FormControl('', Validators.required),
    gender: new FormControl('', Validators.required),
  });

signUp() {
    this.service.register(this.signUpForm.value).subscribe({
      next: (data: any) => {
        console.log(data);
        this.errAlert = false;
        this.successRegister = true;

        if (this.successRegister) {
          setTimeout(() => {
            this.closeEmit.emit(false);
          }, 1000);
        }
      },
      error: (err) => {
        console.log(err.error.errorKeys);
        this.errorList = err.error.errorKeys;
      },
    });
  }
closeForm(event: MouseEvent) {
  this.closeEmit.emit(false);

}

everyWhere(event: MouseEvent) {
  if ((event.target as HTMLElement).classList.contains('signArea')) {
    this.closeEmit.emit(false);
  }
}
  }

