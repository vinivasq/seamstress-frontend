import { Component, OnInit } from '@angular/core';
import {
  AbstractControlOptions,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { MatchFields } from 'src/helpers/MatchFields';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  formOptions: AbstractControlOptions = {
    validators: MatchFields.MustMatch('password', 'passwordMatch'),
  };

  get form(): any {
    return this.formGroup.controls;
  }

  formGroup = this._formBuilder.group(
    {
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', Validators.required, Validators.email],
      password: ['', Validators.required],
      passwordMatch: ['', Validators.required],
    },
    this.formOptions
  );

  constructor(private _formBuilder: FormBuilder) {}

  ngOnInit() {}
}
