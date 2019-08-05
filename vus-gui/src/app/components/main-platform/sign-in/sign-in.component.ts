import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'vus-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  public signInFormGroup: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.signInFormGroup = fb.group({
      email: new FormControl('', Validators.compose([
        Validators.email,
        Validators.required
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required
      ]))
    });
  }

  ngOnInit() {
  }

  public navigateToSignup(): void {
    this.router.navigateByUrl('/sign-up');
  }

  public resetEmail(): void {
    this.signInFormGroup.get('email').setValue('');
  }

  public resetPassword(): void {
    this.signInFormGroup.get('password').setValue('');
  }

  public signInFormSubmit(): void {
    console.log(this.signInFormGroup.value);
  }
}
