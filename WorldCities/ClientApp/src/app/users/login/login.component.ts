import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthorizeService } from "../../services/auth-services/authorize.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  title: string = "User Login";;
  form!: FormGroup;
  returnUrl: string = "/";
  constructor(private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder,
              private authService: AuthorizeService) {
  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    // initialize the form
     this.createForm();
  }

  createForm() {
      this.form = this.fb.group({
          username: ['', [Validators.required], null],
          password: ['', [Validators.required], null]
      });
  }

  onSubmit() {
    let username = this.form.get('username')?.value;
    let password = this.form.get('password')?.value;
    this.authService.login(username, password).subscribe({
      next: res => {
        // login successful
        // outputs the login info through a JS alert.
        // IMPORTANT: remove this when test is done.
        /*alert("Login successful! " + "USERNAME: " + username + " TOKEN: " + this.authService.getAuth()!.token);*/
        this.router.navigateByUrl(this.returnUrl);
      }, error: err => {
        // login failed
        console.log(err)
        this.form.setErrors({"auth": "Incorrect username or password"});
      }
    });
  }

  onBack() {
    this.router.navigate(["/"]);
  }

  // retrieve a FormControl
  getFormControl(name: string) {
    return this.form.get(name);
  }

  // returns TRUE if the FormControl is valid
  isValid(name: string) {
    var e = this.getFormControl(name);
    return e && e.valid;
  }

  // returns TRUE if the FormControl has been changed
  isChanged(name: string) {
    var e = this.getFormControl(name);
    return e && (e.dirty || e.touched);
  }

  // returns TRUE if the FormControl is invalid after user changes
  hasError(name: string) {
    var e = this.getFormControl(name);
    return e && (e.dirty || e.touched) && !e.valid;
  }
}
