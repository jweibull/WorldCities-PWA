import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { Router } from "@angular/router";
import { Observable, of } from 'rxjs';
import { User } from '../../services/user-services/user';
import { UserService } from '../../services/user-services/user-service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  title: string = "New User Registration";
  form!: FormGroup;

  constructor(private router: Router, private fb: FormBuilder, private userService: UserService) { }

    ngOnInit(): void {
      // initialize the form
      this.createForm();
    }

    createForm() {
        this.form = this.fb.group({
            displayName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            passwordConfirm: ['', [Validators.required], this.isSamePassword()],
        });
    }


  onSubmit() {
    // build a temporary user object from form values
    let tempUser = <User>{};
    tempUser.username = this.form.get('email')?.value;
    tempUser.email = this.form.get('email')?.value;
    tempUser.password = this.form.get('password')?.value;
    tempUser.displayName = this.form.get('displayName')?.value;
    console.log(JSON.stringify(tempUser));
    this.userService.put(tempUser).subscribe({
      next: res => {
        if (res) {
          //let v = res;
          //console.log("User " + v.username + " has been created.");
          // redirect to login page
          this.router.navigate(["login"]);
        } else {
          // registration failed
          //console.log("registration failed");
          this.form.setErrors({"register": "User registration failed."});
        }
      },
      error: err => {
        console.log(err);
      }
    });
  }

  onBack() {
    this.router.navigate(["/"]);
  }

  isSamePassword(): ValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      const password: string = this.form.get('password')?.value;
      const passConfirm: string = this.form.get('passwordConfirm')?.value;
      if (password !== passConfirm)
      {
        return of<{ [key: string]: any }>({ notSame: true });
      }
      return of<null>(null);
    }
  }
}
