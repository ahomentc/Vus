import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'vus-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  public signUpFormGroup: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.signUpFormGroup = fb.group({
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

  public resetEmail(): void {
    this.signUpFormGroup.get('email').setValue('');
  }

  public resetPassword(): void {
    this.signUpFormGroup.get('password').setValue('');
  }

  public signUpFormSubmit(): void {
    console.log(this.signUpFormGroup.value);
  }
}
