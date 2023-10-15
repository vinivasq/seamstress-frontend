import { Component, OnInit } from '@angular/core';
import {
  AbstractControlOptions,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserRegister } from 'src/app/models/identity/UserRegister';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UserService } from 'src/app/services/user.service';
import { MatchFields } from 'src/helpers/MatchFields';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  user = {} as UserRegister;

  formOptions: AbstractControlOptions = {
    validators: MatchFields.MustMatch('password', 'passwordMatch'),
  };

  get form(): any {
    return this.formGroup.controls;
  }

  formGroup = this._formBuilder.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      passwordMatch: ['', Validators.required],
    },
    this.formOptions
  );

  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _router: Router,
    private _toastr: ToastrService,
    private _spinner: SpinnerService
  ) {}

  ngOnInit() {}

  public register() {
    this._spinner.isLoading = true;

    this.user = { ...this.formGroup.getRawValue() };

    this._userService.register(this.user).subscribe({
      next: () => this._router.navigateByUrl('/dashboard'),
      error: () => this._toastr.error('Não foi possível registrar'),
      complete: () => (this._spinner.isLoading = false),
    });
  }
}
