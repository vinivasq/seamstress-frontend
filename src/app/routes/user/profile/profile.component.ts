import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UserService } from 'src/app/services/user.service';
import { MatchFields } from 'src/helpers/MatchFields';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  formOptions: AbstractControlOptions = {
    validators: MatchFields.MustMatch('newPassword', 'confirmPassword'),
  };

  formGroup = this._formBuilder.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    this.formOptions
  );

  get form(): any {
    return this.formGroup.controls;
  }

  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _toastr: ToastrService,
    private _spinner: SpinnerService
  ) {}

  ngOnInit() {}

  changePassword(): void {
    this._spinner.isLoading = true;

    const { currentPassword, newPassword } = this.formGroup.getRawValue();

    this._userService
      .changePassword({ currentPassword: currentPassword!, newPassword: newPassword! })
      .subscribe({
        next: () => {
          this._toastr.success('Senha alterada com sucesso', 'Sucesso');
          this.formGroup.reset();
        },
        error: (error) => {
          console.log(error);
          this._toastr.error('Não foi possível alterar a senha', 'Erro');
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }
}
